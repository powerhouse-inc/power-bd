import { describe, expect, it } from "vitest";
import { forecast, quarterOf, type ForecastLead } from "./forecast.js";

const lead = (over: Partial<ForecastLead> & { id: string }): ForecastLead => ({
  name: over.id,
  status: "PROPOSAL",
  kind: "SALES",
  expectedCloseDate: "2026-12-10T00:00:00.000Z",
  value: [{ currency: "EUR", amount: 10000 }],
  ...over,
});

describe("forecast", () => {
  it("names quarters", () => {
    expect(quarterOf("2026-11-18")).toBe("2026-Q4");
    expect(quarterOf("2027-01-01T00:00:00.000Z")).toBe("2027-Q1");
    expect(quarterOf("2026-06-30")).toBe("2026-Q2");
  });

  it("weights each open lead by its stage and groups by close quarter and currency", () => {
    const f = forecast([
      lead({ id: "a" }),
      lead({ id: "b", status: "MET", value: [{ currency: "EUR", amount: 20000 }] }),
      lead({ id: "c", expectedCloseDate: "2027-02-01T00:00:00.000Z", value: [{ currency: "CHF", amount: 5000 }] }),
    ]);
    expect(f.rows).toEqual([
      { quarter: "2026-Q4", currency: "EUR", weighted: 5000 + 6000, full: 30000, leads: 2 },
      { quarter: "2027-Q1", currency: "CHF", weighted: 2500, full: 5000, leads: 1 },
    ]);
    expect(f.counted).toBe(3);
  });

  it("keeps leads with no close date apart, last", () => {
    const f = forecast([lead({ id: "a", expectedCloseDate: null }), lead({ id: "b" })]);
    expect(f.rows.map((r) => r.quarter)).toEqual(["2026-Q4", null]);
    expect(f.noCloseDate).toBe(1);
  });

  it("lists open leads with no proposal value, and leaves out closed, parked and investor leads", () => {
    const f = forecast([
      lead({ id: "noValue", value: [] }),
      lead({ id: "won", status: "WON" }),
      lead({ id: "parked", status: "PARKED" }),
      lead({ id: "investor", kind: "INVESTOR" }),
    ]);
    expect(f.noValue).toEqual([{ id: "noValue", name: "noValue" }]);
    expect(f.investors).toBe(1);
    expect(f.counted).toBe(0);
    expect(f.rows).toEqual([]);
  });
});
