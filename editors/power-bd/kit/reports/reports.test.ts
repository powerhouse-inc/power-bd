import { describe, expect, it } from "vitest";
import {
  MIN_SAMPLE,
  funnel,
  groupReasons,
  lostReasons,
  outcomes,
  parkedReasons,
  percent,
  periodStart,
  quietLeads,
  splitBy,
  type ReportLead,
  bySource,
} from "./reports.js";

const Z = "UTC";
const TODAY = "2026-11-18";
let n = 0;
const lead = (over: Partial<ReportLead> = {}): ReportLead => ({
  id: `l${++n}`,
  name: `Lead ${n}`,
  kind: "SALES",
  owner: "0xa",
  status: "TO_CONTACT",
  parkedFrom: null,
  statusReason: null,
  closedAt: null,
  createdAt: "2026-11-01T10:00:00.000Z",
  changedAt: "2026-11-17T10:00:00.000Z",
  ...over,
});

describe("periodStart", () => {
  it("starts the calendar quarter, the last 90 days, or nothing", () => {
    expect(periodStart("quarter", TODAY)).toBe("2026-10-01");
    expect(periodStart("quarter", "2026-03-31")).toBe("2026-01-01");
    expect(periodStart("90days", TODAY)).toBe("2026-08-21");
    expect(periodStart("all", TODAY)).toBeNull();
  });
});

describe("funnel", () => {
  it("counts how far the leads added in the period got", () => {
    const f = funnel(
      [
        lead({ status: "TO_CONTACT" }),
        lead({ status: "IN_TOUCH" }),
        lead({ status: "MET" }),
        lead({ status: "PROPOSAL" }),
        lead({ status: "WON", closedAt: "2026-11-10T00:00:00.000Z" }),
        lead({ status: "IN_TOUCH", createdAt: "2026-01-05T00:00:00.000Z" }),
      ],
      "2026-10-01",
      Z,
    );
    expect(f.entered).toBe(5);
    expect(f.unknown).toBe(0);
    expect(f.steps.map((s) => [s.status, s.reached])).toEqual([
      ["TO_CONTACT", 5],
      ["IN_TOUCH", 4],
      ["MEETING_SET", 3],
      ["MET", 3],
      ["PROPOSAL", 2],
      ["WON", 1],
    ]);
    expect(f.steps[0].fromPrevious).toBeNull();
    expect(f.steps[1].fromPrevious).toBeCloseTo(4 / 5);
    expect(f.steps[3].fromPrevious).toBe(1);
  });

  it("places a parked lead where it was parked, and leaves lost leads out of the steps", () => {
    const f = funnel(
      [
        lead({ status: "PARKED", parkedFrom: "MET" }),
        lead({ status: "PARKED", parkedFrom: null }),
        lead({ status: "LOST", closedAt: "2026-11-10T00:00:00.000Z" }),
        lead({ status: "MET" }),
      ],
      null,
      Z,
    );
    expect(f.entered).toBe(4);
    expect(f.unknown).toBe(2);
    expect(f.steps.find((s) => s.status === "MET")?.reached).toBe(2);
  });

  it("shows no share below the minimum", () => {
    const f = funnel([lead({ status: "IN_TOUCH" }), lead()], null, Z);
    expect(f.steps[1].fromPrevious).toBeNull();
    expect(MIN_SAMPLE).toBe(3);
  });

  it("counts only the kinds that can go further into proposal and won", () => {
    const f = funnel(
      [
        lead({ status: "MET", kind: "INVESTOR" }),
        lead({ status: "MET", kind: "INVESTOR" }),
        lead({ status: "MET", kind: "INVESTOR" }),
        lead({ status: "PROPOSAL" }),
        lead({ status: "PROPOSAL" }),
        lead({ status: "MET" }),
      ],
      null,
      Z,
    );
    // Into proposal: of the three non-investor leads at met or beyond, two got there.
    expect(f.steps.find((s) => s.status === "PROPOSAL")?.fromPrevious).toBeCloseTo(2 / 3);
    expect(f.steps.find((s) => s.status === "MET")?.fromPrevious).toBe(1);
  });
});

describe("outcomes", () => {
  it("counts leads won and lost in the period, with the win rate and median days to win", () => {
    const o = outcomes(
      [
        lead({ status: "WON", createdAt: "2026-10-01T09:00:00.000Z", closedAt: "2026-10-11T09:00:00.000Z" }),
        lead({ status: "WON", createdAt: "2026-10-01T09:00:00.000Z", closedAt: "2026-10-21T09:00:00.000Z" }),
        lead({ status: "WON", createdAt: "2026-10-01T09:00:00.000Z", closedAt: "2026-11-30T09:00:00.000Z" }),
        lead({ status: "LOST", closedAt: "2026-11-02T09:00:00.000Z" }),
        lead({ status: "LOST", closedAt: "2026-02-02T09:00:00.000Z" }),
        lead({ status: "MET" }),
      ],
      "2026-10-01",
      Z,
    );
    expect(o).toEqual({ won: 3, lost: 1, winRate: 0.75, medianDaysToWin: 20 });
  });

  it("gives no rate or median below the minimum", () => {
    const o = outcomes([lead({ status: "WON", closedAt: "2026-11-02T00:00:00.000Z" })], null, Z);
    expect(o).toEqual({ won: 1, lost: 0, winRate: null, medianDaysToWin: null });
  });

  it("takes the middle of an even number of wins", () => {
    const won = (d: string) => lead({ status: "WON", createdAt: "2026-10-01T00:00:00.000Z", closedAt: `${d}T00:00:00.000Z` });
    expect(outcomes([won("2026-10-02"), won("2026-10-04"), won("2026-10-06"), won("2026-10-11")], null, Z).medianDaysToWin).toBe(4);
  });
});

describe("groupReasons", () => {
  const r = (text: string, leadName = "L") => ({ leadId: leadName, leadName, text });

  it("joins a reason to a theme only when its words name one theme", () => {
    const groups = groupReasons([
      r("Too expensive for them"),
      r("No budget this year"),
      r("Waiting for their budget round"),
      r("They chose a competitor"),
      r("Not now"),
    ]);
    expect(groups.map((g) => [g.label, g.theme, g.reasons.length])).toEqual([
      ["Budget or price", true, 2],
      ["Chose someone else", true, 1],
      ["Timing", true, 1],
      ["Waiting for their budget round", false, 1],
    ]);
  });

  it("groups the same wording, whatever its case and punctuation, and keeps it as written", () => {
    const groups = groupReasons([r("Merger in progress."), r("merger in progress"), r("  "), r("Moved abroad", "M")]);
    expect(groups).toEqual([
      { label: "Merger in progress.", theme: false, reasons: [r("Merger in progress."), r("merger in progress")] },
      { label: "Moved abroad", theme: false, reasons: [r("Moved abroad", "M")] },
    ]);
  });

  it("matches whole words, not parts of words", () => {
    expect(groupReasons([r("Costello declined")])[0].theme).toBe(false);
    expect(groupReasons([r("Cost")])[0].label).toBe("Budget or price");
  });
});

describe("reasons of lost and parked leads", () => {
  it("takes lost reasons from the period and parked reasons from now", () => {
    const leads = [
      lead({ status: "LOST", statusReason: "No reply", closedAt: "2026-11-02T00:00:00.000Z" }),
      lead({ status: "LOST", statusReason: "Old", closedAt: "2025-01-02T00:00:00.000Z" }),
      lead({ status: "PARKED", parkedFrom: "MET", statusReason: "Waiting for their round" }),
      lead({ status: "MET", statusReason: null }),
    ];
    expect(lostReasons(leads, "2026-10-01", Z).map((g) => g.label)).toEqual(["No response"]);
    expect(parkedReasons(leads).map((g) => g.label)).toEqual(["Timing"]);
  });
});

describe("quietLeads", () => {
  it("lists open leads untouched for 30 days or more, by status, the quietest first", () => {
    const stages = quietLeads(
      [
        lead({ name: "B", status: "MET", changedAt: "2026-10-01T00:00:00.000Z" }),
        lead({ name: "A", status: "MET", changedAt: "2026-09-01T00:00:00.000Z" }),
        lead({ name: "C", status: "IN_TOUCH", changedAt: "2026-10-19T00:00:00.000Z" }),
        lead({ name: "D", status: "IN_TOUCH", changedAt: "2026-10-20T00:00:00.000Z" }),
        lead({ name: "E", status: "WON", changedAt: "2026-01-01T00:00:00.000Z" }),
      ],
      TODAY,
      Z,
    );
    expect(stages.map((st) => ({ status: st.status, leads: st.leads.map(({ name, days }) => ({ name, days })) }))).toEqual([
      { status: "IN_TOUCH", leads: [{ name: "C", days: 30 }] },
      { status: "MET", leads: [{ name: "A", days: 78 }, { name: "B", days: 48 }] },
    ]);
  });
});

describe("splitBy", () => {
  it("counts per key, open now and closed in the period, the most active first", () => {
    const rows = splitBy(
      [
        lead({ owner: "0xa", status: "WON", closedAt: "2026-11-02T00:00:00.000Z" }),
        lead({ owner: "0xa", status: "LOST", closedAt: "2026-11-03T00:00:00.000Z" }),
        lead({ owner: "0xa", status: "LOST", closedAt: "2026-11-04T00:00:00.000Z" }),
        lead({ owner: "0xa", status: "PARKED", parkedFrom: "MET" }),
        lead({ owner: null, status: "IN_TOUCH", createdAt: "2025-05-01T00:00:00.000Z" }),
      ],
      (l) => l.owner ?? "",
      "2026-10-01",
      Z,
    );
    expect(rows).toEqual([
      { key: "0xa", entered: 4, open: 1, won: 1, lost: 2, winRate: 1 / 3 },
      { key: "", entered: 0, open: 1, won: 0, lost: 0, winRate: null },
    ]);
  });

  it("orders keys alphabetically when equally active", () => {
    const rows = splitBy([lead({ kind: "PARTNERSHIP" }), lead({ kind: "EXCHANGE" })], (l) => l.kind ?? "", null, Z);
    expect(rows.map((r) => r.key)).toEqual(["EXCHANGE", "PARTNERSHIP"]);
  });
});

describe("percent", () => {
  it("rounds a share to a whole percentage", () => {
    expect(percent(2 / 3)).toBe("67%");
    expect(percent(0)).toBe("0%");
  });
});

describe("bySource", () => {
  it("counts per source, with leads recorded before sources existed under the empty key", () => {
    const rows = bySource(
      [
        lead({ source: "EVENT", status: "WON", closedAt: "2026-11-02T00:00:00.000Z" }),
        lead({ source: "EVENT" }),
        lead({ source: null }),
        lead({}),
      ],
      "2026-10-01",
      Z,
    );
    expect(rows.map((r) => [r.key, r.entered, r.won])).toEqual([["EVENT", 2, 1], ["", 2, 0]]);
  });
});
