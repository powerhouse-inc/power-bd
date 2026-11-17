/**
 * Notes in the vault as BD sees them: the link BD stores, what the vault says
 * about a note today, and why a note can't be read from here. Pure: it reads
 * the vault's answers, and asks nothing itself.
 */
import type { IconName } from "../../../../design-system/icons.js";

/** A link to a note in the vault, as BD stores it: the note's id and the title it had when it was linked. */
export interface VaultNote {
  id: string;
  title: string;
}

/** What the vault says about a note today. */
export interface NoteInfo {
  id: string;
  /** Null when the vault gives none. */
  title: string | null;
  description: string | null;
  /** The note's kind in the reader's words ("Reference", "Map"); null when the vault gives none. */
  kind: string | null;
  icon: IconName;
}

/** Why a note, or the vault itself, can't be read from here. */
export type Unavailable =
  | "no-vault"
  | "signed-out"
  | "forbidden"
  | "missing"
  | "unreachable"
  | "failed";

/** How a request to the vault can fail: the reasons a request itself can end with. */
export type RequestFailure = Exclude<Unavailable, "no-vault" | "missing">;

/** The short line a linked note shows when it can't be read, and its icon. */
export const UNAVAILABLE: Record<Unavailable, { why: string; icon: IconName }> =
  {
    "no-vault": { why: "No vault is chosen in Settings", icon: "info" },
    "signed-out": { why: "Sign in to read it", icon: "lock" },
    forbidden: { why: "You don't have access to it", icon: "lock" },
    missing: { why: "No longer in the vault", icon: "alert-circle" },
    unreachable: { why: "The vault can't be reached", icon: "cloud-off" },
    failed: { why: "The vault couldn't look it up", icon: "alert-circle" },
  };

/** Why the vault can't be searched, as one sentence. */
export const SEARCH_UNAVAILABLE: Record<
  Exclude<Unavailable, "missing">,
  string
> = {
  "no-vault": "No vault is chosen in Settings, so it can't be searched.",
  "signed-out": "Sign in to search the vault.",
  forbidden: "You don't have access to this vault, so it can't be searched.",
  unreachable: "The vault can't be reached right now.",
  failed: "The vault couldn't search just now.",
};

const MAP = "bai/moc";
const SOURCE = "bai/source";
const NOTE = "bai/knowledge-note";

/**
 * A note's kind in the reader's words: "REFERENCE" → "Reference",
 * "bug-pattern" → "Bug pattern". Every map is a map, whatever its tier, and a
 * source is a source. Null when the vault names no kind.
 */
export function kindLabel(
  noteType: string | null | undefined,
  documentType: string | null | undefined,
): string | null {
  const raw = (noteType ?? "").trim();
  if (documentType === MAP || /^moc\b/i.test(raw)) return "Map";
  if (documentType === SOURCE) return "Source";
  const words = raw
    .replace(/\(.*?\)/g, "")
    .replace(/[-_\s]+/g, " ")
    .trim()
    .toLowerCase();
  if (!words) return raw === "" && documentType === NOTE ? "Note" : null;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The icon a note's kind is drawn with. */
export function kindIcon(documentType: string | null | undefined): IconName {
  if (documentType === SOURCE) return "source";
  if (documentType === MAP) return "compass";
  return "note";
}

/** Whether a value read from an answer is an object with fields. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A value read from an answer as a list; null when it is not one. */
export const asList = (value: unknown): readonly unknown[] | null =>
  Array.isArray(value) ? (value as unknown[]) : null;

/** A text, trimmed; null when it is not a text or is empty. */
const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : null;

/** What the vault says about a note, read from one node of its graph; null when it is not a note. */
export function readNote(value: unknown): NoteInfo | null {
  if (!isRecord(value)) return null;
  const id = text(value.documentId);
  if (!id) return null;
  const documentType = text(value.documentType);
  return {
    id,
    title: text(value.title),
    description: text(value.description),
    kind: kindLabel(text(value.noteType), documentType),
    icon: kindIcon(documentType),
  };
}
