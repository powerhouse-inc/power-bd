/**
 * Asks the vault about its notes, through its own knowledge-graph GraphQL, as
 * the reader: their bearer goes with every request, so a note is read with
 * their own access. Reads only: nothing here writes to the vault or sends it
 * anything from BD but the words searched for.
 *
 * The network is handed in (`fetch`, where the vault's Switchboard is, the
 * reader's token), so this module runs without a server. Every answer comes
 * back as a result: a refusal, a dead network or an unreadable answer is a
 * reason, never a thrown error. Only the caller's own abort throws.
 */
import {
  asList,
  isRecord,
  readNote,
  type NoteInfo,
  type RequestFailure,
} from "./model.js";

/** The part of a fetch `Response` this module reads. */
export interface VaultResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type VaultFetch = (
  url: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
    signal?: AbortSignal;
  },
) => Promise<VaultResponse>;

export interface VaultClientDeps {
  fetch: VaultFetch;
  /** The knowledge graph's GraphQL address for a vault; rejects when the vault's Switchboard can't be found. */
  endpoint: (driveId: string, signal?: AbortSignal) => Promise<string>;
  /** The reader's bearer token; undefined when nobody is signed in. */
  token: () => Promise<string | undefined>;
}

/** What the vault said about one note: the note, null when it has no such note, or why it could not say. */
export type LookupResult =
  | { ok: true; note: NoteInfo | null }
  | { ok: false; reason: RequestFailure };

export type SearchMode = "semantic" | "full-text";

export type SearchResult =
  | { ok: true; mode: SearchMode; hits: NoteInfo[] }
  | { ok: false; reason: RequestFailure };

export interface VaultClient {
  /** What the vault says today about each note, by id. */
  lookup(
    driveId: string,
    ids: readonly string[],
    signal?: AbortSignal,
  ): Promise<Map<string, LookupResult>>;
  /** Notes that match `text`: by meaning first, by words when meaning can't run or finds nothing. */
  search(
    driveId: string,
    text: string,
    limit: number,
    signal?: AbortSignal,
  ): Promise<SearchResult>;
}

/** The caller withdrew the request (its signal fired): the only error this module throws. */
export class VaultAborted extends Error {
  constructor() {
    super("The vault request was cancelled.");
    this.name = "AbortError";
  }
}

/** Notes asked about in one request at most. */
export const LOOKUP_BATCH = 25;

const NOTE_FIELDS = "documentId title description noteType documentType";

export type GraphQLBody = {
  query: string;
  variables: Record<string, string | number>;
};

/** One query for several notes: one alias per note, all in the same vault. */
export function lookupBody(
  driveId: string,
  ids: readonly string[],
): GraphQLBody {
  const params = ids.map((_, i) => `$n${i}: String!`).join(", ");
  const fields = ids
    .map(
      (_, i) =>
        `n${i}: knowledgeGraphNodeByDocumentId(driveId: $driveId, documentId: $n${i}) { ${NOTE_FIELDS} }`,
    )
    .join("\n  ");
  return {
    query: `query BdVaultNotes($driveId: ID!, ${params}) {\n  ${fields}\n}`,
    variables: {
      driveId,
      ...Object.fromEntries(ids.map((id, i) => [`n${i}`, id])),
    },
  };
}

const SEARCH_FIELD: Record<SearchMode, string> = {
  semantic: "knowledgeGraphSemanticSearch",
  "full-text": "knowledgeGraphFullSearch",
};

/** The vault's search by meaning (the server embeds the words), or by words. */
export function searchBody(
  mode: SearchMode,
  driveId: string,
  text: string,
  limit: number,
): GraphQLBody {
  const params = "$driveId: ID!, $query: String!, $limit: Int";
  const query =
    mode === "semantic"
      ? `query BdVaultSearch(${params}) {\n  ${SEARCH_FIELD.semantic}(driveId: $driveId, query: $query, mode: SEMANTIC, limit: $limit) { similarity node { ${NOTE_FIELDS} } }\n}`
      : `query BdVaultFullSearch(${params}) {\n  ${SEARCH_FIELD["full-text"]}(driveId: $driveId, query: $query, limit: $limit) { ${NOTE_FIELDS} }\n}`;
  return { query, variables: { driveId, query: text, limit } };
}

/** One GraphQL error, as far as this module reads it: the alias it belongs to (null: the whole query) and its code. */
type Fault = { alias: string | null; code: string | null };

type Answer =
  | {
      ok: true;
      data: Record<string, unknown>;
      faults: Fault[];
      signedIn: boolean;
    }
  | { ok: false; reason: RequestFailure };

function readFaults(value: unknown): Fault[] {
  return (asList(value) ?? []).map((item) => {
    const error = isRecord(item) ? item : {};
    const head = asList(error.path)?.[0];
    const extensions = isRecord(error.extensions) ? error.extensions : {};
    return {
      alias: typeof head === "string" ? head : null,
      code: typeof extensions.code === "string" ? extensions.code : null,
    };
  });
}

/**
 * Why the vault refused. A refusal that did not sign the reader in asks them
 * to sign in; one that knows them and still refuses means no access.
 */
function refusal(
  status: number | null,
  faults: readonly Fault[],
  signedIn: boolean,
): RequestFailure {
  const codes = faults.map((f) => f.code);
  if (status === 401 || codes.includes("UNAUTHENTICATED")) return "signed-out";
  if (status === 403 || codes.includes("FORBIDDEN"))
    return signedIn ? "forbidden" : "signed-out";
  return "failed";
}

const noteInfos = (items: readonly unknown[]): NoteInfo[] => {
  const seen = new Set<string>();
  const notes: NoteInfo[] = [];
  for (const item of items) {
    const note = readNote(item);
    if (!note || seen.has(note.id)) continue;
    seen.add(note.id);
    notes.push(note);
  }
  return notes;
};

export function createVaultClient(deps: VaultClientDeps): VaultClient {
  async function token(): Promise<string | undefined> {
    try {
      return await deps.token();
    } catch {
      return undefined;
    }
  }

  async function post(
    driveId: string,
    body: GraphQLBody,
    signal?: AbortSignal,
  ): Promise<Answer> {
    const stopped = () => signal?.aborted === true;
    let url: string;
    try {
      url = await deps.endpoint(driveId, signal);
    } catch {
      if (stopped()) throw new VaultAborted();
      return { ok: false, reason: "unreachable" };
    }
    const bearer = await token();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
    let response: VaultResponse;
    try {
      response = await deps.fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        ...(signal ? { signal } : {}),
      });
    } catch {
      if (stopped()) throw new VaultAborted();
      return { ok: false, reason: "unreachable" };
    }
    const signedIn = bearer !== undefined && bearer !== "";
    if (!response.ok)
      return { ok: false, reason: refusal(response.status, [], signedIn) };
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      if (stopped()) throw new VaultAborted();
      return { ok: false, reason: "failed" };
    }
    if (!isRecord(json)) return { ok: false, reason: "failed" };
    const faults = readFaults(json.errors);
    if (!isRecord(json.data))
      return { ok: false, reason: refusal(null, faults, signedIn) };
    return { ok: true, data: json.data, faults, signedIn };
  }

  async function searchOnce(
    mode: SearchMode,
    driveId: string,
    text: string,
    limit: number,
    signal?: AbortSignal,
  ): Promise<SearchResult> {
    const answer = await post(
      driveId,
      searchBody(mode, driveId, text, limit),
      signal,
    );
    if (!answer.ok) return answer;
    const list = asList(answer.data[SEARCH_FIELD[mode]]);
    if (!list)
      return {
        ok: false,
        reason: refusal(null, answer.faults, answer.signedIn),
      };
    const items =
      mode === "semantic"
        ? list.map((row) => (isRecord(row) ? row.node : null))
        : list;
    return { ok: true, mode, hits: noteInfos(items).slice(0, limit) };
  }

  return {
    async lookup(driveId, ids, signal) {
      const unique = [...new Set(ids)];
      const found = new Map<string, LookupResult>();
      for (let start = 0; start < unique.length; start += LOOKUP_BATCH) {
        const chunk = unique.slice(start, start + LOOKUP_BATCH);
        const answer = await post(driveId, lookupBody(driveId, chunk), signal);
        chunk.forEach((id, i) => {
          if (!answer.ok) {
            found.set(id, answer);
            return;
          }
          const alias = `n${i}`;
          const faults = answer.faults.filter(
            (f) => f.alias === alias || f.alias === null,
          );
          if (faults.length > 0 || !(alias in answer.data))
            found.set(id, {
              ok: false,
              reason: refusal(null, faults, answer.signedIn),
            });
          else found.set(id, { ok: true, note: readNote(answer.data[alias]) });
        });
      }
      return found;
    },

    async search(driveId, text, limit, signal) {
      const semantic = await searchOnce(
        "semantic",
        driveId,
        text,
        limit,
        signal,
      );
      if (semantic.ok && semantic.hits.length > 0) return semantic;
      // A refusal or a dead network would end the full-text search the same way.
      if (!semantic.ok && semantic.reason !== "failed") return semantic;
      const full = await searchOnce("full-text", driveId, text, limit, signal);
      if (full.ok || !semantic.ok) return full;
      return semantic;
    },
  };
}
