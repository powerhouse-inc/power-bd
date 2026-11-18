import {
  addNextStep,
  parkLead,
  reducer as leadReducer,
  setLeadStatus,
  utils as leadUtils,
} from "document-models/lead/v1";
import { describe, expect, it } from "vitest";
import { datedItems } from "../overview/index.js";
import { addMonthsToDay, reminderChoices, reminderStep } from "./reminder.js";

const OWNER = "0x1111111111111111111111111111111111111111";
const AT = "2026-11-18T09:00:00.000Z";

describe("reminder days", () => {
  it("adds calendar months, keeping the day where the month has it", () => {
    expect(addMonthsToDay("2026-11-18", 1)).toBe("2026-12-18");
    expect(addMonthsToDay("2026-11-18", 3)).toBe("2027-02-18");
    expect(addMonthsToDay("2026-08-31", 6)).toBe("2027-02-28");
    expect(addMonthsToDay("2027-11-30", 3)).toBe("2028-02-29");
    expect(addMonthsToDay("2026-01-31", 1)).toBe("2026-02-28");
  });

  it("offers one, three and six months", () => {
    expect(reminderChoices("2026-11-18")).toEqual([
      { label: "In 1 month", day: "2026-12-18" },
      { label: "In 3 months", day: "2027-02-18" },
      { label: "In 6 months", day: "2027-05-18" },
    ]);
  });
});

describe("reminderStep", () => {
  it("says why to check back, on the chosen whole day, for the owner", () => {
    expect(reminderStep({ id: "s1", reason: " Waiting for their budget round ", day: "2027-02-18", owner: OWNER })).toEqual({
      id: "s1",
      text: "Check back: Waiting for their budget round",
      owner: OWNER,
      dueDate: "2027-02-18T00:00:00.000Z",
    });
    expect(reminderStep({ id: "s2", reason: "", day: "2027-02-18", owner: null })).toEqual({
      id: "s2",
      text: "Check back",
      dueDate: "2027-02-18T00:00:00.000Z",
    });
  });
});

describe("agrees with the lead reducer", () => {
  it("adds the step to a parked lead, and the calendar shows it on its day", () => {
    let doc = leadUtils.createDocument({
      global: { ...leadUtils.createDocument().state.global, status: "IN_TOUCH", owner: OWNER, organisationId: "c1" },
    });
    doc = leadReducer(doc, parkLead({ reason: "Budget round", parkedAt: AT }));
    expect(doc.operations.global.at(-1)?.error).toBeFalsy();
    const step = reminderStep({ id: "r1", reason: "Budget round", day: "2027-02-18", owner: OWNER });
    doc = leadReducer(doc, addNextStep(step));
    expect(doc.operations.global.at(-1)?.error).toBeFalsy();
    const items = datedItems({ leads: [{ id: "l1", state: doc.state.global }], opportunities: [], decisions: [], proposals: [] }, "UTC");
    expect(items).toEqual([expect.objectContaining({ due: "NEXT_STEP", day: "2027-02-18", label: "Check back: Budget round", people: [OWNER] })]);
  });

  it("is why a lost lead gets none: the calendar leaves a closed lead's steps out", () => {
    let doc = leadUtils.createDocument({
      global: { ...leadUtils.createDocument().state.global, status: "MET", owner: OWNER, organisationId: "c1" },
    });
    doc = leadReducer(doc, setLeadStatus({ status: "LOST", reason: "Timing", changedAt: AT }));
    doc = leadReducer(doc, addNextStep(reminderStep({ id: "r1", reason: "Timing", day: "2027-02-18", owner: OWNER })));
    expect(doc.operations.global.at(-1)?.error).toBeFalsy();
    expect(datedItems({ leads: [{ id: "l1", state: doc.state.global }], opportunities: [], decisions: [], proposals: [] }, "UTC")).toEqual([]);
  });
});
