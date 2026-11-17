/**
 * Which of a drive's records the server hands over.
 *
 * The stack loads a drive's records as one batch, so a single refusal fails
 * the batch, and with it every view. A record can be refused while it is
 * still listed: it was deleted on the server but a stale copy of the drive in
 * this browser still lists it, or it is out of the reader's reach. This asks
 * about each record once, shares the answer with every view asking about the
 * same records, and leaves the refused ones out.
 */

/** How a record is fetched: the document cache's own `get`. */
export type FetchRecord = (id: string) => Promise<unknown>;

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
  const byCache = new WeakMap<FetchRecord, Map<string, Promise<Loadable>>>();

  return function check(fetch: FetchRecord, ids: readonly string[]): Promise<Loadable> {
    let answers = byCache.get(fetch);
    if (!answers) {
      answers = new Map();
      byCache.set(fetch, answers);
    }
    const key = ids.join("\n");
    const known = answers.get(key);
    if (known) return known;

    const asked = Promise.allSettled(
      ids.map((id) => Promise.resolve().then(() => fetch(id))),
    ).then((results) => {
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
