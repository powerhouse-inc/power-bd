import { describe, expect, it } from "vitest";
import {
  historyRows,
  isoTime,
  kindOf,
  MAX_DETAIL_CHARS,
  MAX_DETAIL_ITEMS,
  parseSince,
  recentChanges,
  trimDetails,
  type OperationLike,
  type RecordFacts,
} from "./history.js";

const MIRA = "0x1111111111111111111111111111111111111111";
const STRANGER = "0x2222222222222222222222222222222222222222";
const nameFor = (address: string) => (address === MIRA ? "Mira Lindqvist" : undefined);

function record(over: Partial<RecordFacts>): RecordFacts {
  return {
    documentId: "lead-1",
    documentType: "powerbd/lead",
    title: "Marnoble: pilot",
    createdAt: "2026-11-02T09:00:00.000Z",
    lastChangedAt: "2026-11-02T09:00:00.000Z",
    revision: 4,
    ...over,
  };
}

function op(index: number, type: string, input: unknown, over: Partial<OperationLike> = {}): OperationLike {
  return {
    index,
    timestampUtcMs: `2026-11-1${index}T10:00:00.000Z`,
    action: { type, input, context: { signer: { user: { address: MIRA }, app: { name: "Power BD" } } } },
    ...over,
  };
}

describe("kindOf: records in the team's words", () => {
  it.each([
    ["powerbd/lead", "lead"],
    ["powerbd/opportunity", "funding opportunity"],
    ["powerbd/contact", "organisation"],
    ["powerbd/decision", "company decision"],
    ["powerbd/market", "market"],
    ["powerhouse/document-drive", "the BD space"],
  ])("calls %s a %s", (type, kind) => {
    expect(kindOf(type)).toBe(kind);
  });

  it("keeps a type it has no word for", () => {
    expect(kindOf("bai/knowledge-note")).toBe("bai/knowledge-note");
  });
});

describe("isoTime and parseSince", () => {
  it("reads ISO times and milliseconds as text, and keeps what it cannot read", () => {
    expect(isoTime("2026-11-18T09:55:00Z")).toBe("2026-11-18T09:55:00.000Z");
    expect(isoTime("1763459700000")).toBe("2025-11-18T09:55:00.000Z");
    expect(isoTime("not a time")).toBe("not a time");
  });

  it("takes no since, a date or a date-time, and says what is wrong with anything else", () => {
    expect(parseSince(undefined)).toEqual({ ms: undefined });
    expect(parseSince("")).toEqual({ ms: undefined });
    expect(parseSince(null)).toEqual({ ms: undefined });
    expect(parseSince("2026-11-16")).toEqual({ ms: Date.parse("2026-11-16") });
    expect(parseSince("last week")).toEqual({
      problem: 'since must be an ISO date such as 2026-11-18, or a date-time; got "last week"',
    });
    expect(parseSince(17)).toEqual({
      problem: "since must be an ISO date such as 2026-11-18, or a date-time; got 17",
    });
  });
});

describe("recentChanges: what was added or changed", () => {
  const records = [
    record({ documentId: "lead-old", title: "Old lead", lastChangedAt: "2026-11-03T08:00:00.000Z" }),
    record({
      documentId: "opp-1",
      documentType: "powerbd/opportunity",
      title: "Orvane call",
      createdAt: "2026-11-17T08:00:00.000Z",
      lastChangedAt: "2026-11-18T08:00:00.000Z",
    }),
    record({ documentId: "lead-2", title: "Brisa Labs", lastChangedAt: "2026-11-16T12:00:00.000Z" }),
    record({ documentId: "lead-3", title: "Alder", lastChangedAt: "2026-11-16T12:00:00.000Z" }),
  ];

  it("lists the most recently changed first, a tie by title, in the team's words", () => {
    const out = recentChanges(records, { limit: 10 });
    expect(out.matching).toBe(4);
    expect(out.records.map((r) => r.documentId)).toEqual(["opp-1", "lead-3", "lead-2", "lead-old"]);
    expect(out.records[0]).toEqual({
      documentId: "opp-1",
      kind: "funding opportunity",
      title: "Orvane call",
      createdAt: "2026-11-17T08:00:00.000Z",
      lastChangedAt: "2026-11-18T08:00:00.000Z",
      changes: 4,
    });
    expect(out).not.toHaveProperty("since");
  });

  it("keeps what was added or changed since a time, and marks what was added", () => {
    const out = recentChanges(records, { sinceMs: Date.parse("2026-11-16"), limit: 10 });
    expect(out.since).toBe("2026-11-16T00:00:00.000Z");
    expect(out.records.map((r) => [r.documentId, r.addedSince])).toEqual([
      ["opp-1", true],
      ["lead-3", false],
      ["lead-2", false],
    ]);
  });

  it("narrows to one type and stops at the limit, saying how many matched", () => {
    const out = recentChanges(records, { documentType: "powerbd/lead", limit: 1 });
    expect(out.matching).toBe(3);
    expect(out.records.map((r) => r.documentId)).toEqual(["lead-3"]);
  });
});

describe("trimDetails: a change's details, short enough to read", () => {
  it("cuts long text and says how much was left out", () => {
    const long = "x".repeat(MAX_DETAIL_CHARS + 5);
    expect(trimDetails(long)).toBe(`${"x".repeat(MAX_DETAIL_CHARS)}… (5 more characters)`);
    expect(trimDetails("short")).toBe("short");
  });

  it("cuts long lists, and stops following deep values", () => {
    const list = Array.from({ length: MAX_DETAIL_ITEMS + 3 }, (_, i) => i);
    const trimmed = trimDetails(list) as unknown[];
    expect(trimmed).toHaveLength(MAX_DETAIL_ITEMS + 1);
    expect(trimmed.at(-1)).toBe("… 3 more");
    expect(trimDetails(["a", "b"])).toEqual(["a", "b"]);
    expect(trimDetails({ a: { b: { c: { d: { e: 1 } } } } })).toEqual({ a: { b: { c: { d: "…" } } } });
  });

  it("keeps numbers, booleans and null as they are", () => {
    expect(trimDetails({ n: 1, b: true, z: null })).toEqual({ n: 1, b: true, z: null });
  });
});

describe("historyRows: who changed a record, and how", () => {
  it("gives the newest change first, with the team member's name and the app", () => {
    const rows = historyRows(
      [op(1, "SET_NAME", { name: "Marnoble" }), op(2, "SET_NEXT_STEP", { text: "Send the pilot plan" })],
      nameFor,
    );
    expect(rows).toEqual([
      {
        at: "2026-11-12T10:00:00.000Z",
        change: "SET_NEXT_STEP",
        by: "Mira Lindqvist",
        signer: MIRA,
        via: "Power BD",
        details: { text: "Send the pilot plan" },
      },
      {
        at: "2026-11-11T10:00:00.000Z",
        change: "SET_NAME",
        by: "Mira Lindqvist",
        signer: MIRA,
        via: "Power BD",
        details: { name: "Marnoble" },
      },
    ]);
  });

  it("gives no name for a signer off the team list, and nothing for an unsigned change", () => {
    const rows = historyRows(
      [
        op(1, "SET_NAME", {}, { action: { type: "SET_NAME", input: {}, context: { signer: { user: { address: STRANGER } } } } }),
        op(2, "SET_NAME", {}, { action: { type: "SET_NAME", input: {} } }),
      ],
      nameFor,
    );
    expect(rows.map((r) => [r.by, r.signer, r.via])).toEqual([
      [null, null, null],
      [null, STRANGER, null],
    ]);
  });

  it("withholds the text of a confidential item and keeps when and by whom", () => {
    const [row] = historyRows(
      [op(3, "ADD_CONFIDENTIAL_ITEM", { id: "c-1", text: "The budget holder distrusts open source" })],
      nameFor,
    );
    expect(JSON.stringify(row)).not.toContain("distrusts");
    expect(row).toMatchObject({ change: "ADD_CONFIDENTIAL_ITEM", by: "Mira Lindqvist", details: { withheld: 1 } });
  });

  it("says when a change was refused, by the reducer or by permissions", () => {
    const rows = historyRows(
      [
        op(1, "DECIDE_GO_NO_GO", {}, { error: "Only from REVIEW" }),
        op(2, "DECIDE_GO_NO_GO", {}, { deniedReason: "insufficient permissions" }),
        op(3, "SET_NAME", {}),
      ],
      nameFor,
    );
    expect(rows.map((r) => r.refused)).toEqual([undefined, "insufficient permissions", "Only from REVIEW"]);
  });
});
