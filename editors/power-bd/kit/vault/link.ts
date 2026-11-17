/**
 * How a linked note shows: the title the vault gives it today, the title it
 * was linked with while the vault is asked, or unavailable with a short reason
 * when it can't be read. And whether it can be opened from here. Pure.
 *
 * The title read from the vault is never written back to the record: the
 * stored title stays as it was linked, and only the page shows today's.
 */
import type { IconName } from "../../../../design-system/icons.js";
import type { LookupResult } from "./client.js";
import { UNAVAILABLE, type Unavailable, type VaultNote } from "./model.js";
import type { LookupEntry } from "./store.js";

export type LinkView =
  /** The vault is being asked: the title it was linked with shows. */
  | { state: "loading"; title: string }
  | {
      state: "live";
      title: string;
      /** The vault's title differs from the one the link was made with. */
      renamed: boolean;
      kind: string | null;
      description: string | null;
      icon: IconName;
    }
  | {
      state: "unavailable";
      /** The title the link was made with. */
      title: string;
      reason: Unavailable;
      why: string;
      icon: IconName;
    };

const unavailable = (note: VaultNote, reason: Unavailable): LinkView => ({
  state: "unavailable",
  title: note.title,
  reason,
  why: UNAVAILABLE[reason].why,
  icon: UNAVAILABLE[reason].icon,
});

function fromResult(note: VaultNote, result: LookupResult): LinkView {
  if (!result.ok) return unavailable(note, result.reason);
  if (!result.note) return unavailable(note, "missing");
  const { title, kind, description, icon } = result.note;
  return {
    state: "live",
    title: title ?? note.title,
    renamed: title !== null && title !== note.title,
    kind,
    description,
    icon,
  };
}

/** How `note` shows, given the vault named in Settings and what it said so far. */
export function linkView(
  note: VaultNote,
  vaultDriveId: string | null | undefined,
  entry: LookupEntry | undefined,
): LinkView {
  if (!vaultDriveId?.trim()) return unavailable(note, "no-vault");
  if (!entry) return { state: "loading", title: note.title };
  if (entry.status === "pending")
    return entry.previous
      ? fromResult(note, entry.previous)
      : { state: "loading", title: note.title };
  return fromResult(note, entry.result);
}

/** Why a note that can be read still can't be opened from here. */
export const OPEN_WHY = {
  notOpenHere:
    "The vault is not open in this browser, so the note can't be opened from here.",
  notListed:
    "The vault did not list this note, so it can't be opened from here.",
} as const;

/**
 * Whether a linked note opens in the vault app from here: only a note the
 * reader can read, in a vault open in this browser, once its place in the
 * vault is known. `why` is said only when it helps; an unavailable note
 * already says why.
 */
export function openPlan(
  view: LinkView,
  place: { drive: boolean; node: boolean },
): { can: boolean; why: string | null } {
  if (view.state !== "live") return { can: false, why: null };
  if (!place.drive) return { can: false, why: OPEN_WHY.notOpenHere };
  return { can: place.node, why: null };
}
