/**
 * The note picker's rules: when the vault is searched, what the list shows,
 * where the arrow keys go, and when typing a note's id is offered instead.
 * Pure: the search itself is the client's.
 */
import type { SearchResult } from "./client.js";
import {
  SEARCH_UNAVAILABLE,
  type NoteInfo,
  type Unavailable,
  type VaultNote,
} from "./model.js";

export const SEARCH_RULES = {
  /** Letters typed before the vault is asked. */
  minChars: 2,
  /** How long typing must rest before the picker asks, in milliseconds. */
  restMs: 250,
  /** Results the picker lists. */
  pickerLimit: 6,
  /** Results the ⌘K palette shows in its vault group. */
  paletteLimit: 5,
} as const;

/** What is sent for a query: trimmed, spaces collapsed; null while it is too short. */
export function searchText(query: string): string | null {
  const text = query.trim().replace(/\s+/g, " ");
  return text.length >= SEARCH_RULES.minChars ? text : null;
}

/** A result as the picker lists it. */
export interface PickerOption extends NoteInfo {
  title: string;
  /** Already linked here: listed, but not offered again. */
  linked: boolean;
}

export const UNTITLED = "Untitled note";

export function pickerOptions(
  hits: readonly NoteInfo[],
  linked: readonly string[],
): PickerOption[] {
  return hits.map((hit) => ({
    ...hit,
    title: hit.title ?? UNTITLED,
    linked: linked.includes(hit.id),
  }));
}

const TYPE_INSTEAD = "Type the note's id instead.";
const OR_TYPE_INSTEAD = "Or type the note's id instead.";

export type PickerPhase =
  /** Nothing typed yet, or too little. */
  | { phase: "idle" }
  /** Asking about what is typed now; `options` are the last answer's, listed meanwhile. */
  | { phase: "searching"; text: string; options: PickerOption[] }
  | { phase: "found"; text: string; options: PickerOption[] }
  | { phase: "none"; text: string; line: string }
  /** The vault can't be searched: typing the note's id is offered, with why. */
  | {
      phase: "unavailable";
      reason: Exclude<Unavailable, "missing">;
      why: string;
    };

/** Where the picker stands, from the vault named in Settings, what is typed and the last answer. */
export function pickerPhase(input: {
  vaultDriveId: string | null | undefined;
  query: string;
  last: { text: string; result: SearchResult } | null;
  linked: readonly string[];
}): PickerPhase {
  if (!input.vaultDriveId?.trim())
    return {
      phase: "unavailable",
      reason: "no-vault",
      why: `${SEARCH_UNAVAILABLE["no-vault"]} ${TYPE_INSTEAD}`,
    };
  const text = searchText(input.query);
  if (!text) return { phase: "idle" };
  const { last } = input;
  if (last?.text !== text)
    return {
      phase: "searching",
      text,
      options: last?.result.ok
        ? pickerOptions(last.result.hits, input.linked)
        : [],
    };
  const { result } = last;
  if (!result.ok)
    return {
      phase: "unavailable",
      reason: result.reason,
      why: `${SEARCH_UNAVAILABLE[result.reason]} ${OR_TYPE_INSTEAD}`,
    };
  if (result.hits.length === 0)
    return {
      phase: "none",
      text,
      line: `No note in the vault matches “${text}”.`,
    };
  return {
    phase: "found",
    text,
    options: pickerOptions(result.hits, input.linked),
  };
}

/**
 * Where a key moves the active option: down and up walk the list and wrap.
 * `undefined` for a key the field keeps (Home and End move the caret); -1
 * when there is nothing to be on.
 */
export function moveIndex(
  count: number,
  current: number,
  key: string,
): number | undefined {
  if (key !== "ArrowDown" && key !== "ArrowUp") return undefined;
  if (count === 0) return -1;
  if (key === "ArrowDown") return current >= count - 1 ? 0 : current + 1;
  return current <= 0 ? count - 1 : current - 1;
}

/**
 * The option Enter links, which is drawn filled: the one the arrow keys are
 * on, or else the first that is not linked yet. -1 when there is none.
 */
export function activeIndex(
  options: readonly PickerOption[],
  chosen: number,
): number {
  if (chosen >= 0 && chosen < options.length) return chosen;
  return options.findIndex((o) => !o.linked);
}

/** A note typed by hand: its id and title, both required. */
export function typedNote(id: string, title: string): VaultNote | null {
  const note = { id: id.trim(), title: title.trim() };
  return note.id && note.title ? note : null;
}
