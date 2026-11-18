import { describe, expect, it } from "vitest";
import {
  bdHistoryTools,
  factsOf,
  historySource,
  MAX_READ,
  RECENT_CHANGES_TOOL,
  RECORD_HISTORY_TOOL,
  type BdHistorySource,
  type DocumentLike,
  type HistoryClient,
} from "./history-tools.js";
import type { OperationLike, RecordFacts } from "./history.js";

const BD = "bd-drive-1";
const MIRA = "0x1111111111111111111111111111111111111111";

const SPACE: RecordFacts = {
  documentId: BD,
  documentType: "powerhouse/document-drive",
  title: "Quillfeather BD",
  createdAt: "2026-11-01T08:00:00.000Z",
  lastChangedAt: "2026-11-18T09:55:00.000Z",
  revision: 117,
};
const LEAD: RecordFacts = {
  documentId: "lead-1",
  documentType: "powerbd/lead",
  title: "Marnoble: pilot",
  createdAt: "2026-11-17T08:00:00.000Z",
  lastChangedAt: "2026-11-18T09:47:00.000Z",
  revision: 30,
};

const opAt = (index: number): OperationLike => ({
  index,
  timestampUtcMs: "2026-11-18T09:44:00.000Z",
  action: { type: "ADD_MESSAGE", input: { id: `m-${index}` }, context: { signer: { user: { address: MIRA } } } },
});

/** A source that answers from fixed facts and records what it was asked. */
function fakeSource(over: Partial<BdHistorySource> = {}) {
  const asked: { documentId: string; since: number }[] = [];
  const source: BdHistorySource = {
    space: () => Promise.resolve(SPACE),
    records: () => Promise.resolve([LEAD]),
    operations: (documentId, since) => {
      asked.push({ documentId, since });
      return Promise.resolve([opAt(since), opAt(since + 1)]);
    },
    nameFor: (address) => (address === MIRA ? "Mira Lindqvist" : undefined),
    ...over,
  };
  return { source, asked };
}

function toolsOf(source: BdHistorySource) {
  const [recent, history] = bdHistoryTools(source, BD);
  return { recent, history };
}

const dataOf = (out: unknown) => (out as { structuredContent: Record<string, unknown> }).structuredContent;
const textOf = (out: unknown) => (out as { content: { text: string }[] }).content[0].text;

describe("bdHistoryTools: the tools", () => {
  it("offers two read-only tools, named apart from the vault's", () => {
    const tools = bdHistoryTools(fakeSource().source, BD);
    expect(tools.map((t) => t.name)).toEqual([RECENT_CHANGES_TOOL, RECORD_HISTORY_TOOL]);
    for (const tool of tools) {
      expect(tool.annotations?.readOnlyHint).toBe(true);
      expect(tool.description).toMatch(/^Power BD space — /);
    }
  });
});

describe("getRecentChanges", () => {
  it("lists the space's records with their dates, as data and as text", async () => {
    const { recent } = toolsOf(fakeSource().source);
    const out = await recent.callback({});
    expect(dataOf(out)).toMatchObject({ matching: 1, records: [{ documentId: "lead-1", kind: "lead" }] });
    expect(JSON.parse(textOf(out))).toEqual(dataOf(out));
  });

  it("takes since, a type and a limit, kept within bounds", async () => {
    const { recent } = toolsOf(fakeSource().source);
    const out = dataOf(await recent.callback({ since: "2026-11-18", documentType: "powerbd/lead", limit: 0 }));
    expect(out).toMatchObject({ since: "2026-11-18T00:00:00.000Z", matching: 1 });
    expect(dataOf(await recent.callback({ documentType: "powerbd/opportunity" }))).toMatchObject({ matching: 0 });
    expect(dataOf(await recent.callback({ documentType: "" }))).toMatchObject({ matching: 1 });
  });

  it("refuses a since it cannot read, and says when the records cannot be read", async () => {
    const { recent } = toolsOf(fakeSource().source);
    expect(await recent.callback({ since: "last week" })).toMatchObject({ isError: true });
    const failing = toolsOf(fakeSource({ records: () => Promise.reject(new Error("Forbidden")) }).source);
    const out = await failing.recent.callback({});
    expect(out).toMatchObject({ isError: true });
    expect(textOf(out)).toContain("Forbidden");
  });
});

describe("getRecordHistory", () => {
  it("gives a record's newest changes with names, asking only for the last `limit`", async () => {
    const { source, asked } = fakeSource();
    const out = dataOf(await toolsOf(source).history.callback({ documentId: "lead-1", limit: 2 }));
    expect(asked).toEqual([{ documentId: "lead-1", since: 28 }]);
    expect(out).toMatchObject({ documentId: "lead-1", kind: "lead", title: "Marnoble: pilot", changes: 30, shown: 2 });
    expect(out.history).toMatchObject([
      { change: "ADD_MESSAGE", by: "Mira Lindqvist", details: { id: "m-29" } },
      { details: { id: "m-28" } },
    ]);
  });

  it("reads the space's own history by its id, from its first change when it has few", async () => {
    const few = { ...SPACE, revision: 3 };
    const { source, asked } = fakeSource({ space: () => Promise.resolve(few) });
    const out = dataOf(await toolsOf(source).history.callback({ documentId: BD, limit: 500 }));
    expect(asked).toEqual([{ documentId: BD, since: 0 }]);
    expect(out).toMatchObject({ kind: "the BD space", shown: 2 });
  });

  it("uses the default limit when none is given, and caps what it shows", async () => {
    const many: BdHistorySource["operations"] = () =>
      Promise.resolve(Array.from({ length: 25 }, (_, i) => opAt(i)));
    const { source, asked } = fakeSource();
    const out = dataOf(await toolsOf({ ...source, operations: many }).history.callback({ documentId: "lead-1" }));
    expect(out).toMatchObject({ shown: 15 });
    expect((out.history as unknown[]).length).toBe(15);
    expect(asked).toEqual([]);
  });

  it("refuses what is not a record of this space, and a call without a record", async () => {
    const { history } = toolsOf(fakeSource().source);
    const out = await history.callback({ documentId: "note-9" });
    expect(out).toMatchObject({ isError: true });
    expect(textOf(out)).toContain("document_history");
    expect(await history.callback({})).toMatchObject({ isError: true });
  });

  it("says when the history cannot be read, whatever the failure is", async () => {
    // A rejection that is not an Error, as a transport may give.
    const notAnError = "offline" as unknown as Error;
    const { history } = toolsOf(fakeSource({ operations: () => Promise.reject(notAnError) }).source);
    const out = await history.callback({ documentId: "lead-1" });
    expect(textOf(out)).toContain("offline");
  });

  it("passes the turn's signal on to the source", async () => {
    let seen: AbortSignal | undefined;
    const signal = new AbortController().signal;
    const { history } = toolsOf(
      fakeSource({
        records: (s) => {
          seen = s;
          return Promise.resolve([LEAD]);
        },
      }).source,
    );
    await history.callback({ documentId: "lead-1" }, { signal });
    expect(seen).toBe(signal);
  });
});

const doc = (over: Partial<DocumentLike["header"]> = {}, state?: unknown): DocumentLike => ({
  header: {
    id: "lead-1",
    documentType: "powerbd/lead",
    name: "filed name",
    createdAtUtcIso: "2026-11-17T08:00:00.000Z",
    lastModifiedAtUtcIso: "2026-11-18T09:47:00.000Z",
    revision: { global: 30, local: 2 },
    ...over,
  },
  state,
});

describe("factsOf: what the history says of a document", () => {
  it("takes the title from the record's state, its dates and its global revision", () => {
    expect(factsOf(doc({}, { global: { name: "Marnoble: pilot" } }))).toEqual(LEAD);
  });

  it("falls back to the filed name, then Untitled, and to the creation time", () => {
    expect(factsOf(doc({ lastModifiedAtUtcIso: undefined, revision: {} }))).toMatchObject({
      title: "filed name",
      lastChangedAt: "2026-11-17T08:00:00.000Z",
      revision: 0,
    });
    expect(factsOf(doc({ name: "" })).title).toBe("Untitled");
  });
});

describe("historySource: over a reactor client", () => {
  /** A client whose listings come in pages of `size`, recording what it was asked. */
  function fakeClient(documents: DocumentLike[], size: number) {
    const calls: unknown[][] = [];
    const page = <T>(all: T[], from = 0): { results: T[]; next?: () => Promise<{ results: T[] }> } => ({
      results: all.slice(from, from + size),
      ...(from + size < all.length ? { next: () => Promise.resolve(page(all, from + size)) } : {}),
    });
    const client: HistoryClient = {
      get: (id) => {
        calls.push(["get", id]);
        return Promise.resolve(doc({ id, documentType: "powerhouse/document-drive", name: "Quillfeather BD" }));
      },
      getOutgoingRelationships: (id, type) => {
        calls.push(["children", id, type]);
        return Promise.resolve(page(documents));
      },
      getOperations: (id, view, filter) => {
        calls.push(["operations", id, view, filter]);
        return Promise.resolve(page([opAt(5), opAt(6), opAt(7)]));
      },
    };
    return { client, calls };
  }

  it("reads the space, every page of its records, and a record's global operations", async () => {
    const records = [doc({ id: "a" }), doc({ id: "b" }), doc({ id: "c" })];
    const { client, calls } = fakeClient(records, 2);
    const source = historySource(client, BD, () => "Mira Lindqvist");
    expect((await source.space()).title).toBe("Quillfeather BD");
    expect((await source.records()).map((r) => r.documentId)).toEqual(["a", "b", "c"]);
    expect((await source.operations("a", 5)).map((o) => o.index)).toEqual([5, 6, 7]);
    expect(calls).toEqual([
      ["get", BD],
      ["children", BD, "child"],
      ["operations", "a", { scopes: ["global"] }, { sinceRevision: 5 }],
    ]);
    expect(source.nameFor(MIRA)).toBe("Mira Lindqvist");
  });

  it("stops at an empty page, and at the most it reads", async () => {
    const empty: HistoryClient = {
      ...fakeClient([], 1).client,
      getOutgoingRelationships: () =>
        Promise.resolve({ results: [], next: () => Promise.reject(new Error("not asked")) }),
    };
    expect(await historySource(empty, BD, () => undefined).records()).toEqual([]);
    const lots = Array.from({ length: MAX_READ + 10 }, (_, i) => doc({ id: `r-${i}` }));
    expect(await historySource(fakeClient(lots, 200).client, BD, () => undefined).records()).toHaveLength(MAX_READ);
  });
});

describe("answers that fit the agent's 12 000-character cut", () => {
  it("keeps the largest answers of both tools whole", async () => {
    const records: RecordFacts[] = Array.from({ length: 80 }, (_, i) => ({
      ...LEAD,
      documentId: `${"x".repeat(40)}${String(i).padStart(3, "0")}`,
      title: `A lead with a fairly long descriptive title, number ${i}`,
      revision: 120,
    }));
    const heavy = (index: number): OperationLike => ({
      ...opAt(index),
      action: {
        type: "ADD_FIGURE",
        input: { id: "35d85e77-e972-4f8d-b400-eb80af71105f", caption: "y".repeat(400), anchorId: "a".repeat(36) },
        context: { signer: { user: { address: MIRA }, app: { name: "switchboard" } } },
      },
    });
    const { source } = fakeSource({
      records: () => Promise.resolve(records),
      operations: (_id, since) => Promise.resolve(Array.from({ length: 200 }, (_, i) => heavy(since + i))),
    });
    const { recent, history } = toolsOf(source);
    expect(textOf(await recent.callback({ limit: 1000 })).length).toBeLessThan(12_000);
    expect(textOf(await history.callback({ documentId: "lead-1", limit: 1000 })).length).toBeLessThan(12_000);
  });
});
