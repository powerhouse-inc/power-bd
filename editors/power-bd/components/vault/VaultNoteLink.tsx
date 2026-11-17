import type { ReactNode } from "react";
import type { LinkView, VaultNote } from "../../kit/vault/index.js";
import { Icon } from "../Icon.js";
import { useVaultLink } from "./useVault.js";

const iconOf = (view: LinkView) =>
  view.state === "loading" ? "note" : view.icon;

/** The link's tooltip: where it goes, and the title it was linked with when the vault's differs. */
const openTitle = (view: LinkView, note: VaultNote) =>
  view.state === "live" && view.renamed
    ? `Open in the vault. Linked as “${note.title}”.`
    : "Open in the vault";

/**
 * The quiet line under a linked note: what it is, or why it can't be read or
 * opened. While the vault is asked, a placeholder keeps the line's place, so
 * the row does not jump when the answer comes.
 */
function subLine(view: LinkView, why: string | null): ReactNode {
  if (view.state === "loading")
    return <span className="pb-skeleton pb-note__wait" aria-hidden="true" />;
  if (view.state === "unavailable")
    return (
      <span className="pb-list__sub pb-note__why">
        <Icon name={view.icon} className="pb-icon pb-icon--xs" />
        Unavailable · {view.why}
      </span>
    );
  const text = why ?? [view.kind, view.description].filter(Boolean).join(" · ");
  return text ? <span className="pb-list__sub">{text}</span> : null;
}

/**
 * A linked note as a list row (`.pb-note`): the vault's title today, as a link
 * that opens the note in the vault app; the title it was linked with while
 * the vault is asked; or unavailable, with why. `end` holds the row's own
 * controls.
 */
export function VaultNoteRow({
  note,
  end,
}: {
  note: VaultNote;
  end?: ReactNode;
}) {
  const { view, link, why } = useVaultLink(note);
  const unavailable = view.state === "unavailable";
  return (
    <div
      className={`pb-list__item pb-note${unavailable ? " is-unavailable" : ""}`}
      aria-busy={view.state === "loading" || undefined}
    >
      <span className="pb-list__lead">
        <Icon name={iconOf(view)} />
      </span>
      <div className="pb-list__main">
        {link ? (
          <a
            {...link}
            className="pb-list__title pb-note__title"
            title={openTitle(view, note)}
          >
            <span className="pb-note__text">{view.title}</span>
            <Icon
              name="arrow-up-right"
              className="pb-icon pb-icon--xs pb-note__open"
            />
          </a>
        ) : (
          <span className="pb-list__title">{view.title}</span>
        )}
        {subLine(view, why)}
      </div>
      {end && <div className="pb-list__end">{end}</div>}
    </div>
  );
}

/**
 * A linked note as a chip (`.pb-ref`), for tables and rows of references:
 * the same states as `VaultNoteRow`, in one line. `kind` is the link's own
 * label (Research, Comparable…); `children` are the chip's controls.
 */
export function VaultNoteChip({
  note,
  kind,
  children,
}: {
  note: VaultNote;
  kind?: string;
  children?: ReactNode;
}) {
  const { view, link, why } = useVaultLink(note);
  const unavailable = view.state === "unavailable";
  return (
    <span
      className={`pb-ref${unavailable ? " is-unavailable" : ""}`}
      aria-busy={view.state === "loading" || undefined}
      title={unavailable ? `Unavailable: ${view.why}` : (why ?? undefined)}
    >
      <Icon name={iconOf(view)} />
      {link ? (
        <a {...link} className="pb-ref__title" title={openTitle(view, note)}>
          {view.title}
        </a>
      ) : (
        <span className="pb-ref__title">{view.title}</span>
      )}
      {kind && <span className="pb-ref__kind">{kind}</span>}
      {unavailable && <span className="pb-ref__why">{view.why}</span>}
      {children}
    </span>
  );
}
