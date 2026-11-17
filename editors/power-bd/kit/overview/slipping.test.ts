import { describe, expect, it } from "vitest";
import { ALICE, decision, input, lead, opportunity } from "./fixtures.js";
import { overview } from "./overview.js";

const open = (over: object = {}) => ({
  id: "n",
  text: "Call",
  owner: ALICE,
  dueDate: null,
  doneAt: null,
  ...over,
});
const slip = (i: Parameters<typeof input>[0]) => overview(input(i)).slipping;
const reasonsOf = (i: Parameters<typeof input>[0], id: string) =>
  slip(i).find((s) => s.source.id === id)?.reasons ?? [];
const L = (over: object, id = "L") => ({ leads: [{ id, state: lead(over) }] });
const O = (over: object, id = "O") => ({
  opportunities: [{ id, state: opportunity(over) }],
});
const step = (over: object) => ({
  id: "st",
  kind: "CUT_OFF",
  label: "x",
  at: "2026-11-15T10:00:00.000Z",
  timeZone: "UTC",
  targeted: true,
  source: "s",
  checkedAt: "2026-11-01T00:00:00.000Z",
  ...over,
});
const cond = (over: object) => ({
  id: "c",
  kind: "OTHER",
  text: "t",
  state: "MET",
  decisionIds: [],
  factNotes: [],
  source: "s",
  checkedAt: "2026-11-10T00:00:00.000Z",
  ...over,
});
const meeting = (over: object) => ({
  id: "m",
  kind: "MEETING",
  status: "SCHEDULED",
  at: "2026-11-15T10:00:00.000Z",
  timeZone: "UTC",
  people: [],
  teamMembers: [],
  ...over,
});

describe("what's slipping", () => {
  it("reports a healthy item as not slipping", () => {
    expect(slip(L({}))).toEqual([]);
  });

  it("NO_OWNER", () => {
    expect(reasonsOf(L({ owner: null }), "L")).toEqual(["NO_OWNER"]);
    expect(slip(L({ owner: null }))[0].source).toEqual({
      kind: "lead",
      id: "L",
      name: "Acme Corp",
    });
  });

  it("NO_NEXT_STEP for new and active items, not for parked", () => {
    expect(reasonsOf(L({ nextSteps: [] }), "L")).toEqual(["NO_NEXT_STEP"]);
    expect(
      reasonsOf(
        L({
          status: "TO_CONTACT",
          nextSteps: [open({ doneAt: "2026-11-01T00:00:00.000Z" })],
        }),
        "L",
      ),
    ).toEqual(["NO_NEXT_STEP"]);
    expect(reasonsOf(O({ status: "TO_EVALUATE", nextSteps: [] }), "O")).toEqual(
      ["NO_NEXT_STEP"],
    );
    expect(reasonsOf(L({ status: "PARKED", nextSteps: [] }), "L")).toEqual([]);
    expect(reasonsOf(O({ status: "WATCHING", nextSteps: [] }), "O")).toEqual(
      [],
    );
  });

  it("NEXT_STEP_OVERDUE only when the due day is before our today", () => {
    expect(
      reasonsOf(L({ nextSteps: [open({ dueDate: "2026-11-15" })] }), "L"),
    ).toEqual(["NEXT_STEP_OVERDUE"]);
    expect(
      reasonsOf(L({ nextSteps: [open({ dueDate: "2026-11-16" })] }), "L"),
    ).toEqual([]);
    expect(
      reasonsOf(
        L({
          nextSteps: [
            open({ dueDate: "2026-11-01", doneAt: "2026-11-02T00:00:00.000Z" }),
            open({ id: "k" }),
          ],
        }),
        "L",
      ),
    ).toEqual([]);
  });

  it("FUNDING_DATE_PASSED: decide-by while to evaluate or deciding", () => {
    expect(
      reasonsOf(O({ status: "TO_EVALUATE", decideBy: "2026-11-15" }), "O"),
    ).toEqual(["FUNDING_DATE_PASSED"]);
    expect(
      reasonsOf(O({ status: "DECIDING", decideBy: "2026-11-15" }), "O"),
    ).toEqual(["FUNDING_DATE_PASSED"]);
    expect(
      reasonsOf(O({ status: "DECIDING", decideBy: "2026-11-16" }), "O"),
    ).toEqual([]);
    expect(
      reasonsOf(O({ status: "PREPARING", decideBy: "2026-11-01" }), "O"),
    ).toEqual([]);
  });

  it("FUNDING_DATE_PASSED: targeted cut-off or full proposal while preparing", () => {
    expect(reasonsOf(O({ steps: [step({})] }), "O")).toEqual([
      "FUNDING_DATE_PASSED",
    ]);
    expect(
      reasonsOf(
        O({ steps: [step({ kind: "FULL_PROPOSAL", targeted: false })] }),
        "O",
      ),
    ).toEqual(["FUNDING_DATE_PASSED"]);
    expect(reasonsOf(O({ steps: [step({ targeted: false })] }), "O")).toEqual(
      [],
    ); // an untargeted cut-off does not slip
    expect(reasonsOf(O({ steps: [step({ kind: "INTERVIEW" })] }), "O")).toEqual(
      [],
    );
    expect(
      reasonsOf(O({ steps: [step({ at: "2026-11-17T10:00:00.000Z" })] }), "O"),
    ).toEqual([]);
  });

  it("FUNDING_DATE_PASSED: expected result passed with no outcome while submitted or next stage", () => {
    const result = step({ kind: "EXPECTED_RESULT", targeted: false });
    const sub = (outcome: object | null) => ({
      id: "s1",
      submittedAt: "2026-10-01T00:00:00.000Z",
      submittedBy: ALICE,
      outcome,
    });
    expect(
      reasonsOf(
        O({ status: "SUBMITTED", steps: [result], submissions: [sub(null)] }),
        "O",
      ),
    ).toEqual(["FUNDING_DATE_PASSED"]);
    expect(
      reasonsOf(
        O({ status: "NEXT_STAGE", steps: [result], submissions: [sub(null)] }),
        "O",
      ),
    ).toEqual(["FUNDING_DATE_PASSED"]);
    expect(
      reasonsOf(
        O({ status: "SUBMITTED", steps: [result], submissions: [] }),
        "O",
      ),
    ).toEqual(["FUNDING_DATE_PASSED"]);
    expect(
      reasonsOf(
        O({
          status: "SUBMITTED",
          steps: [result],
          submissions: [
            sub({ result: "PASSED", receivedAt: "2026-11-14T00:00:00.000Z" }),
          ],
        }),
        "O",
      ),
    ).toEqual([]);
    expect(
      reasonsOf(
        O({
          status: "SUBMITTED",
          steps: [{ ...result, at: "2026-11-30T00:00:00.000Z" }],
          submissions: [sub(null)],
        }),
        "O",
      ),
    ).toEqual([]);
    expect(reasonsOf(O({ status: "PREPARING", steps: [result] }), "O")).toEqual(
      [],
    );
  });

  it("DECISION_ANSWERED_REVIEW: answered after the condition was last checked", () => {
    const answered = (at: string) => ({
      decisions: [
        { id: "D", state: decision({ status: "ANSWERED", answeredAt: at }) },
      ],
    });
    const c = cond({ state: "WAITING_ON_DECISION", decisionIds: ["D"] });
    expect(
      reasonsOf(
        { ...O({ conditions: [c] }), ...answered("2026-11-12T00:00:00.000Z") },
        "O",
      ),
    ).toEqual(["DECISION_ANSWERED_REVIEW"]);
    expect(
      reasonsOf(
        { ...O({ conditions: [c] }), ...answered("2026-11-09T00:00:00.000Z") },
        "O",
      ),
    ).toEqual([]);
    expect(
      reasonsOf(
        {
          ...O({ conditions: [{ ...c, state: "MET" }] }),
          ...answered("2026-11-12T00:00:00.000Z"),
        },
        "O",
      ),
    ).toEqual([]);
    expect(
      reasonsOf(
        {
          ...O({ conditions: [{ ...c, decisionIds: ["Z"] }] }),
          ...answered("2026-11-12T00:00:00.000Z"),
        },
        "O",
      ),
    ).toEqual([]);
  });

  it("CONDITION_RECHECK: checked before the round opened", () => {
    expect(
      reasonsOf(
        O({
          roundOpenedAt: "2026-11-12T00:00:00.000Z",
          conditions: [cond({})],
        }),
        "O",
      ),
    ).toEqual(["CONDITION_RECHECK"]);
    expect(
      reasonsOf(
        O({
          roundOpenedAt: "2026-11-05T00:00:00.000Z",
          conditions: [cond({})],
        }),
        "O",
      ),
    ).toEqual([]);
    expect(
      reasonsOf(O({ roundOpenedAt: null, conditions: [cond({})] }), "O"),
    ).toEqual([]);
  });

  it("MEETING_NOT_RECORDED on leads and opportunities", () => {
    expect(reasonsOf(L({ interactions: [meeting({})] }), "L")).toEqual([
      "MEETING_NOT_RECORDED",
    ]);
    expect(reasonsOf(O({ interactions: [meeting({})] }), "O")).toEqual([
      "MEETING_NOT_RECORDED",
    ]);
    expect(
      reasonsOf(
        L({
          interactions: [
            meeting({ at: "2026-11-17T10:00:00.000Z" }),
            meeting({ status: "HELD" }),
            meeting({ at: null }),
          ],
        }),
        "L",
      ),
    ).toEqual([]);
  });

  it("DECISION_OVERDUE when an open overdue decision gates the item", () => {
    const d = (over: object = {}) => ({
      decisions: [
        { id: "D", state: decision({ decideBy: "2026-11-15", ...over }) },
      ],
    });
    expect(
      reasonsOf(
        { ...O({ blocked: { decisionId: "D", text: "x" } }), ...d() },
        "O",
      ),
    ).toEqual(["DECISION_OVERDUE"]);
    expect(
      reasonsOf(
        { ...O({ conditions: [cond({ decisionIds: ["D"] })] }), ...d() },
        "O",
      ),
    ).toEqual(["DECISION_OVERDUE"]);
    expect(
      reasonsOf(
        {
          ...L({
            references: [
              { id: "r", kind: "DECISION", documentId: "D", title: "t" },
            ],
          }),
          ...d(),
        },
        "L",
      ),
    ).toEqual(["DECISION_OVERDUE"]);
    expect(
      reasonsOf(
        {
          ...O({ blocked: { decisionId: "D", text: "x" } }),
          ...d({ status: "ANSWERED" }),
        },
        "O",
      ),
    ).toEqual([]);
    expect(
      reasonsOf(
        {
          ...O({ blocked: { decisionId: "D", text: "x" } }),
          ...d({ decideBy: "2026-11-16" }),
        },
        "O",
      ),
    ).toEqual([]);
    expect(
      reasonsOf(
        {
          ...O({ blocked: { decisionId: "D", text: "x" } }),
          ...d({ decideBy: null }),
        },
        "O",
      ),
    ).toEqual([]);
    expect(
      reasonsOf(
        { ...O({ blocked: { decisionId: null, text: "x" } }), ...d() },
        "O",
      ),
    ).toEqual([]);
    expect(reasonsOf({ ...O({}), ...d() }, "O")).toEqual([]);
  });

  it("lists every reason an item has, in the spec's order", () => {
    expect(
      reasonsOf(
        L({ owner: null, nextSteps: [], interactions: [meeting({})] }),
        "L",
      ),
    ).toEqual(["NO_OWNER", "NO_NEXT_STEP", "MEETING_NOT_RECORDED"]);
  });

  it("never lets a closed item slip", () => {
    const bad = {
      owner: null,
      nextSteps: [open({ dueDate: "2026-11-01" })],
      interactions: [meeting({})],
      decideBy: "2026-11-01",
    };
    for (const status of ["WON", "LOST"])
      expect(slip(L({ ...bad, status }))).toEqual([]);
    for (const status of ["AWARDED", "REJECTED", "WITHDRAWN", "NO_GO"])
      expect(slip(O({ ...bad, status, steps: [step({})] }))).toEqual([]);
  });
});

describe("what's slipping: names", () => {
  it("names a nameless opportunity and lead", () => {
    expect(slip(O({ owner: null, name: null }))[0].source.name).toBe("");
    expect(slip(L({ owner: null, name: null }))[0].source.name).toBe("");
  });
});

describe("slipping: latest submission", () => {
  it("uses the newest of several submissions to decide whether an outcome exists", () => {
    const sub = (id: string, submittedAt: string, outcome: object | null) => ({
      id,
      submittedAt,
      submittedBy: ALICE,
      outcome,
    });
    const result = step({ kind: "EXPECTED_RESULT", targeted: false });
    const passed = { result: "PASSED", receivedAt: "2026-10-20T00:00:00.000Z" };
    expect(
      reasonsOf(
        O({
          status: "SUBMITTED",
          steps: [result],
          submissions: [
            sub("a", "2026-10-01T00:00:00.000Z", null),
            sub("b", "2026-10-10T00:00:00.000Z", passed),
          ],
        }),
        "O",
      ),
    ).toEqual([]);
  });
});

describe("slipping: since when", () => {
  const sinceOf = (i: Parameters<typeof input>[0], id = "L") =>
    slip(i).find((s) => s.source.id === id)?.since;

  it("has no start for a missing owner or next step", () => {
    expect(sinceOf(L({ owner: null, nextSteps: [] }))).toEqual({});
  });

  it("NEXT_STEP_OVERDUE starts at the earliest overdue due date", () => {
    expect(
      sinceOf(
        L({
          nextSteps: [
            open({ id: "a", dueDate: "2026-11-13T00:00:00.000Z" }),
            open({ id: "b", dueDate: "2026-11-10T00:00:00.000Z" }),
            open({ id: "c", dueDate: "2026-11-30T00:00:00.000Z" }),
          ],
        }),
      ),
    ).toEqual({ NEXT_STEP_OVERDUE: { from: "2026-11-10", days: 6 } });
  });

  it("MEETING_NOT_RECORDED starts at the meeting's instant", () => {
    expect(
      sinceOf(
        L({ interactions: [meeting({ at: "2026-11-14T09:00:00.000Z" })] }),
      ),
    ).toEqual({
      MEETING_NOT_RECORDED: { from: "2026-11-14T09:00:00.000Z", days: 2 },
    });
  });

  it("FUNDING_DATE_PASSED starts at the decide-by day or the passed step", () => {
    expect(
      sinceOf(O({ status: "DECIDING", decideBy: "2026-11-11" }), "O"),
    ).toEqual({ FUNDING_DATE_PASSED: { from: "2026-11-11", days: 5 } });
    expect(
      sinceOf(
        O({ status: "PREPARING", steps: [step({ kind: "CUT_OFF" })] }),
        "O",
      ),
    ).toEqual({
      FUNDING_DATE_PASSED: { from: "2026-11-15T10:00:00.000Z", days: 1 },
    });
    expect(
      sinceOf(
        O({
          status: "SUBMITTED",
          steps: [step({ kind: "EXPECTED_RESULT", targeted: false })],
        }),
        "O",
      ),
    ).toEqual({
      FUNDING_DATE_PASSED: { from: "2026-11-15T10:00:00.000Z", days: 1 },
    });
  });

  it("DECISION_OVERDUE starts at the decision's decide-by day", () => {
    expect(
      sinceOf(
        {
          ...O({ blocked: { decisionId: "D", text: "x" } }),
          decisions: [{ id: "D", state: decision({ decideBy: "2026-11-14" }) }],
        },
        "O",
      ),
    ).toEqual({ DECISION_OVERDUE: { from: "2026-11-14", days: 2 } });
  });

  it("DECISION_ANSWERED_REVIEW starts when the decision was answered; CONDITION_RECHECK when the round opened", () => {
    const since = sinceOf(
      {
        ...O({
          roundOpenedAt: "2026-11-12T00:00:00.000Z",
          conditions: [
            cond({
              state: "WAITING_ON_DECISION",
              decisionIds: ["D"],
              checkedAt: "2026-11-01T00:00:00.000Z",
            }),
          ],
        }),
        decisions: [
          {
            id: "D",
            state: decision({
              status: "ANSWERED",
              answeredAt: "2026-11-13T00:00:00.000Z",
            }),
          },
        ],
      },
      "O",
    );
    expect(since).toEqual({
      DECISION_ANSWERED_REVIEW: { from: "2026-11-13T00:00:00.000Z", days: 3 },
      CONDITION_RECHECK: { from: "2026-11-12T00:00:00.000Z", days: 4 },
    });
  });
});

describe("slipping: several passed dates", () => {
  it("starts at the earliest of two passed cut-offs, whatever their order", () => {
    const since = slip(
      O({
        status: "PREPARING",
        steps: [
          step({ id: "late", at: "2026-11-15T10:00:00.000Z" }),
          step({ id: "early", at: "2026-11-12T10:00:00.000Z" }),
        ],
      }),
    ).find((s) => s.source.id === "O")?.since;
    expect(since).toEqual({
      FUNDING_DATE_PASSED: { from: "2026-11-12T10:00:00.000Z", days: 4 },
    });
  });
});
