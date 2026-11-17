import type { ProposalState } from "document-models/proposal/v1";
import {
  AmountCurrencyMismatchError,
  CurrencyNotSetError,
} from "../../gen/packages/error.js";

/**
 * An amount is in the proposal's currency. The currency that came beside it, if
 * any, must be that currency, and the proposal must have one.
 */
export function checkAmountCurrency(
  state: ProposalState,
  amounts: (number | null | undefined)[],
  currency: string | null | undefined,
) {
  if (amounts.every((amount) => amount == null)) return;
  if (state.currency == null)
    throw new CurrencyNotSetError(
      "Set the proposal's currency before entering an amount",
    );
  if (currency != null && currency !== state.currency)
    throw new AmountCurrencyMismatchError(
      `Amounts are in the proposal's currency (${state.currency}), not ${currency}`,
    );
}

/** Whether any package price, deliverable amount or adjustment holds an amount. */
export function hasAmount(state: ProposalState) {
  return (
    state.packages.some((pkg) => pkg.price != null) ||
    state.deliverables.some(
      (deliverable) => deliverable.price?.amount != null,
    ) ||
    state.options.some((option) => option.adjustments.length > 0)
  );
}

export function checkPermutation(
  current: { id: string }[],
  ids: string[],
  fail: () => never,
) {
  const sorted = (list: string[]) => [...list].sort().join("\n");
  if (sorted(current.map((item) => item.id)) !== sorted(ids)) fail();
}
