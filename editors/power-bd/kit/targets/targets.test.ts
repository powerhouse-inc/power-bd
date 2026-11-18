import { describe, expect, it } from "vitest";
import { proposalRec } from "../overview/fixtures.js";
import { quarterActuals, quarterLabel, quartersFrom, targetsOf, type ActualsInput, type Target } from "./targets.js";

const Z = "Europe/Ljubljana";
const meeting = (at: string, status = "HELD", kind = "MEETING") => ({ kind, status, at });

describe("targets", () => {
  it("lists this quarter and the next ones, across a year", () => {
    expect(quartersFrom("2026-11-18", 3)).toEqual(["2026-Q4", "2027-Q1", "2027-Q2"]);
    expect(quartersFrom("2026-02-01", 1)).toEqual(["2026-Q1"]);
    expect(quarterLabel("2026-Q4")).toBe("Q4 2026");
  });

  it("reads no targets from settings stored before targets existed", () => {
    expect(targetsOf(undefined)).toEqual([]);
    expect(targetsOf({} as never)).toEqual([]);
    expect(targetsOf({ targets: [{ id: "t", quarter: "2026-Q4", metric: "LEADS_WON", value: 1 }] })).toHaveLength(1);
  });

  it("counts this quarter's held meetings, sent proposals and their value, and leads won", () => {
    const input: ActualsInput = {
      leads: [
        { state: { status: "WON", closedAt: "2026-11-02T10:00:00.000Z", interactions: [meeting("2026-10-05T09:00:00.000Z"), meeting("2026-10-06T09:00:00.000Z", "SCHEDULED"), meeting("2026-10-07T09:00:00.000Z", "HELD", "CALL")] } },
        { state: { status: "WON", closedAt: "2026-09-30T10:00:00.000Z", interactions: [meeting("2026-09-29T09:00:00.000Z")] } },
      ],
      opportunities: [{ state: { interactions: [meeting("2026-12-31T23:30:00.000Z")] } }],
      proposals: [
        proposalRec("p1", { sentAt: "2026-11-10T09:00:00.000Z" }),
        proposalRec("p2", { sentAt: "2026-07-10T09:00:00.000Z" }),
        proposalRec("p3", { sentAt: null }),
      ],
    };
    const targets: Target[] = [
      { id: "a", quarter: "2026-Q4", metric: "MEETINGS_HELD", value: 4 },
      { id: "b", quarter: "2026-Q4", metric: "VALUE_PROPOSED", value: 4000 },
      { id: "c", quarter: "2027-Q1", metric: "LEADS_WON", value: 9 },
    ];
    const byMetric = Object.fromEntries(quarterActuals(input, "2026-Q4", targets, Z).map((a) => [a.metric, a]));
    // 31 Dec 23:30 UTC is 00:30 on 1 Jan in Ljubljana: next quarter.
    expect(byMetric.MEETINGS_HELD).toMatchObject({ actual: 1, target: 4, share: 0.25 });
    expect(byMetric.PROPOSALS_SENT).toMatchObject({ actual: 1, target: null, share: null });
    expect(byMetric.VALUE_PROPOSED).toMatchObject({ actual: 1000, amounts: [{ currency: "EUR", amount: 1000 }], share: 0.25 });
    expect(byMetric.LEADS_WON).toMatchObject({ actual: 1, target: null });
  });

  it("does not compare value proposed in several currencies with one target", () => {
    const input: ActualsInput = {
      leads: [],
      opportunities: [],
      proposals: [
        proposalRec("p1", { sentAt: "2026-11-10T09:00:00.000Z" }),
        proposalRec("p2", { sentAt: "2026-11-11T09:00:00.000Z", currency: "CHF" }),
      ],
    };
    const value = quarterActuals(input, "2026-Q4", [{ id: "b", quarter: "2026-Q4", metric: "VALUE_PROPOSED", value: 4000 }], Z).find((a) => a.metric === "VALUE_PROPOSED");
    expect(value).toMatchObject({ actual: 0, share: null });
    expect(value?.amounts).toHaveLength(2);
  });
});
