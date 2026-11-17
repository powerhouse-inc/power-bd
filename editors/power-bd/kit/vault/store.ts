/**
 * What the vault said about each linked note, shared by every link on the
 * page. The links of one render are asked about together, in one request per
 * vault; an answer is kept for a while, and asked again after that while the
 * old answer still shows. No React and no network: the lookup, the clock and
 * when a batch goes out are handed in.
 */
import type { LookupResult } from "./client.js";
import type { NoteInfo } from "./model.js";

export type LookupEntry =
  /** Being asked; `previous` is the last answer, shown meanwhile. */
  | { status: "pending"; previous: LookupResult | null }
  | { status: "done"; result: LookupResult; at: number };

/** How long an answer is trusted before the vault is asked again, in milliseconds. */
export const FRESH_MS = { found: 60_000, failed: 15_000 } as const;

/** Notes sent in one lookup at most. */
export const STORE_BATCH = 25;

export interface NoteStoreDeps {
  lookup: (
    driveId: string,
    ids: readonly string[],
  ) => Promise<ReadonlyMap<string, LookupResult>>;
  now?: () => number;
  /** Runs a batch soon; by default after the current task, so the links of one render share a request. */
  defer?: (run: () => void) => void;
}

export interface NoteStore {
  /** The entry for a note, the same object until it changes. */
  get(driveId: string, id: string): LookupEntry | undefined;
  /** Asks the vault about a note, unless its answer is fresh or it is already being asked. */
  want(driveId: string, id: string): void;
  /** Keeps what a search already found, so a note just linked shows at once. */
  prime(driveId: string, note: NoteInfo): void;
  subscribe(listener: () => void): () => void;
}

const FAILED: LookupResult = { ok: false, reason: "failed" };

export function createNoteStore(deps: NoteStoreDeps): NoteStore {
  const now = deps.now ?? Date.now;
  const defer =
    deps.defer ??
    ((run: () => void) => {
      setTimeout(run, 0);
    });
  const entries = new Map<string, Map<string, LookupEntry>>();
  const queue = new Map<string, Set<string>>();
  const listeners = new Set<() => void>();
  let scheduled = false;

  const notify = () => {
    for (const listener of listeners) listener();
  };
  const read = (driveId: string, id: string) => entries.get(driveId)?.get(id);
  const write = (driveId: string, id: string, entry: LookupEntry) => {
    let vault = entries.get(driveId);
    if (!vault) {
      vault = new Map();
      entries.set(driveId, vault);
    }
    vault.set(id, entry);
  };
  const fresh = (entry: LookupEntry) =>
    entry.status === "done" &&
    now() - entry.at < (entry.result.ok ? FRESH_MS.found : FRESH_MS.failed);

  const send = (driveId: string, ids: readonly string[]) => {
    const land = (answer: (id: string) => LookupResult) => {
      const at = now();
      for (const id of ids)
        write(driveId, id, { status: "done", result: answer(id), at });
      notify();
    };
    deps.lookup(driveId, ids).then(
      (found) => land((id) => found.get(id) ?? FAILED),
      () => land(() => FAILED),
    );
  };

  const flush = () => {
    scheduled = false;
    const batches = [...queue];
    queue.clear();
    for (const [driveId, ids] of batches) {
      const all = [...ids];
      for (let start = 0; start < all.length; start += STORE_BATCH)
        send(driveId, all.slice(start, start + STORE_BATCH));
    }
  };

  return {
    get: read,
    want(driveId, id) {
      const entry = read(driveId, id);
      if (entry && (entry.status === "pending" || fresh(entry))) return;
      write(driveId, id, {
        status: "pending",
        previous: entry?.status === "done" ? entry.result : null,
      });
      let ids = queue.get(driveId);
      if (!ids) {
        ids = new Set();
        queue.set(driveId, ids);
      }
      ids.add(id);
      if (!scheduled) {
        scheduled = true;
        defer(flush);
      }
      notify();
    },
    prime(driveId, note) {
      write(driveId, note.id, {
        status: "done",
        result: { ok: true, note },
        at: now(),
      });
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
