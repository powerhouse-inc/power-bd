import { useEffect, useId, useRef, useState } from "react";
import {
  GROUP_CAP,
  itemIds,
  moveActive,
  noResultsLine,
  paletteSections,
  queryWords,
  type Entry,
  type Item,
  type QuickAction,
} from "../../kit/search/index.js";
import { Icon } from "../Icon.js";
import { ErrorLine } from "../shared/ErrorLine.js";
import { SEARCH_PROVIDERS, useProviderGroups } from "./providers.js";
import { SearchResult } from "./SearchResult.js";
import { useSearchEntries } from "./useSearchEntries.js";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Opens a result; the palette closes. */
  onOpen: (entry: Entry) => void;
  /** Starts a quick action; resolves to whether it worked. The palette closes when it did. */
  onAction: (action: QuickAction) => Promise<boolean>;
  /** Why the last quick action failed, if it did. */
  error: string | null;
}

/**
 * Search over the app (`.pb-palette`): a dialog that opens from the top bar's
 * field or the shortcut. Escape closes it and focus returns to where it was.
 */
export function SearchPalette({ open, ...rest }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="pb-palette"
      aria-label="Search"
      onClose={rest.onClose}
      // A press on the backdrop lands on the dialog itself.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) rest.onClose();
      }}
    >
      {open && <PaletteBody {...rest} />}
    </dialog>
  );
}

/** The field and the results. Mounted only while the palette is open, so each opening starts empty. */
function PaletteBody({ onClose, onOpen, onAction, error }: Omit<Props, "open">) {
  const listId = useId();
  const entries = useSearchEntries();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const extra = useProviderGroups(SEARCH_PROVIDERS, query);

  const sections = paletteSections({ entries, query, expanded, extra });
  const ids = itemIds(sections);
  const words = queryWords(query);
  // Enter always has somewhere to go: the first result until another is picked.
  const current = active !== null && ids.includes(active) ? active : ids.at(0);

  useEffect(() => {
    if (current)
      document.getElementById(current)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const choose = (item: Item) => {
    if (busy) return;
    if (item.type === "result") {
      onOpen(item.hit.entry);
      onClose();
    } else if (item.type === "more") {
      const all = [...expanded, item.group];
      setExpanded(all);
      // Stay where the list grew: on the first result that was hidden.
      const grown = paletteSections({ entries, query, expanded: all, extra });
      setActive(
        grown.find((s) => s.id === item.group)?.items.at(GROUP_CAP)?.id ?? null,
      );
    } else {
      setBusy(true);
      void onAction(item.action).then((done) => {
        setBusy(false);
        if (done) onClose();
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const item = sections
        .flatMap((s) => s.items)
        .find((i) => i.id === current);
      if (item) choose(item);
      return;
    }
    const next = moveActive(sections, current ?? null, e.key);
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
  };

  const none = sections.length === 0 ? noResultsLine(query) : null;
  const results = ids.length;

  return (
    <>
      <div className="pb-palette__field">
        <Icon name="search" />
        <input
          className="pb-palette__input"
          type="text"
          enterKeyHint="search"
          role="combobox"
          aria-label="Search leads, funding opportunities, organisations, people, investors, proposals, decisions and the playbook"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={current}
          placeholder="Search by name, organisation, person, next step, code…"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setExpanded([]);
            setActive(null);
          }}
          onKeyDown={onKeyDown}
        />
        <span className="pb-kbd" aria-hidden="true">
          Esc
        </span>
      </div>
      {error && (
        <div className="pb-palette__error">
          <ErrorLine message={error} />
        </div>
      )}
      <div
        className="pb-palette__list"
        id={listId}
        role="listbox"
        aria-label={words.length > 0 ? "Results" : "Recent and quick actions"}
        aria-busy={busy}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            className="pb-palette__group"
            role="group"
            aria-labelledby={`${listId}-${section.id}`}
          >
            <div className="pb-palette__label" id={`${listId}-${section.id}`}>
              {section.label}
            </div>
            {section.items.map((item) => (
              <SearchResult
                key={item.id}
                item={item}
                words={words}
                active={item.id === current}
                onPoint={() => setActive(item.id)}
                onChoose={() => choose(item)}
              />
            ))}
          </div>
        ))}
        {none && (
          <div className="pb-palette__none" role="status">
            <Icon name="search" />
            <div className="pb-palette__none-title">{none.title}</div>
            <p>{none.text}</p>
          </div>
        )}
      </div>
      {words.length > 0 && !none && (
        <div className="pb-palette__count" role="status">
          {results} {results === 1 ? "result" : "results"}
        </div>
      )}
      <div className="pb-palette__foot">
        <p className="pb-reassure">
          <Icon name="lock" />
          Confidential items are never searched or shown here.
        </p>
        <span className="pb-palette__keys" aria-hidden="true">
          <span>
            <span className="pb-kbd">↑</span>
            <span className="pb-kbd">↓</span>
            Move
          </span>
          <span>
            <span className="pb-kbd">↵</span>
            Open
          </span>
        </span>
      </div>
    </>
  );
}
