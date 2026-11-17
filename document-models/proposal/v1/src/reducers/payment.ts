import type { ProposalPaymentOperations } from "document-models/proposal/v1";
import {
  DuplicatePaymentStepIdError,
  InvalidPercentageError,
  PaymentDateRequiredError,
  PaymentStepNotFoundError,
  ProposalNotDraftError,
} from "../../gen/payment/error.js";

function checkStep(percentage: number, trigger: string, date: string | null) {
  if (percentage < 0 || percentage > 100)
    throw new InvalidPercentageError("A percentage is between 0 and 100");
  if (trigger === "ON_DATE" && date == null)
    throw new PaymentDateRequiredError("A step paid on a date needs the date");
}

export const proposalPaymentOperations: ProposalPaymentOperations = {
  addPaymentStepOperation(state, action) {
    const { id, label, trigger, percentage, date } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    if (state.paymentSteps.some((s) => s.id === id))
      throw new DuplicatePaymentStepIdError(
        `Payment step ${id} already exists`,
      );
    checkStep(percentage, trigger, date ?? null);
    state.paymentSteps.push({
      id,
      label,
      trigger,
      percentage,
      date: trigger === "ON_DATE" ? date! : null,
    });
  },
  updatePaymentStepOperation(state, action) {
    const input = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const step = state.paymentSteps.find((s) => s.id === input.id);
    if (!step)
      throw new PaymentStepNotFoundError(`Payment step ${input.id} not found`);
    const trigger = input.trigger ?? step.trigger;
    const percentage = input.percentage ?? step.percentage;
    const date = (input.date !== undefined ? input.date : step.date) ?? null;
    checkStep(percentage, trigger, date);
    step.label = input.label ?? step.label;
    step.trigger = trigger;
    step.percentage = percentage;
    step.date = trigger === "ON_DATE" ? date : null;
  },
  removePaymentStepOperation(state, action) {
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const index = state.paymentSteps.findIndex((s) => s.id === action.input.id);
    if (index === -1)
      throw new PaymentStepNotFoundError(
        `Payment step ${action.input.id} not found`,
      );
    state.paymentSteps.splice(index, 1);
  },
};
