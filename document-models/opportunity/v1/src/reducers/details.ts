import type { OpportunityDetailsOperations } from "document-models/opportunity/v1";
import {
  AmountNeedsCurrencyError,
  InvalidFundingRateError,
  OwnerRequiredError,
} from "../../gen/details/error.js";

export const opportunityDetailsOperations: OpportunityDetailsOperations = {
  setOpportunityDetailsOperation(state, action) {
    const { input } = action;
    const amount = input.amount === undefined ? state.amount : input.amount;
    const currency =
      input.currency === undefined ? state.currency : input.currency;
    if (amount != null && currency == null)
      throw new AmountNeedsCurrencyError("An amount needs a currency");
    if (
      input.fundingRate != null &&
      (input.fundingRate < 0 || input.fundingRate > 100)
    )
      throw new InvalidFundingRateError(
        "The funding rate is a percentage between 0 and 100",
      );

    if (input.name !== undefined) state.name = input.name;
    if (input.funderId !== undefined) state.funderId = input.funderId;
    if (input.programme !== undefined) state.programme = input.programme;
    if (input.roundLabel !== undefined) state.roundLabel = input.roundLabel;
    if (input.roundOpenedAt !== undefined)
      state.roundOpenedAt = input.roundOpenedAt;
    if (input.instrument !== undefined) state.instrument = input.instrument;
    if (input.amount !== undefined) state.amount = input.amount;
    if (input.currency !== undefined) state.currency = input.currency;
    if (input.fundingRate !== undefined) state.fundingRate = input.fundingRate;
    if (input.whereToApply !== undefined)
      state.whereToApply = input.whereToApply;
    if (input.rolling != null) state.rolling = input.rolling;
  },
  setOwnerOperation(state, action) {
    const { owner } = action.input;
    if (
      owner == null &&
      state.status !== "WATCHING" &&
      state.status !== "TO_EVALUATE"
    )
      throw new OwnerRequiredError(
        "An opportunity past to evaluate needs an owner",
      );
    state.owner = owner ?? null;
  },
  setFitOperation(state, action) {
    const { input } = action;
    if (input.fit !== undefined) state.fit = input.fit;
    if (input.reasoning !== undefined) state.fitReasoning = input.reasoning;
  },
};
