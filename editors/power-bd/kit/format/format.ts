/** Pure text formatting shared by the proposal render and the views. */

/** An amount in en-US with two decimals, with the currency when there is one. */
export function formatMoney(
  amount: number,
  currency: string | null | undefined,
): string {
  const format = new Intl.NumberFormat(
    "en-US",
    currency
      ? { style: "currency", currency }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  );
  return format.format(amount);
}

const PERIOD_WORD = { MONTH: "month", QUARTER: "quarter", YEAR: "year" };

/** The word for a billing period ("month"). */
export function periodWord(period: keyof typeof PERIOD_WORD): string {
  return PERIOD_WORD[period];
}

/** A short amount in en-GB ("€12k"); the code and the plain amount when the currency is unknown. */
export function formatMoneyCompact(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}
