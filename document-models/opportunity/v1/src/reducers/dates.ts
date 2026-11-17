import type { OpportunityDatesOperations } from "document-models/opportunity/v1";
import {
  CheckedDateRequiredError,
  DuplicateStepIdError,
  InvalidTimeZoneError,
  NotACutOffError,
  SourceRequiredError,
  StepInUseError,
  StepNotFoundError,
} from "../../gen/dates/error.js";

/**
 * UTC, or an IANA name of two or three parts. The name is checked for its form
 * only: runtimes carry different time-zone data, and a reducer must give the
 * same result wherever it replays.
 */
const TIME_ZONE_NAME =
  /^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+){1,2})$/;

function checkTimeZone(timeZone: string) {
  if (!TIME_ZONE_NAME.test(timeZone))
    throw new InvalidTimeZoneError(
      `"${timeZone}" is not a time zone name such as Europe/Zurich`,
    );
}

export const opportunityDatesOperations: OpportunityDatesOperations = {
  addStepOperation(state, action) {
    const { input } = action;
    if (state.steps.some((step) => step.id === input.id))
      throw new DuplicateStepIdError(`Step ${input.id} already exists`);
    checkTimeZone(input.timeZone);
    if (!input.source?.trim())
      throw new SourceRequiredError("A step needs a source");
    if (!input.checkedAt)
      throw new CheckedDateRequiredError(
        "A step needs the date it was checked",
      );

    state.steps.push({
      id: input.id,
      kind: input.kind,
      label: input.label,
      at: input.at,
      timeZone: input.timeZone,
      targeted: false,
      source: input.source,
      checkedAt: input.checkedAt,
    });
  },
  updateStepOperation(state, action) {
    const { input } = action;
    const step = state.steps.find((s) => s.id === input.id);
    if (!step) throw new StepNotFoundError(`Step ${input.id} not found`);
    if (input.timeZone != null) checkTimeZone(input.timeZone);
    if (input.source != null && !input.source.trim())
      throw new SourceRequiredError("A step needs a source");

    if (input.kind != null) {
      step.kind = input.kind;
      if (input.kind !== "CUT_OFF") step.targeted = false;
    }
    if (input.label != null) step.label = input.label;
    if (input.at != null) step.at = input.at;
    if (input.timeZone != null) step.timeZone = input.timeZone;
    if (input.source != null) step.source = input.source;
    if (input.checkedAt != null) step.checkedAt = input.checkedAt;
  },
  removeStepOperation(state, action) {
    const index = state.steps.findIndex((s) => s.id === action.input.id);
    if (index === -1)
      throw new StepNotFoundError(`Step ${action.input.id} not found`);
    if (state.submissions.some((s) => s.stepId === action.input.id))
      throw new StepInUseError(
        `Step ${action.input.id} is named by a submission and cannot be removed`,
      );
    state.steps.splice(index, 1);
  },
  targetCutOffOperation(state, action) {
    const step = state.steps.find((s) => s.id === action.input.id);
    if (!step) throw new StepNotFoundError(`Step ${action.input.id} not found`);
    if (step.kind !== "CUT_OFF")
      throw new NotACutOffError("Only a cut-off can be targeted");
    for (const other of state.steps) other.targeted = other.id === step.id;
  },
};
