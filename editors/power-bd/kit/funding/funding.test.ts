import { describe, expect, it } from "vitest";
import {
  conditionSummary,
  deadline,
  goNoGoChecks,
  nextAction,
  sortByDeadline,
  statusPath,
  type FundingLike,
} from "./funding.js";

const NOW = "2026-11-16T10:00:00.000Z";
const step = (id: string, at: string, targeted = false, kind = "CUT_OFF") => ({
  id,
  kind,
  label: id,
  at,
  timeZone: "America/Los_Angeles",
  targeted,
});
const opp = (o: Partial<FundingLike> = {}): FundingLike => ({
  status: "TO_EVALUATE",
  owner: null,
  blocked: null,
  steps: [],
  conditions: [],
  submissions: [],
  goNoGoDecisions: [],
  expectedOpening: null,
  ...o,
});

describe("deadline", () => {
  it("prefers the targeted cut-off, even when a later one exists", () => {
    const d = deadline(
      opp({
        steps: [
          step("a", "2026-12-01T00:00:00.000Z"),
          step("b", "2027-01-01T00:00:00.000Z", true),
        ],
      }),
      NOW,
    );
    expect(d?.step.id).toBe("b");
    expect(d?.targeted).toBe(true);
  });
  it("else takes the next step still to come", () => {
    const d = deadline(
      opp({
        steps: [
          step("past", "2026-10-01T00:00:00.000Z"),
          step("later", "2027-02-01T00:00:00.000Z"),
          step("soon", "2026-12-01T00:00:00.000Z"),
        ],
      }),
      NOW,
    );
    expect(d?.step.id).toBe("soon");
    expect(d?.targeted).toBe(false);
  });
  it("is null with no dates", () => {
    expect(deadline(opp(), NOW)).toBeNull();
  });
});

describe("sortByDeadline", () => {
  it("puts dated ones first by date, undated last", () => {
    const items = [
      { id: "none", state: opp() },
      {
        id: "late",
        state: opp({ steps: [step("x", "2027-03-01T00:00:00.000Z")] }),
      },
      {
        id: "soon",
        state: opp({ steps: [step("y", "2026-12-01T00:00:00.000Z")] }),
      },
    ];
    expect(sortByDeadline(items, NOW).map((i) => i.id)).toEqual([
      "soon",
      "late",
      "none",
    ]);
  });
});

describe("statusPath", () => {
  const states = (s: ReturnType<typeof statusPath>) =>
    s.steps.map((x) => `${x.key}:${x.state}`).join(" ");
  it("starts at to evaluate", () => {
    expect(states(statusPath(opp()))).toBe(
      "TO_EVALUATE:current DECIDING:todo GATE:todo PREPARING:todo SUBMITTED:todo NEXT_STAGE:todo AWARDED:todo",
    );
  });
  it("marks the gate done after a go and flags blocked on preparing", () => {
    const p = statusPath(
      opp({
        status: "PREPARING",
        blocked: { text: "x" },
        goNoGoDecisions: [{ decision: "GO", decidedBy: "0x1", decidedAt: NOW }],
      }),
    );
    expect(states(p)).toContain("GATE:done PREPARING:current");
    expect(p.steps.find((x) => x.key === "PREPARING")?.blocked).toBe(true);
  });
  it("shows no-go on the gate", () => {
    const p = statusPath(
      opp({
        status: "NO_GO",
        goNoGoDecisions: [
          { decision: "NO_GO", decidedBy: "0x1", decidedAt: NOW },
        ],
      }),
    );
    expect(p.steps.find((x) => x.key === "GATE")?.label).toBe("No-go");
    expect(p.closed).toBe(true);
  });
  it("watching has nothing done", () => {
    const p = statusPath(opp({ status: "WATCHING" }));
    expect(p.steps.every((x) => x.state === "todo")).toBe(true);
  });
});

describe("conditionSummary", () => {
  it("counts met and waiting", () => {
    const s = conditionSummary([
      { state: "MET" },
      { state: "WAITING_ON_DECISION" },
      { state: "UNKNOWN" },
    ]);
    expect(s).toMatchObject({
      met: 1,
      total: 3,
      waiting: 1,
      unknown: 1,
      percent: 33,
    });
  });
  it("is zero percent for none", () => {
    expect(conditionSummary([]).percent).toBe(0);
  });
});

describe("goNoGoChecks", () => {
  it("warns on unmet conditions, few attempts and a missing cut-off", () => {
    const checks = goNoGoChecks(
      opp({ conditions: [{ state: "MET" }, { state: "WAITING_ON_DECISION" }] }),
      { attemptsLeft: 1, max: 3, ourZone: "Europe/Berlin", now: NOW },
    );
    expect(checks.map((c) => c.tone)).toEqual(["warn", "warn", "warn"]);
    expect(checks[0].text).toBe("1 of 2 conditions met");
  });
  it("is ok with everything in place", () => {
    const checks = goNoGoChecks(
      opp({
        conditions: [{ state: "MET" }],
        steps: [step("c", "2027-01-07T01:00:00.000Z", true)],
      }),
      { attemptsLeft: 3, max: 3, ourZone: "Europe/Berlin", now: NOW },
    );
    expect(checks.every((c) => c.tone === "ok")).toBe(true);
    expect(checks[2].text).toContain("Cut-off");
  });
  it("says attempts are unknown without a limit", () => {
    const checks = goNoGoChecks(opp(), {
      attemptsLeft: null,
      max: null,
      ourZone: "UTC",
      now: NOW,
    });
    expect(checks[1].text).toBe("No attempt limit recorded");
  });
});

describe("nextAction", () => {
  it("is none when closed", () => {
    expect(nextAction(opp({ status: "AWARDED" }), NOW).kind).toBe("none");
  });
  it("names the blocking decision", () => {
    const a = nextAction(
      opp({
        status: "PREPARING",
        owner: "0x1",
        blocked: { decisionId: "d1", text: "Which entity?" },
      }),
      NOW,
    );
    expect(a).toMatchObject({ kind: "blocked", decisionId: "d1" });
  });
  it("asks for an owner past to evaluate", () => {
    expect(nextAction(opp({ status: "DECIDING" }), NOW).kind).toBe("owner");
  });
  it("offers the go decision while deciding", () => {
    expect(
      nextAction(opp({ status: "DECIDING", owner: "0x1" }), NOW).kind,
    ).toBe("decide");
  });
  it("asks to record an outcome when a submission waits", () => {
    const a = nextAction(
      opp({
        status: "SUBMITTED",
        owner: "0x1",
        submissions: [
          { id: "s", submittedAt: NOW, submittedBy: "0x1", outcome: null },
        ],
      }),
      NOW,
    );
    expect(a.kind).toBe("outcome");
  });
});

import { allowedMoves, zonedToInstant } from "./funding.js";

describe("allowedMoves", () => {
  it("follows the by-hand rules", () => {
    expect(allowedMoves("TO_EVALUATE")).toEqual(["WATCHING", "DECIDING"]);
    expect(allowedMoves("DECIDING")).toEqual(["TO_EVALUATE", "WATCHING"]);
    expect(allowedMoves("PREPARING")).toEqual(["SUBMITTED", "WITHDRAWN"]);
    expect(allowedMoves("NEXT_STAGE")).toContain("PREPARING");
    expect(allowedMoves("AWARDED")).toEqual([]);
  });
});

describe("zonedToInstant", () => {
  it("reads a wall time in the funder's zone", () => {
    expect(zonedToInstant("2026-11-26T17:00", "America/Los_Angeles")).toBe(
      "2026-11-27T01:00:00.000Z",
    );
    expect(zonedToInstant("2026-07-01T09:00", "Europe/Berlin")).toBe(
      "2026-07-01T07:00:00.000Z",
    );
  });
});

describe("sortByDeadline with undated items first", () => {
  it("moves a dated item ahead of an undated one wherever it sits", () => {
    const undated = { name: "u1", state: opp() };
    const undated2 = { name: "u2", state: opp() };
    const dated = {
      name: "d",
      state: opp({ steps: [step("a", "2026-12-01T00:00:00.000Z")] }),
    };
    expect(
      sortByDeadline([undated, dated, undated2], NOW).map((x) => x.name),
    ).toEqual(["d", "u1", "u2"]);
  });
});

describe("statusPath for closed and later statuses", () => {
  const states = (s: ReturnType<typeof statusPath>) =>
    s.steps.map((x) => `${x.key}:${x.state}`).join(" ");
  const go = [{ decision: "GO", decidedBy: "0x1", decidedAt: NOW }];
  it("keeps everything up to preparing done when rejected after a go", () => {
    expect(
      states(statusPath(opp({ status: "REJECTED", goNoGoDecisions: go }))),
    ).toBe(
      "TO_EVALUATE:done DECIDING:done GATE:done PREPARING:done SUBMITTED:todo NEXT_STAGE:todo AWARDED:todo",
    );
  });
  it("keeps only evaluating and deciding done when withdrawn before a go", () => {
    expect(states(statusPath(opp({ status: "WITHDRAWN" })))).toBe(
      "TO_EVALUATE:done DECIDING:done GATE:todo PREPARING:todo SUBMITTED:todo NEXT_STAGE:todo AWARDED:todo",
    );
  });
  it("marks every step done when awarded", () => {
    const p = statusPath(opp({ status: "AWARDED", goNoGoDecisions: go }));
    expect(p.steps.every((x) => x.state === "done")).toBe(true);
    expect(p.closed).toBe(true);
  });
  it("shows submitted as the current step", () => {
    expect(states(statusPath(opp({ status: "SUBMITTED" })))).toContain(
      "PREPARING:done SUBMITTED:current NEXT_STAGE:todo",
    );
  });
});

describe("goNoGoChecks details", () => {
  const ctx = {
    attemptsLeft: 3,
    max: 3,
    ourZone: "Europe/Berlin",
    now: NOW,
  };
  it("names conditions waiting on a decision before unchecked ones", () => {
    const checks = goNoGoChecks(
      opp({
        conditions: [
          { state: "WAITING_ON_DECISION" },
          { state: "UNKNOWN" },
          { state: "MET" },
        ],
      }),
      ctx,
    );
    expect(checks[0]).toEqual({
      tone: "warn",
      text: "1 of 3 conditions met",
      detail: "1 waiting on a decision",
    });
  });
  it("names unchecked conditions when none wait", () => {
    const checks = goNoGoChecks(
      opp({ conditions: [{ state: "UNKNOWN" }, { state: "UNKNOWN" }] }),
      ctx,
    );
    expect(checks[0].detail).toBe("2 not yet checked");
  });
  it("says the cut-off is not yet the one we aim for when it is untargeted", () => {
    const checks = goNoGoChecks(
      opp({ steps: [step("a", "2026-12-01T12:00:00.000Z")] }),
      ctx,
    );
    expect(checks[2]).toEqual({
      tone: "warn",
      text: "Cut-off 2026-12-01 13:00",
      detail: "Not yet chosen as the one we aim for",
    });
  });
});

describe("nextAction by status", () => {
  const owned = (o: Partial<FundingLike>) => opp({ owner: "0x1", ...o });
  it("falls back to a default line for a blocked decision without text", () => {
    expect(
      nextAction(owned({ status: "PREPARING", blocked: {} }), NOW),
    ).toEqual({
      kind: "blocked",
      what: "Get an answer to the decision that blocks this",
      decisionId: undefined,
    });
  });
  it("tells a watcher when the next round is expected", () => {
    expect(
      nextAction(
        opp({ status: "WATCHING", expectedOpening: "2027-03-01" }),
        NOW,
      ),
    ).toEqual({
      kind: "info",
      what: "Wait for the next round",
      why: "Expected to open 2027-03-01",
    });
    expect(nextAction(opp({ status: "WATCHING" }), NOW)).toMatchObject({
      why: "No opening date yet",
    });
  });
  it("asks to list conditions, then to move to deciding", () => {
    expect(nextAction(opp(), NOW)).toMatchObject({
      what: "List the conditions",
    });
    expect(
      nextAction(opp({ conditions: [{ state: "MET" }] }), NOW),
    ).toMatchObject({
      what: "Move to deciding when the conditions are known",
    });
  });
  it("asks to prepare for the next date, or to add one", () => {
    expect(
      nextAction(
        owned({
          status: "PREPARING",
          steps: [step("Full proposal", "2026-12-01T00:00:00.000Z")],
        }),
        NOW,
      ),
    ).toMatchObject({ what: "Prepare for Full proposal" });
    expect(nextAction(owned({ status: "PREPARING" }), NOW)).toMatchObject({
      what: "Add the cut-off",
    });
  });
  it("waits for the funder once every submission has an outcome", () => {
    expect(
      nextAction(
        owned({
          status: "SUBMITTED",
          submissions: [
            {
              id: "s",
              submittedAt: NOW,
              submittedBy: "0x1",
              outcome: { result: "NEXT_STAGE" },
            },
          ],
        }),
        NOW,
      ),
    ).toMatchObject({ what: "Wait for the funder" });
  });
});

describe("allowedMoves for the remaining statuses", () => {
  it("lists them", () => {
    expect(allowedMoves("WATCHING")).toEqual(["TO_EVALUATE"]);
    expect(allowedMoves("SUBMITTED")).toEqual([
      "NEXT_STAGE",
      "AWARDED",
      "REJECTED",
      "WITHDRAWN",
    ]);
  });
});
