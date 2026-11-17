import { describe, expect, it } from "vitest";
import {
  daysOverdue,
  gatedRows,
  gatedTotal,
  isOverdue,
  sortDecisions,
} from "./decision-view.js";
import type { DecisionImpact } from "../decision-impact/index.js";

const today = "2026-11-16";
const d = (id: string, status: string, decideBy: string | null) => ({
  id,
  status,
  decideBy,
});
const empty: DecisionImpact = {
  conditions: [],
  blocked: [],
  leads: [],
  opportunities: [],
  proposals: [],
};

describe("overdue", () => {
  it("only an open decision past its day is overdue", () => {
    expect(isOverdue("OPEN", "2026-11-13T00:00:00.000Z", today)).toBe(true);
    expect(isOverdue("OPEN", "2026-11-16T00:00:00.000Z", today)).toBe(false);
    expect(isOverdue("ANSWERED", "2026-11-01T00:00:00.000Z", today)).toBe(
      false,
    );
    expect(isOverdue("OPEN", null, today)).toBe(false);
  });
  it("counts whole days", () => {
    expect(daysOverdue("2026-11-13T00:00:00.000Z", today)).toBe(3);
  });
});

describe("sortDecisions", () => {
  it("puts open first, overdue first, then by day, then the rest", () => {
    const sorted = sortDecisions(
      [
        d("a", "ANSWERED", null),
        d("b", "OPEN", null),
        d("c", "OPEN", "2026-11-30T00:00:00.000Z"),
        d("e", "OPEN", "2026-11-10T00:00:00.000Z"),
        d("f", "WITHDRAWN", null),
      ],
      today,
    );
    expect(sorted.map((x) => x.id)).toEqual(["e", "c", "b", "a", "f"]);
  });
});

describe("gated", () => {
  it("lists each record once and counts them", () => {
    const impact: DecisionImpact = {
      ...empty,
      blocked: [{ id: "o1", name: "Fund", closed: false }],
      conditions: [
        { id: "o1", name: "Fund", closed: false, conditionId: "c", text: "EU" },
        {
          id: "o2",
          name: "Call",
          closed: false,
          conditionId: "c2",
          text: "SME",
        },
      ],
      leads: [{ id: "l1", name: "Ada", closed: false }],
    };
    expect(gatedTotal(impact)).toBe(3);
    const rows = gatedRows(impact);
    expect(rows.map((r) => r.id)).toEqual(["o1", "o1", "o2", "l1"]);
    expect(rows[0].sub).toBe("Blocked");
    expect(rows[1].sub).toBe("Condition: EU");
  });
  it("is empty for nothing", () => {
    expect(gatedTotal(empty)).toBe(0);
    expect(gatedRows(empty)).toEqual([]);
  });
});

describe("sortDecisions ties", () => {
  it("keeps the given order for the same day and for undated ones", () => {
    const sorted = sortDecisions(
      [
        d("a", "OPEN", "2026-11-20T00:00:00.000Z"),
        d("b", "OPEN", "2026-11-20T10:00:00.000Z"),
        d("c", "OPEN", null),
        d("e", "OPEN", null),
      ],
      today,
    );
    expect(sorted.map((x) => x.id)).toEqual(["a", "b", "c", "e"]);
  });
});

describe("gatedRows for linked records", () => {
  it("words each reason for opportunities and proposals", () => {
    const rows = gatedRows({
      ...empty,
      opportunities: [{ id: "o9", name: "Grant", closed: true }],
      proposals: [{ id: "p9", name: "Scope", closed: false }],
    });
    expect(rows).toEqual([
      {
        key: "o-o9",
        id: "o9",
        name: "Grant",
        sub: "Funding opportunity linked to this decision",
        closed: true,
      },
      {
        key: "p-p9",
        id: "p9",
        name: "Scope",
        sub: "Proposal linked to this decision",
        closed: false,
      },
    ]);
  });
});
