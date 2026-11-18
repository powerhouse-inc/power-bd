import { describe, expect, it } from "vitest";
import { funnelNote, reasonsNote, reportTiles } from "./display.js";
import type { Funnel, Outcomes } from "./reports.js";

const outcomes = (won: number, lost: number, winRate: number | null, medianDaysToWin: number | null): Outcomes => ({
  won,
  lost,
  winRate,
  medianDaysToWin,
});

describe("the headline tiles", () => {
  it("say when a rate will show instead of shouting that there are too few", () => {
    const [win, days, added, quiet] = reportTiles(outcomes(0, 1, null, null), 1, 0, "this quarter");
    expect(win).toEqual({ label: "Win rate", value: null, sub: "Shows once 3 have closed · 1 so far", tone: "plain" });
    expect(days).toEqual({ label: "Days to win", value: null, sub: "Shows once 3 are won · 0 so far", tone: "plain" });
    expect(added).toEqual({ label: "Added", value: "1", sub: "Leads, this quarter", tone: "plain" });
    expect(quiet).toEqual({ label: "Gone quiet", value: "0", sub: "Every open lead changed in 30 days", tone: "plain" });
  });

  it("show the figures once enough leads stand behind them, and point at quiet leads", () => {
    const [win, days, , quiet] = reportTiles(outcomes(3, 2, 0.6, 41.6), 9, 2, "all time");
    expect(win).toMatchObject({ value: "60%", sub: "3 won, 2 lost" });
    expect(days).toMatchObject({ value: "42", sub: "Median, from being added" });
    expect(quiet).toEqual({ label: "Gone quiet", value: "2", sub: "Open, no change in 30 days", tone: "signal" });
  });
});

describe("the notes", () => {
  const funnel = (shares: (number | null)[]): Funnel => ({
    entered: 5,
    unknown: 0,
    steps: shares.map((fromPrevious, i) => ({ status: "TO_CONTACT", reached: 5 - i, fromPrevious })),
  });

  it("say once under the funnel when a share can't show, and nothing when all do", () => {
    expect(funnelNote(funnel([null, 0.8, null]))).toBe("A share between stages shows once 3 leads reach the stage before.");
    expect(funnelNote(funnel([null, 0.8, 0.75]))).toBeNull();
  });

  it("say in one line that nothing was lost and nothing is parked", () => {
    expect(reasonsNote(0, 0, false)).toBe("No lead was lost in the period, and none is parked.");
    expect(reasonsNote(0, 0, true)).toBe("No lead has been lost yet, and none is parked.");
    expect(reasonsNote(1, 0, false)).toBeNull();
    expect(reasonsNote(0, 2, true)).toBeNull();
  });
});
