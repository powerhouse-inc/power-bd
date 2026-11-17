import { describe, expect, it } from "vitest";
import { opportunity } from "./fixtures.js";
import { totalsPerCurrency } from "./totals.js";

const opp = (amount: number | null, currency: string | null) => ({
  id: "x",
  state: opportunity({ amount, currency }),
});

describe("totalsPerCurrency", () => {
  it("sums per currency without converting, sorted by code", () => {
    expect(
      totalsPerCurrency([
        opp(100000, "EUR"),
        opp(50000, "CHF"),
        opp(25000, "EUR"),
        opp(7, "USD"),
      ]),
    ).toEqual([
      { currency: "CHF", amount: 50000, count: 1 },
      { currency: "EUR", amount: 125000, count: 2 },
      { currency: "USD", amount: 7, count: 1 },
    ]);
  });

  it("skips opportunities without an amount or a currency", () => {
    expect(
      totalsPerCurrency([opp(null, "EUR"), opp(5, null), opp(0, "EUR")]),
    ).toEqual([{ currency: "EUR", amount: 0, count: 1 }]);
  });

  it("is empty for no opportunities", () => {
    expect(totalsPerCurrency([])).toEqual([]);
  });
});
