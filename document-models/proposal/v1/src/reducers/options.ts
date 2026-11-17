import type { ProposalOptionsOperations } from "document-models/proposal/v1";
import {
  AdjustmentNotFoundError,
  DuplicateAdjustmentIdError,
  DuplicateOptionIdError,
  DuplicateOptionPackageError,
  OptionNotFoundError,
  ProposalNotDraftError,
  UnknownOptionPackageError,
} from "../../gen/options/error.js";
import { checkAmountCurrency } from "./shared.js";

function checkPackages(known: { id: string }[], packageIds: string[]) {
  packageIds.forEach((id, index) => {
    if (!known.some((p) => p.id === id))
      throw new UnknownOptionPackageError(`Package ${id} not found`);
    if (packageIds.indexOf(id) !== index)
      throw new DuplicateOptionPackageError(
        `Package ${id} is named twice in the option`,
      );
  });
}

export const proposalOptionsOperations: ProposalOptionsOperations = {
  addOptionOperation(state, action) {
    const { id, label, packageIds } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    if (state.options.some((o) => o.id === id))
      throw new DuplicateOptionIdError(`Option ${id} already exists`);
    checkPackages(state.packages, packageIds);
    state.options.push({ id, label, packageIds, adjustments: [] });
  },
  updateOptionOperation(state, action) {
    const { id, label, packageIds } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const option = state.options.find((o) => o.id === id);
    if (!option) throw new OptionNotFoundError(`Option ${id} not found`);
    if (packageIds != null) checkPackages(state.packages, packageIds);
    if (label != null) option.label = label;
    if (packageIds != null) option.packageIds = packageIds;
  },
  removeOptionOperation(state, action) {
    const { id } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const index = state.options.findIndex((o) => o.id === id);
    if (index === -1) throw new OptionNotFoundError(`Option ${id} not found`);
    state.options.splice(index, 1);
  },
  addAdjustmentOperation(state, action) {
    const { optionId, id, label, amount, currency, condition } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const option = state.options.find((o) => o.id === optionId);
    if (!option) throw new OptionNotFoundError(`Option ${optionId} not found`);
    if (state.options.some((o) => o.adjustments.some((a) => a.id === id)))
      throw new DuplicateAdjustmentIdError(`Adjustment ${id} already exists`);
    checkAmountCurrency(state, [amount], currency);
    option.adjustments.push({
      id,
      label,
      amount,
      condition: condition ?? null,
    });
  },
  removeAdjustmentOperation(state, action) {
    const { optionId, id } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const option = state.options.find((o) => o.id === optionId);
    if (!option) throw new OptionNotFoundError(`Option ${optionId} not found`);
    const index = option.adjustments.findIndex((a) => a.id === id);
    if (index === -1)
      throw new AdjustmentNotFoundError(
        `Adjustment ${id} not found in option ${optionId}`,
      );
    option.adjustments.splice(index, 1);
  },
};
