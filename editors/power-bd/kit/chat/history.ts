/**
 * What changed in the BD space, and who changed a record, for the chat. The
 * reactor's own tools read what a record says now; these read when records
 * were added and changed, and a record's operations: who, when and what.
 * Pure: the records and operations come in, the rows the model reads go out.
 *
 * Confidential items stay out of the chat (K3): an operation that added one
 * keeps its time and author here, and its text is withheld.
 */
import { WITHHELD_NOTE } from "./redact.js";

/** Each kind of record in the team's words. */
const KINDS: Record<string, string> = {
  "powerbd/lead": "lead",
  "powerbd/opportunity": "funding opportunity",
  "powerbd/contact": "organisation",
  "powerbd/decision": "company decision",
  "powerbd/proposal": "proposal",
  "powerbd/investor-list": "investor list",
  "powerbd/playbook": "playbook",
  "powerbd/settings": "settings",
  "powerbd/market": "market",
  "powerhouse/document-drive": "the BD space",
};

/** A kind of record in the team's words; its type when it has none. */
export const kindOf = (documentType: string) => KINDS[documentType] ?? documentType;

/** What the space knows of one record (or of the space itself). */
export interface RecordFacts {
  documentId: string;
  documentType: string;
  /** Its title from its state, or the name it is filed under. */
  title: string;
  createdAt: string;
  lastChangedAt: string;
  /** How many changes its history holds (the global scope's revision). */
  revision: number;
}

/** An operation as the reactor keeps it; only what the history reads. */
export interface OperationLike {
  index: number;
  timestampUtcMs: string;
  error?: string;
  deniedReason?: string;
  action: {
    type: string;
    input: unknown;
    context?: { signer?: { user?: { address?: string }; app?: { name?: string } } };
  };
}

/** The operations whose input holds a confidential item's text. */
const CONFIDENTIAL_INPUTS = new Set(["ADD_CONFIDENTIAL_ITEM"]);

/** Longest text kept in a change's details; the rest is cut. */
export const MAX_DETAIL_CHARS = 300;
/** Most list entries kept in a change's details. */
export const MAX_DETAIL_ITEMS = 20;
/** Deepest a change's details are followed. */
const MAX_DETAIL_DEPTH = 4;

/** A time the reactor gives (ISO, or milliseconds as text) as ISO; unreadable ones as they are. */
export function isoTime(value: string): string {
  const ms = /^\d+$/.test(value) ? Number(value) : Date.parse(value);
  return Number.isNaN(ms) ? value : new Date(ms).toISOString();
}

/** A `since` the model passed (an ISO date or date-time) in milliseconds, or why it is not one. */
export function parseSince(since: unknown): { ms: number | undefined } | { problem: string } {
  if (since === undefined || since === null || since === "") return { ms: undefined };
  const ms = typeof since === "string" ? Date.parse(since) : Number.NaN;
  return Number.isNaN(ms)
    ? { problem: `since must be an ISO date such as 2026-11-18, or a date-time; got ${JSON.stringify(since)}` }
    : { ms };
}

export interface RecentChangesQuery {
  /** Only records added or changed at or after this time. */
  sinceMs?: number;
  /** Only records of this type, e.g. powerbd/lead. */
  documentType?: string;
  /** Most rows to give. */
  limit: number;
}

/** The space's records, the most recently changed first, with when each was added. */
export function recentChanges(records: readonly RecordFacts[], query: RecentChangesQuery) {
  const { sinceMs, documentType, limit } = query;
  const at = (iso: string) => Date.parse(iso);
  const matching = records
    .filter((r) => documentType === undefined || r.documentType === documentType)
    .filter((r) => sinceMs === undefined || at(r.lastChangedAt) >= sinceMs || at(r.createdAt) >= sinceMs)
    .toSorted((a, b) => at(b.lastChangedAt) - at(a.lastChangedAt) || a.title.localeCompare(b.title));
  return {
    ...(sinceMs !== undefined ? { since: new Date(sinceMs).toISOString() } : {}),
    matching: matching.length,
    records: matching.slice(0, limit).map((r) => ({
      documentId: r.documentId,
      kind: kindOf(r.documentType),
      title: r.title,
      createdAt: r.createdAt,
      lastChangedAt: r.lastChangedAt,
      changes: r.revision,
      ...(sinceMs !== undefined ? { addedSince: at(r.createdAt) >= sinceMs } : {}),
    })),
  };
}

/** A value cut to what the model needs: long text and long lists shortened. */
export function trimDetails(value: unknown, depth = 0): unknown {
  if (typeof value === "string")
    return value.length > MAX_DETAIL_CHARS
      ? `${value.slice(0, MAX_DETAIL_CHARS)}… (${value.length - MAX_DETAIL_CHARS} more characters)`
      : value;
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DETAIL_DEPTH) return "…";
  if (Array.isArray(value)) {
    const kept = value.slice(0, MAX_DETAIL_ITEMS).map((v) => trimDetails(v, depth + 1));
    return value.length > MAX_DETAIL_ITEMS ? [...kept, `… ${value.length - MAX_DETAIL_ITEMS} more`] : kept;
  }
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, trimDetails(v, depth + 1)]));
}

/** One change in a record's history, as the model reads it. */
export interface HistoryRow {
  at: string;
  /** The operation, e.g. SET_NEXT_STEP. */
  change: string;
  /** The team member who made it, by name; null when the signer is not on the team, or nobody signed. */
  by: string | null;
  /** The signing address; null when nobody signed. */
  signer: string | null;
  /** The app it was made through, when the signature names one. */
  via: string | null;
  details: unknown;
  /** Why the change did not take effect, when it did not. */
  refused?: string;
}

/** A record's operations as history rows, the newest first, with names from the team list. */
export function historyRows(
  operations: readonly OperationLike[],
  nameFor: (address: string) => string | undefined,
): HistoryRow[] {
  return operations
    .toSorted((a, b) => b.index - a.index)
    .map((op) => {
      const signer = op.action.context?.signer;
      const address = signer?.user?.address || null;
      const refusal = op.error || op.deniedReason;
      return {
        at: isoTime(op.timestampUtcMs),
        change: op.action.type,
        by: address ? (nameFor(address) ?? null) : null,
        signer: address,
        via: signer?.app?.name || null,
        details: CONFIDENTIAL_INPUTS.has(op.action.type)
          ? { withheld: 1, note: WITHHELD_NOTE }
          : trimDetails(op.action.input),
        ...(refusal ? { refused: refusal } : {}),
      };
    });
}
