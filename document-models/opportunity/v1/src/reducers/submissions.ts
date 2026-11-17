import type { OpportunitySubmissionsOperations } from "document-models/opportunity/v1";
import {
  AmountNeedsCurrencyError,
  DuplicateSubmissionIdError,
  OutcomeAlreadyRecordedError,
  StepNotFoundError,
  SubmissionNotFoundError,
} from "../../gen/submissions/error.js";

export const opportunitySubmissionsOperations: OpportunitySubmissionsOperations =
  {
    markSubmissionOperation(state, action) {
      const { input } = action;
      if (state.submissions.some((s) => s.id === input.id))
        throw new DuplicateSubmissionIdError(
          `Submission ${input.id} already exists`,
        );
      if (input.stepId && !state.steps.some((s) => s.id === input.stepId))
        throw new StepNotFoundError(`Step ${input.stepId} not found`);

      state.submissions.push({
        id: input.id,
        stepId: input.stepId ?? null,
        submittedAt: input.submittedAt,
        where: input.where ?? null,
        submittedBy: input.submittedBy,
        outcome: null,
      });
    },
    recordSubmissionOutcomeOperation(state, action) {
      const { input } = action;
      const submission = state.submissions.find((s) => s.id === input.id);
      if (!submission)
        throw new SubmissionNotFoundError(`Submission ${input.id} not found`);
      if (submission.outcome)
        throw new OutcomeAlreadyRecordedError(
          `The outcome of submission ${input.id} is already recorded`,
        );
      if (input.amount != null && input.currency == null)
        throw new AmountNeedsCurrencyError("An amount needs a currency");

      submission.outcome = {
        result: input.result,
        amount: input.amount ?? null,
        currency: input.currency ?? null,
        text: input.text ?? null,
        receivedAt: input.receivedAt,
      };
    },
  };
