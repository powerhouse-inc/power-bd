import { actions as decisionActions } from "document-models/decision";
import { actions as leadActions } from "document-models/lead";
import { actions as opportunityActions } from "document-models/opportunity";
import { generateId } from "document-model";
import type { Addable, Reschedule } from "../../kit/calendar/index.js";
import { zonedInstant } from "../../kit/overview/index.js";

/** The action that moves an item to its new day, as the record page sends it. */
export function rescheduleAction(r: Reschedule) {
  switch (r.act) {
    case "NEXT_STEP": {
      const input = { id: r.stepId, dueDate: r.dueDate };
      return r.record === "lead"
        ? leadActions.updateNextStep(input)
        : opportunityActions.updateNextStep(input);
    }
    case "MEETING": {
      const input = { id: r.interactionId, at: r.at };
      return r.record === "lead"
        ? leadActions.updateInteraction(input)
        : opportunityActions.updateInteraction(input);
    }
    case "DECIDE_BY":
      return r.record === "decision"
        ? decisionActions.setDecideBy({ decideBy: r.decideBy })
        : opportunityActions.setDecideBy({ decideBy: r.decideBy });
    case "EXPECTED_OPENING":
      return opportunityActions.setExpectedOpening({
        expectedOpening: r.expectedOpening,
      });
  }
}

/** A next step on a day, owned by whoever adds it, as the record page adds one. */
export function addStepAction(record: Addable, day: string, text: string, owner: string | null) {
  const input = {
    id: generateId(),
    text,
    owner: owner ?? undefined,
    dueDate: `${day}T00:00:00.000Z`,
  };
  return record.kind === "lead"
    ? leadActions.addNextStep(input)
    : opportunityActions.addNextStep(input);
}

/** A scheduled meeting on a day at a clock time in the team's time zone, with whoever adds it. */
export function addMeetingAction(
  record: Addable,
  day: string,
  time: string,
  zone: string,
  summary: string,
  me: string | null,
) {
  const input = {
    id: generateId(),
    kind: "MEETING" as const,
    status: "SCHEDULED" as const,
    at: zonedInstant(day, time, zone),
    timeZone: zone,
    summary,
    teamMembers: me ? [me] : [],
  };
  return record.kind === "lead"
    ? leadActions.addInteraction(input)
    : opportunityActions.addInteraction(input);
}
