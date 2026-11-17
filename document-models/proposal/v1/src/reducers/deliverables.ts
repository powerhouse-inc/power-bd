import type { ProposalDeliverablesOperations } from "document-models/proposal/v1";
import {
  AmountRequiredError,
  DeliverableNotFoundError,
  DeliverableOrderMismatchError,
  DuplicateDeliverableCodeError,
  DuplicateDeliverableIdError,
  IncludedHasNoAmountError,
  PackageNotFoundError,
  PackagePricedTwiceError,
  PeriodRequiredError,
  ProposalNotDraftError,
  UnitRequiredError,
  UpperAmountBelowAmountError,
} from "../../gen/deliverables/error.js";
import { checkAmountCurrency, checkPermutation } from "./shared.js";

export const proposalDeliverablesOperations: ProposalDeliverablesOperations = {
  addDeliverableOperation(state, action) {
    const { id, code, packageId, title, body } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    if (state.deliverables.some((d) => d.id === id))
      throw new DuplicateDeliverableIdError(`Deliverable ${id} already exists`);
    if (state.deliverables.some((d) => d.code === code))
      throw new DuplicateDeliverableCodeError(
        `Deliverable code ${code} is already used`,
      );
    if (!state.packages.some((p) => p.id === packageId))
      throw new PackageNotFoundError(`Package ${packageId} not found`);
    state.deliverables.push({
      id,
      code,
      packageId,
      title,
      body: body ?? null,
      price: null,
    });
  },
  updateDeliverableOperation(state, action) {
    const input = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const deliverable = state.deliverables.find((d) => d.id === input.id);
    if (!deliverable)
      throw new DeliverableNotFoundError(`Deliverable ${input.id} not found`);
    if (
      input.code != null &&
      state.deliverables.some((d) => d.id !== input.id && d.code === input.code)
    )
      throw new DuplicateDeliverableCodeError(
        `Deliverable code ${input.code} is already used`,
      );
    if (input.packageId != null) {
      const target = state.packages.find((p) => p.id === input.packageId);
      if (!target)
        throw new PackageNotFoundError(`Package ${input.packageId} not found`);
      if (target.price != null && deliverable.price?.pricing === "FIXED")
        throw new PackagePricedTwiceError(
          `Package ${target.id} has its own price, so it cannot have a fixed-price deliverable`,
        );
      deliverable.packageId = input.packageId;
    }
    if (input.code != null) deliverable.code = input.code;
    if (input.title != null) deliverable.title = input.title;
    if (input.body !== undefined) deliverable.body = input.body;
  },
  setDeliverablePriceOperation(state, action) {
    const input = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const deliverable = state.deliverables.find((d) => d.id === input.id);
    if (!deliverable)
      throw new DeliverableNotFoundError(`Deliverable ${input.id} not found`);
    const { pricing, amount, upperAmount } = input;
    if (pricing === "INCLUDED") {
      if (amount != null || upperAmount != null)
        throw new IncludedHasNoAmountError(
          "An included deliverable has no amount",
        );
    } else {
      if (amount == null)
        throw new AmountRequiredError(
          `${{ FIXED: "A fixed price", RECURRING: "A recurring price", RATE: "A rate" }[pricing]} needs an amount`,
        );
      if (pricing === "RECURRING" && input.period == null)
        throw new PeriodRequiredError("A recurring price needs a period");
      if (pricing === "RATE" && input.unit == null)
        throw new UnitRequiredError("A rate needs a unit");
      if (upperAmount != null && upperAmount < amount)
        throw new UpperAmountBelowAmountError(
          "The upper amount cannot be below the amount",
        );
    }
    checkAmountCurrency(state, [amount, upperAmount], input.currency);
    const target = state.packages.find((p) => p.id === deliverable.packageId);
    if (pricing === "FIXED" && target?.price != null)
      throw new PackagePricedTwiceError(
        `Package ${target.id} has its own price, so it cannot have a fixed-price deliverable`,
      );
    deliverable.price = {
      pricing,
      amount: amount ?? null,
      upperAmount: upperAmount ?? null,
      period: pricing === "RECURRING" ? input.period! : null,
      unit: pricing === "RATE" ? input.unit! : null,
      until: pricing === "RECURRING" ? (input.until ?? null) : null,
      note: input.note ?? null,
    };
  },
  removeDeliverableOperation(state, action) {
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const index = state.deliverables.findIndex((d) => d.id === action.input.id);
    if (index === -1)
      throw new DeliverableNotFoundError(
        `Deliverable ${action.input.id} not found`,
      );
    state.deliverables.splice(index, 1);
  },
  reorderDeliverablesOperation(state, action) {
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const { ids } = action.input;
    checkPermutation(state.deliverables, ids, () => {
      throw new DeliverableOrderMismatchError(
        "The new order must list every deliverable exactly once",
      );
    });
    state.deliverables = ids.map((id) =>
      state.deliverables.find((d) => d.id === id)!,
    );
  },
};
