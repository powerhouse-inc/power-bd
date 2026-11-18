/**
 * The chat's own read tools for the BD space's history: what was added or
 * changed lately, and who changed one record and how. The reactor's tools
 * read what a record says now, and the vault's history tools read only the
 * vault, so without these the agent could not say what is new.
 *
 * The reads go to the client that holds the space: its Switchboard for a
 * shared space, Connect for one kept in this browser (components/chat).
 */
import { z } from "zod";
import { recordTitle } from "../record-name/index.js";
import { answer, refused } from "./envelope.js";
import {
  historyRows,
  isoTime,
  kindOf,
  parseSince,
  recentChanges,
  type OperationLike,
  type RecordFacts,
} from "./history.js";
import type { ChatTool } from "./tools.js";

export const RECENT_CHANGES_TOOL = "getRecentChanges";
export const RECORD_HISTORY_TOOL = "getRecordHistory";

/**
 * Rows per answer. The stack's agent cuts a tool result past 12 000 characters
 * (`MAX_TOOL_RESULT_CHARS`); a changes row takes about 200, a history row up to
 * about 400, so the most asked for still fits whole.
 */
const RECENT = { default: 30, max: 50 };
const HISTORY = { default: 15, max: 30 };
/** Most records or operations read in one call. */
export const MAX_READ = 500;

/** Where the history is read from: the space, its records and their operations. */
export interface BdHistorySource {
  /** The BD space's own facts. */
  space: (signal?: AbortSignal) => Promise<RecordFacts>;
  /** Every record the space holds. */
  records: (signal?: AbortSignal) => Promise<RecordFacts[]>;
  /** A document's global operations from `sinceRevision` on. */
  operations: (documentId: string, sinceRevision: number, signal?: AbortSignal) => Promise<OperationLike[]>;
  /** A team member's name for an address, from Settings. */
  nameFor: (address: string) => string | undefined;
}

const signalOf = (context: unknown) =>
  (context as { signal?: AbortSignal } | undefined)?.signal;

/** A whole number from 1 to `max`, or `fallback` when none was given. */
function countOf(value: unknown, { default: fallback, max }: { default: number; max: number }) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(1, Math.floor(value)))
    : fallback;
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** The two history tools, reading `source` for the BD space `bdDriveId`. */
export function bdHistoryTools(source: BdHistorySource, bdDriveId: string): ChatTool[] {
  return [
    {
      name: RECENT_CHANGES_TOOL,
      description:
        "Power BD space — what was added or changed in the BD space, the most recently changed first: each record's kind, title, when it was added (createdAt), when it last changed (lastChangedAt) and how many changes it has had. THE tool for 'what is new', 'what was added', 'what changed this week' or 'since <date>': record lists carry no dates, so never infer recency from them. since keeps only records added or changed from then and marks those added since (addedSince); documentType narrows to one type, such as powerbd/lead. For who made a change and what it was, call getRecordHistory. It reads this BD space only; the vault's recent_changes reads the vault.",
      inputSchema: {
        since: z
          .string()
          .optional()
          .describe("ISO date or date-time, e.g. 2026-11-16; only records added or changed from then"),
        documentType: z.string().optional().describe("Only records of this type, e.g. powerbd/lead"),
        limit: z
          .number()
          .int()
          .optional()
          .describe(`Most records to return, newest first (default ${RECENT.default}, max ${RECENT.max})`),
      },
      annotations: { title: "What changed in the BD space", readOnlyHint: true, openWorldHint: false },
      callback: async (args, context) => {
        const since = parseSince(args.since);
        if ("problem" in since) return refused(since.problem);
        const documentType =
          typeof args.documentType === "string" && args.documentType !== "" ? args.documentType : undefined;
        try {
          const records = await source.records(signalOf(context));
          return answer(
            recentChanges(records, { sinceMs: since.ms, documentType, limit: countOf(args.limit, RECENT) }),
          );
        } catch (error) {
          return refused(`The BD space's records could not be read: ${messageOf(error)}`);
        }
      },
    },
    {
      name: RECORD_HISTORY_TOOL,
      description:
        "Power BD space — who changed one BD record, when, and what: its changes, the newest first, each with the time (at), the operation (change, e.g. SET_NEXT_STEP), the team member who made it by name (by), the signing address (signer), the app (via) and the change's details. by is null when the signer is not on the team list; signer is null too when nobody signed. Pass the BD space's own id for its history: records added, renamed, moved or removed. Confidential items' text is withheld. It reads this BD space only; for a vault document use document_history.",
      inputSchema: {
        documentId: z.string().describe("The BD record's id, or the BD space's id for its own history"),
        limit: z
          .number()
          .int()
          .optional()
          .describe(`Most changes to return, newest first (default ${HISTORY.default}, max ${HISTORY.max})`),
      },
      annotations: { title: "Who changed a BD record", readOnlyHint: true, openWorldHint: false },
      callback: async (args, context) => {
        const documentId = typeof args.documentId === "string" ? args.documentId : "";
        if (!documentId) return refused("getRecordHistory needs the documentId of a BD record");
        const signal = signalOf(context);
        const limit = countOf(args.limit, HISTORY);
        try {
          const target =
            documentId === bdDriveId
              ? await source.space(signal)
              : (await source.records(signal)).find((r) => r.documentId === documentId);
          if (!target)
            return refused(
              `${documentId} is not a record in this BD space. List its records with getDocuments; for a vault document use document_history.`,
            );
          const since = Math.max(0, target.revision - limit);
          const rows = historyRows(await source.operations(documentId, since, signal), source.nameFor);
          return answer({
            documentId,
            kind: kindOf(target.documentType),
            title: target.title,
            createdAt: target.createdAt,
            lastChangedAt: target.lastChangedAt,
            changes: target.revision,
            shown: Math.min(limit, rows.length),
            history: rows.slice(0, limit),
          });
        } catch (error) {
          return refused(`The history of ${documentId} could not be read: ${messageOf(error)}`);
        }
      },
    },
  ];
}

/** A document as a reactor client returns it; only what the history reads. */
export interface DocumentLike {
  header: {
    id: string;
    documentType: string;
    name: string;
    createdAtUtcIso: string;
    lastModifiedAtUtcIso?: string;
    /** Each scope's revision; a scope with no operations yet may be missing. */
    revision: Partial<Record<string, number>>;
  };
  state?: unknown;
}

interface PageLike<T> {
  results: T[];
  next?: () => Promise<PageLike<T>>;
}

/**
 * The reads the history needs, as both of the stack's clients offer them:
 * Connect's reactor client and the Switchboard's GraphQL client.
 */
export interface HistoryClient {
  get(identifier: string, view?: undefined, signal?: AbortSignal): Promise<DocumentLike>;
  getOutgoingRelationships(
    sourceIdentifier: string,
    relationshipType: string,
    view?: undefined,
    paging?: undefined,
    signal?: AbortSignal,
  ): Promise<PageLike<DocumentLike>>;
  getOperations(
    documentIdentifier: string,
    view?: { scopes?: string[] },
    filter?: { sinceRevision?: number },
    paging?: undefined,
    signal?: AbortSignal,
  ): Promise<PageLike<OperationLike>>;
}

/** Every page of a listing, up to {@link MAX_READ} entries. */
async function collect<T>(first: Promise<PageLike<T>>): Promise<T[]> {
  let page = await first;
  const out: T[] = [];
  for (;;) {
    out.push(...page.results);
    if (out.length >= MAX_READ || !page.next || page.results.length === 0) break;
    page = await page.next();
  }
  return out.slice(0, MAX_READ);
}

/** What the history says of a document: its title from its state, its dates and revision. */
export function factsOf({ header, state }: DocumentLike): RecordFacts {
  return {
    documentId: header.id,
    documentType: header.documentType,
    title: recordTitle(header.documentType, state) ?? (header.name || "Untitled"),
    createdAt: isoTime(header.createdAtUtcIso),
    lastChangedAt: isoTime(header.lastModifiedAtUtcIso || header.createdAtUtcIso),
    revision: header.revision.global ?? 0,
  };
}

/** The history's source over a reactor client, for the space `bdDriveId`. */
export function historySource(
  client: HistoryClient,
  bdDriveId: string,
  nameFor: (address: string) => string | undefined,
): BdHistorySource {
  return {
    space: async (signal) => factsOf(await client.get(bdDriveId, undefined, signal)),
    records: async (signal) =>
      (await collect(client.getOutgoingRelationships(bdDriveId, "child", undefined, undefined, signal))).map(
        factsOf,
      ),
    operations: (documentId, sinceRevision, signal) =>
      collect(client.getOperations(documentId, { scopes: ["global"] }, { sinceRevision }, undefined, signal)),
    nameFor,
  };
}
