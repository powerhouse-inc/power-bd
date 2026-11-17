/**
 * Which of a drive's records the server hands over.
 *
 * An older stack loads a drive's records as one batch that a single refusal
 * fails, and with it every view; this stack's batch leaves the refused ones
 * out. A record can be refused while it is still listed: it was deleted on
 * the server but a stale copy of the drive in this browser still lists it, or
 * it is out of the reader's reach. This reads the records in one batch where
 * the cache batches, asks about each one once, shares the answer with every
 * view asking about the same records, and leaves the refused ones out, on
 * either stack.
 */

/**
 * Where records come from: the document cache itself, which every view
 * shares. Answers are kept per cache, so the cache object is the key; a
 * function made per component (the stack's `useGetDocument`) would miss
 * them in every view mounted later, and that view would wait again.
 */
export interface RecordSource {
  get(id: string): Promise<unknown>;
  /**
   * Reads the records not yet read, in one request where the cache batches
   * them. Only its filling of the cache is used: this stack's leaves refused
   * records out, an older one fails the whole batch.
   */
  getBatch?(ids: string[]): Promise<unknown>;
}

export interface Loadable {
  /** The records the server handed over, in the order asked. */
  ok: readonly string[];
  /** The records it refused. */
  refused: readonly string[];
}

export interface LoadableOptions {
  /** Told which records were left out, once per set of records asked about. */
  onRefused?: (ids: readonly string[]) => void;
  /** How many sets of answers to keep for each document cache. */
  limit?: number;
}

const LIMIT = 50;

export function createLoadableChecks({ onRefused, limit = LIMIT }: LoadableOptions = {}) {
  const byCache = new WeakMap<RecordSource, Map<string, Promise<Loadable>>>();

  return function check(cache: RecordSource, ids: readonly string[]): Promise<Loadable> {
    let answers = byCache.get(cache);
    if (!answers) {
      answers = new Map();
      byCache.set(cache, answers);
    }
    const key = ids.join("\n");
    const known = answers.get(key);
    if (known) return known;

    // One batched read first, so asking each record below is answered from the cache.
    const asked = Promise.resolve()
      .then(() => cache.getBatch?.([...ids]))
      .catch(() => undefined)
      .then(() => Promise.allSettled(ids.map((id) => Promise.resolve().then(() => cache.get(id)))))
      .then((results) => {
        const ok = ids.filter((_, i) => results[i]?.status === "fulfilled");
        const refused = ids.filter((_, i) => results[i]?.status !== "fulfilled");
        if (refused.length > 0) onRefused?.(refused);
        return { ok, refused };
      });
    if (answers.size >= limit) {
      const oldest = answers.keys().next();
      if (!oldest.done) answers.delete(oldest.value);
    }
    answers.set(key, asked);
    return asked;
  };
}
