import { useId, useState, type FocusEvent, type KeyboardEvent } from "react";
import {
  activeIndex,
  moveIndex,
  pickerPhase,
  typedNote,
  type PickerOption,
  type VaultNote,
} from "../../kit/vault/index.js";
import { Icon } from "../Icon.js";
import { useVaultDriveId, useVaultSearch } from "./useVault.js";
import { noteStore } from "./vault.js";

/** One result: the note's title, what it says, and its kind (or that it is linked already). */
function OptionRow({
  id,
  option,
  active,
  onPoint,
  onChoose,
}: {
  id: string;
  option: PickerOption;
  active: boolean;
  onPoint: () => void;
  onChoose: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      aria-disabled={option.linked || undefined}
      className={`pb-picker__option${option.linked ? " is-linked" : ""}`}
      onMouseMove={active ? undefined : onPoint}
      onClick={onChoose}
    >
      <Icon name={option.icon} />
      <span className="pb-picker__main">
        <span className="pb-picker__title">{option.title}</span>
        {option.description && (
          <span className="pb-picker__desc">{option.description}</span>
        )}
      </span>
      <span className="pb-picker__kind">
        {option.linked ? (
          <>
            <Icon name="check" className="pb-icon pb-icon--xs" />
            Linked
          </>
        ) : (
          option.kind
        )}
      </span>
    </div>
  );
}

/**
 * Finds a note in the vault named in Settings (`.pb-picker`): a search field
 * whose results show each note's title, description and kind. Typing the
 * note's id and title is the fallback: offered with the reason when the vault
 * can't be searched, and on request under the results. `onPick` gets the note
 * and a `clear` to call once it was linked.
 */
export function VaultNotePicker({
  label,
  linked,
  disabled,
  onPick,
}: {
  /** The field's name, for the controls' labels. */
  label: string;
  /** Notes already linked here: listed, not offered again. */
  linked: readonly string[];
  disabled?: boolean;
  onPick: (note: VaultNote, clear: () => void) => void;
}) {
  const listId = useId();
  const vaultDriveId = useVaultDriveId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [typing, setTyping] = useState(false);
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const last = useVaultSearch(vaultDriveId, query);
  const phase = pickerPhase({ vaultDriveId, query, last, linked });

  const options =
    phase.phase === "found" || phase.phase === "searching" ? phase.options : [];
  const listOpen = open && options.length > 0;
  const current = activeIndex(options, active);
  const why = phase.phase === "unavailable" ? phase.why : null;
  const typed = typedNote(id, title);

  const pick = (option: PickerOption) => {
    if (option.linked || disabled) return;
    if (vaultDriveId) noteStore.prime(vaultDriveId, option);
    onPick({ id: option.id, title: option.title }, () => {
      setQuery("");
      setActive(-1);
      setOpen(false);
    });
  };
  const addTyped = () => {
    if (!typed || disabled) return;
    onPick(typed, () => {
      setId("");
      setTitle("");
      setTyping(false);
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (!listOpen) return;
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "Enter") {
      // Enter links the filled option: the first note that can be linked until the arrows move.
      const option = current >= 0 ? options[current] : undefined;
      if (!listOpen || !option) return;
      e.preventDefault();
      pick(option);
      return;
    }
    const next = moveIndex(options.length, current, e.key);
    if (next === undefined) return;
    e.preventDefault();
    setOpen(true);
    setActive(next);
  };

  /** The results stay open while focus moves within them (Tab reaches "Type an id instead"). */
  const onFieldBlur = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget;
    if (next instanceof Node && e.currentTarget.contains(next)) return;
    setOpen(false);
  };

  return (
    <div className="pb-picker">
      {vaultDriveId && (
        <div className="pb-picker__field" onBlur={onFieldBlur}>
          <div className="pb-input-wrap">
            <Icon name="search" />
            <input
              className="pb-input"
              type="text"
              role="combobox"
              aria-label={`${label}: search the vault`}
              aria-expanded={listOpen}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                listOpen && current >= 0 ? `${listId}-${current}` : undefined
              }
              placeholder="Search notes in the vault…"
              autoComplete="off"
              spellCheck={false}
              value={query}
              disabled={disabled}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(-1);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
            />
          </div>
          {listOpen && (
            <div
              className="pb-popover pb-picker__list"
              // Keeps focus in the field, so a click picks and Escape still works.
              onMouseDown={(e) => e.preventDefault()}
            >
              <div
                className="pb-picker__options"
                id={listId}
                role="listbox"
                aria-label="Notes in the vault"
                aria-busy={phase.phase === "searching"}
              >
                {options.map((o, i) => (
                  <OptionRow
                    key={o.id}
                    id={`${listId}-${i}`}
                    option={o}
                    active={i === current}
                    onPoint={() => setActive(i)}
                    onChoose={() => pick(o)}
                  />
                ))}
              </div>
              <div className="pb-picker__foot">
                <p className="pb-reassure">
                  <Icon name="shield" />
                  Linking a note changes nothing in the vault.
                </p>
                <button
                  type="button"
                  className="pb-picker__switch"
                  onClick={() => {
                    setTyping(true);
                    setOpen(false);
                  }}
                >
                  Type an id instead
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {open && phase.phase === "searching" && options.length === 0 && (
        <span className="pb-picker__status" role="status">
          Searching the vault…
        </span>
      )}
      {phase.phase === "none" && (
        <span className="pb-picker__status" role="status">
          {phase.line}
          {!typing && (
            <button
              type="button"
              className="pb-picker__switch"
              onClick={() => setTyping(true)}
            >
              Type its id instead
            </button>
          )}
        </span>
      )}
      {(typing || why) && (
        <div className="pb-picker__typed">
          {why && (
            <p className="pb-picker__why" role="status">
              <Icon name="info" className="pb-icon pb-icon--xs" />
              {why}
            </p>
          )}
          <div className="pb-row">
            <input
              className="pb-input pb-flex-1 pb-minw-180"
              placeholder="Note's id in the vault"
              aria-label={`${label}: note id`}
              // Asked for by the reader, so focus goes where they will type; never on page load.
              autoFocus={typing && !why}
              value={id}
              disabled={disabled}
              onChange={(e) => {
                setId(e.target.value);
                setTyping(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTyped();
              }}
            />
            <input
              className="pb-input pb-flex-1 pb-minw-180"
              placeholder="Note's title"
              aria-label={`${label}: note title`}
              value={title}
              disabled={disabled}
              onChange={(e) => {
                setTitle(e.target.value);
                setTyping(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTyped();
              }}
            />
            <button
              type="button"
              className="pb-btn pb-btn--sm"
              disabled={disabled || !typed}
              onClick={addTyped}
            >
              <Icon name="plus" />
              Link note
            </button>
            {typing && !why && (
              <button
                type="button"
                className="pb-btn pb-btn--ghost pb-btn--sm"
                onClick={() => {
                  setTyping(false);
                  setId("");
                  setTitle("");
                }}
              >
                Search instead
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
