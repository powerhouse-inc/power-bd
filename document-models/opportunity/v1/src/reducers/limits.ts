import type { OpportunityLimitsOperations } from "document-models/opportunity/v1";
import {
  CheckedDateRequiredError,
  InvalidAttemptLimitError,
  SourceRequiredError,
} from "../../gen/limits/error.js";

export const opportunityLimitsOperations: OpportunityLimitsOperations = {
  setAttemptLimitOperation(state, action) {
    const { max, withdrawnCounts, source, checkedAt } = action.input;
    if (max < 1)
      throw new InvalidAttemptLimitError("The limit must be at least 1");
    if (!source?.trim())
      throw new SourceRequiredError("An attempt limit needs a source");
    if (!checkedAt)
      throw new CheckedDateRequiredError(
        "An attempt limit needs the date it was checked",
      );
    state.attemptLimit = { max, withdrawnCounts, source, checkedAt };
  },
  clearAttemptLimitOperation(state) {
    state.attemptLimit = null;
  },
  setApplyingEntityOperation(state, action) {
    state.applyingEntity = action.input.entity ?? null;
  },
};
