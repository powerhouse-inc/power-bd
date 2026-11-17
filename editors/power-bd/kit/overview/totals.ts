import type { OpportunityState } from "document-models/opportunity";
import type { CurrencyTotal, Record_ } from "./types.js";

/** Amounts summed per currency, never converted, sorted by currency code. */
export function totalsPerCurrency(
  opportunities: Record_<OpportunityState>[],
): CurrencyTotal[] {
  const byCurrency = new Map<string, CurrencyTotal>();
  for (const { state } of opportunities) {
    if (state.amount == null || !state.currency) continue;
    const total = byCurrency.get(state.currency) ?? {
      currency: state.currency,
      amount: 0,
      count: 0,
    };
    total.amount += state.amount;
    total.count += 1;
    byCurrency.set(state.currency, total);
  }
  return [...byCurrency.values()].sort((a, b) =>
    a.currency < b.currency ? -1 : 1,
  );
}
