import * as m from "document-models/market/v1";
import { describe, expect, it } from "vitest";
import {
  marketCardLine,
  marketTotals,
  sizeChecks,
  type MarketLike,
  type SegmentLike,
} from "./market.js";

const SRC = { title: "Registry count", url: "https://example.org/registry" };
const seg = (over: Partial<SegmentLike> & { id: string }): SegmentLike => ({
  name: over.id,
  accounts: 100,
  accountsSource: SRC,
  annualValue: 10_000,
  annualValueSource: SRC,
  serviceable: true,
  targetAccounts: 5,
  ...over,
});
const market = (
  segments: SegmentLike[],
  over: Partial<MarketLike> = {},
): MarketLike => ({ currency: "EUR", segments, sizeStatus: "DRAFT", ...over });

describe("marketTotals", () => {
  it("is zero, with nothing counted, for a market without segments", () => {
    const t = marketTotals([]);
    for (const x of [t.tam, t.sam, t.som])
      expect(x).toEqual({ amount: 0, counted: [], notCounted: [] });
  });

  it("multiplies organisations by value per organisation", () => {
    const t = marketTotals([seg({ id: "a" }), seg({ id: "b", accounts: 40 })]);
    expect(t.tam.amount).toBe(100 * 10_000 + 40 * 10_000);
    expect(t.tam.counted).toEqual(["a", "b"]);
  });

  it("counts only serviceable segments in SAM and SOM", () => {
    const t = marketTotals([
      seg({ id: "in" }),
      seg({ id: "out", serviceable: false, accounts: 900 }),
    ]);
    expect(t.tam.amount).toBe(1_000 * 10_000);
    expect(t.sam.amount).toBe(100 * 10_000);
    expect(t.sam.counted).toEqual(["in"]);
    expect(t.sam.notCounted).toEqual([]);
    expect(t.som.amount).toBe(5 * 10_000);
  });

  it("lists a segment missing a number instead of counting it as zero", () => {
    const t = marketTotals([
      seg({ id: "full" }),
      seg({ id: "noAccounts", accounts: null }),
      seg({ id: "noValue", annualValue: undefined }),
      seg({ id: "noTarget", targetAccounts: null }),
    ]);
    expect(t.tam.counted).toEqual(["full", "noTarget"]);
    expect(t.tam.notCounted).toEqual(["noAccounts", "noValue"]);
    expect(t.som.counted).toEqual(["full", "noAccounts"]);
    expect(t.som.notCounted).toEqual(["noValue", "noTarget"]);
  });

  it("counts a target equal to every organisation in the segment", () => {
    const t = marketTotals([seg({ id: "a", targetAccounts: 100 })]);
    expect(t.som.amount).toBe(t.sam.amount);
  });

  it("treats zero as a number, not as missing", () => {
    const t = marketTotals([seg({ id: "a", accounts: 0 })]);
    expect(t.tam).toEqual({ amount: 0, counted: ["a"], notCounted: [] });
  });
});

describe("sizeChecks", () => {
  it("waits for one counted segment first", () => {
    expect(sizeChecks(market([]))).toEqual([
      expect.objectContaining({ code: "NOTHING_COUNTED" }),
    ]);
    expect(
      sizeChecks(market([seg({ id: "a", accounts: null })])).map((f) => f.code),
    ).toEqual(["NOTHING_COUNTED"]);
  });

  it("asks for a source for both numbers of each counted segment", () => {
    const findings = sizeChecks(
      market([
        seg({ id: "a", name: "Mid-size finance teams", accountsSource: null }),
        seg({ id: "b", annualValueSource: { title: "A note" } }),
      ]),
    );
    expect(findings).toEqual([
      {
        code: "ACCOUNTS_WITHOUT_SOURCE",
        segmentId: "a",
        sentence:
          "Add a source for the number of organisations in Mid-size finance teams",
      },
      expect.objectContaining({ code: "VALUE_WITHOUT_SOURCE", segmentId: "b" }),
    ]);
  });

  it("takes a vault note as a source as well as a web page", () => {
    const note = { title: "SolveAI", documentId: "vault-note-1" };
    expect(
      sizeChecks(
        market([seg({ id: "a", accountsSource: note, annualValueSource: note })]),
      ),
    ).toEqual([]);
  });

  it("does not wait for segments that are not counted yet", () => {
    expect(
      sizeChecks(
        market([
          seg({ id: "a" }),
          seg({ id: "b", accounts: null, accountsSource: null }),
        ]),
      ),
    ).toEqual([]);
  });
});

describe("marketCardLine", () => {
  it("says when nothing is counted yet", () => {
    expect(marketCardLine(market([]))).toBe("Not sized yet");
  });

  it("shows TAM, SAM and SOM in short form", () => {
    const line = marketCardLine(
      market([
        seg({ id: "a", accounts: 1_200, annualValue: 1_000_000 }),
        seg({ id: "b", accounts: 50, serviceable: false }),
      ]),
    );
    expect(line).toBe("€1.2bn · €1.2bn · €5m");
  });

  it("shows a dash for a total with nothing counted, and EUR when no currency is set", () => {
    const line = marketCardLine(
      market([seg({ id: "a", serviceable: false })], { currency: null }),
    );
    expect(line).toBe("€1m · – · –");
  });
});

describe("agrees with the reducer", () => {
  it("lists nothing exactly when APPROVE_SIZE accepts the figures", () => {
    const URL_ = "https://example.org/r";
    const at = "2026-11-18T09:00:00.000Z";
    const me = "0x1111111111111111111111111111111111111111";
    const add = (id: string) => m.addSegment({ id, name: `Segment ${id}` });
    const count = (id: string) => m.updateSegment({ id, accounts: 10, annualValue: 100, serviceable: true });
    const src = (id: string, figure: "ACCOUNTS" | "ANNUAL_VALUE") =>
      m.setSegmentSource({ id, figure, title: "Source", url: URL_ });
    const cases = [
      [],
      [add("a")],
      [add("a"), count("a")],
      [add("a"), count("a"), src("a", "ACCOUNTS")],
      [add("a"), count("a"), src("a", "ACCOUNTS"), src("a", "ANNUAL_VALUE")],
      [add("a"), count("a"), src("a", "ACCOUNTS"), src("a", "ANNUAL_VALUE"), add("b")],
      [add("a"), count("a"), src("a", "ACCOUNTS"), src("a", "ANNUAL_VALUE"), add("b"), count("b")],
    ];
    for (const actions of cases) {
      const doc = actions.reduce((d, a) => m.reducer(d, a), m.utils.createDocument());
      const findings = sizeChecks(doc.state.global);
      const approved = m.reducer(doc, m.approveSize({ approvedBy: me, approvedAt: at }));
      const refused = approved.operations.global.at(-1)?.error;
      expect(findings.length === 0, `${actions.length} actions: ${String(refused)}`).toBe(!refused);
    }
  });
});
