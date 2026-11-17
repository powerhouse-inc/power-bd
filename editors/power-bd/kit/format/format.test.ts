import { describe, expect, it } from "vitest";
import {
  CURRENCY_FORMAT,
  currencyCode,
  formatMoney,
  formatMoneyCompact,
  periodWord,
} from "./format.js";

describe("formatMoney", () => {
  it("formats a currency amount in en-US", () => {
    expect(formatMoney(12000, "USD")).toBe("$12,000.00");
  });
  it("shows two decimals without the symbol when no currency is given", () => {
    expect(formatMoney(1234.5, null)).toBe("1,234.50");
    expect(formatMoney(7, undefined)).toBe("7.00");
  });
});

describe("periodWord", () => {
  it("names each billing period", () => {
    expect(periodWord("MONTH")).toBe("month");
    expect(periodWord("QUARTER")).toBe("quarter");
    expect(periodWord("YEAR")).toBe("year");
  });
});

describe("formatMoneyCompact", () => {
  it("shortens a currency amount in en-GB", () => {
    expect(formatMoneyCompact(12000, "EUR")).toBe("\u20ac12k");
    expect(formatMoneyCompact(1500000, "GBP")).toBe("\u00a31.5m");
  });
  it("falls back to the code and the plain amount for an unknown currency", () => {
    expect(formatMoneyCompact(8, "??")).toBe("?? 8");
  });
});

describe("formatMoney with a code no browser knows how to read", () => {
  it("shows the code and the amount instead of failing the page", () => {
    expect(formatMoney(1234.5, "XX1")).toBe("XX1 1,234.50");
    expect(formatMoney(18000, "EURO")).toBe("EURO 18,000.00");
  });

  it("still formats a well-formed code it does not know", () => {
    expect(formatMoney(1, "XYZ")).toContain("XYZ");
  });
});

describe("currencyCode", () => {
  it("reads three letters as a code, in capitals", () => {
    expect(currencyCode("chf")).toBe("CHF");
    expect(currencyCode(" eur ")).toBe("EUR");
  });

  it("refuses anything else", () => {
    for (const bad of ["", "XX1", "EURO", "E", "€", "US D"]) expect(currencyCode(bad)).toBeNull();
  });

  it("says what a code looks like", () => {
    expect(CURRENCY_FORMAT).toMatch(/three letters/);
  });
});
