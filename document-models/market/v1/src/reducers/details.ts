import type { MarketDetailsOperations } from "document-models/market/v1";
import {
  FiguresApprovedError,
  InvalidHorizonError,
} from "../../gen/details/error.js";

export const marketDetailsOperations: MarketDetailsOperations = {
  setMarketDetailsOperation(state, action) {
    const { name, description, geography, currency, horizonYears } =
      action.input;
    if (horizonYears != null && horizonYears < 1)
      throw new InvalidHorizonError("The horizon is at least one year");
    const changesFigures =
      (currency !== undefined && currency !== state.currency) ||
      (horizonYears !== undefined && horizonYears !== state.horizonYears);
    if (changesFigures && state.sizeStatus === "APPROVED")
      throw new FiguresApprovedError("Reopen the figures to change them");
    if (name !== undefined) state.name = name ?? null;
    if (description !== undefined) state.description = description ?? null;
    if (geography !== undefined) state.geography = geography ?? null;
    if (currency !== undefined) state.currency = currency ?? null;
    if (horizonYears !== undefined) state.horizonYears = horizonYears ?? null;
  },
};
