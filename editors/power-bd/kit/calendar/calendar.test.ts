import {
  setDecideBy as setDecisionDecideBy,
  reducer as decisionReducer,
  utils as decisionUtils,
} from "document-models/decision/v1";
import {
  addInteraction,
  addNextStep,
  reducer as leadReducer,
  updateInteraction,
  updateNextStep,
  utils as leadUtils,
} from "document-models/lead/v1";
import {
  addNextStep as addOppNextStep,
  addStep,
  reducer as opportunityReducer,
  setDecideBy,
  setExpectedOpening,
  setOpportunityStatus,
  utils as opportunityUtils,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";
import {
  datedItems,
  localTime,
  zonedInstant,
  type DatedItem,
} from "../overview/index.js";
import {
  MEETING_REASSURANCE,
  addMonths,
  canReschedule,
  dayDistance,
  dayHint,
  dayMove,
  itemsByDay,
  monthGrid,
  weekDays,
  type Reschedule,
} from "./calendar.js";

const TODAY = "2026-11-18";
const LJ = "Europe/Ljubljana";
const ALICE = "0x1111111111111111111111111111111111111111";

const item = (over: Partial<DatedItem>): DatedItem => ({
  due: "NEXT_STEP",
  source: { kind: "lead", id: "lead-1", name: "Pilot" },
  label: "Send the outline",
  day: "2026-11-20",
  people: [],
  itemId: "step-1",
  ...over,
});

describe("grids", () => {
  it("shows whole weeks, Monday first, around a month", () => {
    const nov = monthGrid("2026-11");
    expect(nov).toHaveLength(6);
    expect(nov[0][0]).toBe("2026-10-26");
    expect(nov.at(-1)?.at(-1)).toBe("2026-12-06");
    expect(nov.every((w) => w.length === 7)).toBe(true);
    const feb = monthGrid("2026-02");
    expect(feb).toHaveLength(5);
    expect(feb[0][0]).toBe("2026-01-26");
  });

  it("gives the week of a day, Monday to Sunday", () => {
    expect(weekDays("2026-11-18")).toEqual([
      "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19",
      "2026-11-20", "2026-11-21", "2026-11-22",
    ]);
    expect(weekDays("2026-11-22")[0]).toBe("2026-11-16");
  });

  it("steps months across years and counts days", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(dayDistance("2026-11-18", "2026-11-25")).toBe(7);
    expect(dayDistance("2026-03-28", "2026-03-30")).toBe(2);
  });

  it("puts whole-day items first, then timed ones by our time", () => {
    const days = itemsByDay(
      [
        item({ label: "late", due: "MEETING", ourTime: "15:00" }),
        item({ label: "early", due: "MEETING", ourTime: "09:00" }),
        item({ label: "all day" }),
        item({ label: "elsewhere", day: "2027-01-01" }),
      ],
      ["2026-11-20", "2026-11-21"],
    );
    expect(days.get("2026-11-20")?.map((i) => i.label)).toEqual(["all day", "early", "late"]);
    expect(days.get("2026-11-21")).toEqual([]);
    expect(days.has("2027-01-01")).toBe(false);
  });
});

describe("zonedInstant", () => {
  it("reverses localTime in winter and summer", () => {
    expect(zonedInstant("2026-11-20", "10:00", LJ)).toBe("2026-11-20T09:00:00.000Z");
    expect(zonedInstant("2026-07-01", "10:00", LJ)).toBe("2026-07-01T08:00:00.000Z");
    expect(zonedInstant("2026-11-20", "09:30", "America/New_York")).toBe("2026-11-20T14:30:00.000Z");
    const at = zonedInstant("2026-10-25", "18:45", LJ);
    expect(localTime(at, LJ)).toEqual({ day: "2026-10-25", time: "18:45" });
  });

  it("lands on the same day for a clock time skipped by the change to summer time", () => {
    const at = zonedInstant("2026-03-29", "02:30", LJ);
    expect(localTime(at, LJ).day).toBe("2026-03-29");
  });
});

describe("dayMove", () => {
  it("moves a next step at once, as a whole day", () => {
    const m = dayMove(item({}), "2026-11-24", TODAY);
    expect(m).toEqual({
      kind: "set",
      reschedule: {
        act: "NEXT_STEP",
        documentId: "lead-1",
        stepId: "step-1",
        dueDate: "2026-11-24T00:00:00.000Z",
      },
    });
    expect(dayHint(m)).toBe("Moves here");
  });

  it("moves an overdue next step to today or later", () => {
    const late = item({ day: "2026-11-10" });
    expect(dayMove(late, TODAY, TODAY).kind).toBe("set");
    expect(canReschedule(late, TODAY)).toBe(true);
  });

  it("stays on its own day and never moves into the past", () => {
    expect(dayMove(item({}), "2026-11-20", TODAY)).toEqual({ kind: "stay" });
    expect(dayMove(item({}), "2026-11-17", TODAY)).toEqual({
      kind: "refused",
      why: "Pick today or a later day",
      open: false,
    });
  });

  it("asks before moving a meeting, which keeps its clock time across summer time", () => {
    const meeting = item({
      due: "MEETING",
      itemId: "m-1",
      day: "2026-10-20",
      ourTime: "10:00",
      theirDay: "2026-10-20",
      theirTime: "10:00",
      theirTimeZone: LJ,
      at: "2026-10-20T08:00:00.000Z",
    });
    const m = dayMove(meeting, "2026-10-27", "2026-10-19");
    expect(m.kind).toBe("confirm");
    if (m.kind !== "confirm") return;
    expect(m.reassurance).toBe(MEETING_REASSURANCE);
    expect(m.reschedule).toEqual({
      act: "MEETING",
      documentId: "lead-1",
      interactionId: "m-1",
      at: "2026-10-27T09:00:00.000Z",
    });
    expect(dayHint(m)).toBe("Moves here · asks to confirm");
  });

  it("moves a meeting by the same number of days in its own time zone", () => {
    // 09:00 in New York is 15:00 here: both on the 20th; three days later on the 23rd.
    const meeting = item({
      due: "MEETING",
      itemId: "m-2",
      day: "2026-11-20",
      ourTime: "15:00",
      theirDay: "2026-11-20",
      theirTime: "09:00",
      theirTimeZone: "America/New_York",
    });
    const m = dayMove(meeting, "2026-11-23", TODAY);
    expect(m.kind === "confirm" && m.reschedule).toMatchObject({ at: "2026-11-23T14:00:00.000Z" });
  });

  it("moves decide-by dates and the expected opening at once, for the right record", () => {
    const decision = dayMove(
      item({ due: "DECIDE_BY", source: { kind: "decision", id: "d-1", name: "Q" }, itemId: undefined }),
      "2026-11-25",
      TODAY,
    );
    expect(decision).toMatchObject({ kind: "set", reschedule: { act: "DECIDE_BY", record: "decision", documentId: "d-1" } });
    const opp = dayMove(
      item({ due: "DECIDE_BY", source: { kind: "opportunity", id: "o-1", name: "Grant" }, itemId: undefined }),
      "2026-11-25",
      TODAY,
    );
    expect(opp).toMatchObject({ reschedule: { record: "opportunity" } });
    expect(
      dayMove(item({ due: "EXPECTED_OPENING", source: { kind: "opportunity", id: "o-1", name: "G" }, itemId: undefined }), "2026-12-01", TODAY),
    ).toMatchObject({ kind: "set", reschedule: { act: "EXPECTED_OPENING", expectedOpening: "2026-12-01T00:00:00.000Z" } });
  });

  it("leaves dates set by others where they are, saying why", () => {
    const step = dayMove(item({ due: "OPPORTUNITY_STEP" }), "2026-11-25", TODAY);
    expect(step).toEqual({
      kind: "refused",
      why: "The funder sets this date. If it changed, change it on the opportunity's page",
      open: true,
    });
    const valid = dayMove(item({ due: "PROPOSAL_VALID_UNTIL", itemId: undefined }), "2026-11-25", TODAY);
    expect(valid).toMatchObject({ kind: "refused", open: false });
    expect(canReschedule(item({ due: "PROPOSAL_VALID_UNTIL" }), TODAY)).toBe(false);
  });

  it("sends a next step or meeting without its id to the record", () => {
    expect(dayMove(item({ itemId: undefined }), "2026-11-25", TODAY)).toMatchObject({ kind: "refused", open: true });
    expect(dayMove(item({ due: "MEETING", itemId: "m" }), "2026-11-25", TODAY)).toMatchObject({ kind: "refused", open: true });
  });
});

describe("agrees with the reducers", () => {
  const AT = "2026-11-18T09:00:00.000Z";
  const to = "2026-11-27";

  const leadDoc = () => {
    let doc = leadUtils.createDocument();
    doc = leadReducer(doc, addNextStep({ id: "s1", text: "Send outline", owner: ALICE, dueDate: "2026-11-20T00:00:00.000Z" }));
    doc = leadReducer(doc, addInteraction({ id: "m1", kind: "MEETING", status: "SCHEDULED", at: "2026-11-21T09:00:00.000Z", timeZone: LJ, summary: "Kick-off", teamMembers: [ALICE] }));
    return doc;
  };
  const oppDoc = (status: "TO_EVALUATE" | "WATCHING") => {
    let doc = opportunityUtils.createDocument();
    if (status === "TO_EVALUATE") {
      doc = opportunityReducer(doc, setOpportunityStatus({ status: "TO_EVALUATE", changedAt: AT }));
      doc = opportunityReducer(doc, setDecideBy({ decideBy: "2026-11-22T00:00:00.000Z" }));
    } else {
      doc = opportunityReducer(doc, setOpportunityStatus({ status: "WATCHING", changedAt: AT }));
      doc = opportunityReducer(doc, setExpectedOpening({ expectedOpening: "2026-11-23T00:00:00.000Z" }));
    }
    doc = opportunityReducer(doc, addOppNextStep({ id: "s2", text: "Read the call", owner: ALICE, dueDate: "2026-11-24T00:00:00.000Z" }));
    doc = opportunityReducer(doc, addStep({ id: "st1", kind: "CUT_OFF", label: "Cut-off", at: "2026-11-30T16:00:00.000Z", timeZone: LJ, source: "https://example.org/call", checkedAt: AT }));
    return doc;
  };
  const decisionDoc = () =>
    decisionReducer(decisionUtils.createDocument(), setDecisionDecideBy({ decideBy: "2026-11-26T00:00:00.000Z" }));

  it("every move it offers is accepted, and the item lands on the day it was put on", () => {
    const lead = leadDoc();
    const evaluate = oppDoc("TO_EVALUATE");
    const watch = oppDoc("WATCHING");
    const decision = decisionDoc();
    const input = {
      leads: [{ id: "lead", state: lead.state.global }],
      opportunities: [
        { id: "evaluate", state: evaluate.state.global },
        { id: "watch", state: watch.state.global },
      ],
      decisions: [{ id: "decision", state: decision.state.global }],
      proposals: [],
    };
    type Input = typeof input;
    const withOpportunity = (id: string, state: Input["opportunities"][number]["state"]): Input => ({
      ...input,
      opportunities: input.opportunities.map((o) => (o.id === id ? { id, state } : o)),
    });

    /** Applies the change as the record page would, and gives back its error and the records after it. */
    const apply = (r: Reschedule): { error: unknown; after: Input } => {
      switch (r.act) {
        case "NEXT_STEP": {
          if (r.documentId === "lead") {
            const d = leadReducer(lead, updateNextStep({ id: r.stepId, dueDate: r.dueDate }));
            return { error: d.operations.global.at(-1)?.error, after: { ...input, leads: [{ id: "lead", state: d.state.global }] } };
          }
          const d = opportunityReducer(r.documentId === "evaluate" ? evaluate : watch, updateNextStep({ id: r.stepId, dueDate: r.dueDate }));
          return { error: d.operations.global.at(-1)?.error, after: withOpportunity(r.documentId, d.state.global) };
        }
        case "MEETING": {
          const d = leadReducer(lead, updateInteraction({ id: r.interactionId, at: r.at }));
          return { error: d.operations.global.at(-1)?.error, after: { ...input, leads: [{ id: "lead", state: d.state.global }] } };
        }
        case "DECIDE_BY": {
          if (r.record === "decision") {
            const d = decisionReducer(decision, setDecisionDecideBy({ decideBy: r.decideBy }));
            return { error: d.operations.global.at(-1)?.error, after: { ...input, decisions: [{ id: "decision", state: d.state.global }] } };
          }
          const d = opportunityReducer(evaluate, setDecideBy({ decideBy: r.decideBy }));
          return { error: d.operations.global.at(-1)?.error, after: withOpportunity(r.documentId, d.state.global) };
        }
        case "EXPECTED_OPENING": {
          const d = opportunityReducer(watch, setExpectedOpening({ expectedOpening: r.expectedOpening }));
          return { error: d.operations.global.at(-1)?.error, after: withOpportunity(r.documentId, d.state.global) };
        }
      }
    };

    const items = datedItems(input, LJ);
    expect(new Set(items.map((i) => i.due))).toEqual(
      new Set(["NEXT_STEP", "MEETING", "DECIDE_BY", "EXPECTED_OPENING", "OPPORTUNITY_STEP"]),
    );
    let moved = 0;
    for (const i of items) {
      const m = dayMove(i, to, TODAY);
      if (m.kind === "refused") {
        expect(i.due).toBe("OPPORTUNITY_STEP");
        continue;
      }
      if (m.kind === "stay") continue;
      const { error, after } = apply(m.reschedule);
      expect(error, `${i.due} ${i.label}`).toBeFalsy();
      const again = datedItems(after, LJ).find(
        (x) => x.due === i.due && x.source.id === i.source.id && x.itemId === i.itemId,
      );
      expect(again?.day, `${i.due} lands on ${to}`).toBe(to);
      if (i.due === "MEETING") expect(again?.ourTime).toBe(i.ourTime);
      moved++;
    }
    // Lead: step and meeting; each opportunity: its date and its step; the decision: its date.
    expect(moved).toBe(7);
  });
});
