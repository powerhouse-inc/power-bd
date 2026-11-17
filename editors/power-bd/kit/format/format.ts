/** Pure text formatting shared by the proposal render and the views. */

const PLAIN = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * An amount in en-US with two decimals, with the currency when there is one.
 * A code the browser can't read ("XX1", typed by mistake or written by the
 * agent) shows as the code and the amount: a price never takes a page down.
 */
export function formatMoney(
  amount: number,
  currency: string | null | undefined,
): string {
  if (!currency) return PLAIN.format(amount);
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${PLAIN.format(amount)}`;
  }
}

/** What a currency looks like, said where one was refused. */
export const CURRENCY_FORMAT = "A currency is three letters, like CHF or EUR.";

/** Three letters as a currency code, in capitals; anything else is not one. */
export function currencyCode(text: string): string | null {
  const code = text.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : null;
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
