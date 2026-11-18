import { reopenSize, setMarketDetails, utils } from "document-models/market/v1";
import { describe, expect, it } from "vitest";
import { approvedDoc, lastError, run } from "./helpers.js";

describe("DetailsOperations", () => {
  it("starts in EUR, over three years, as a draft", () => {
    const s = utils.createDocument().state.global;
    expect(s).toMatchObject({ currency: "EUR", horizonYears: 3, sizeStatus: "DRAFT", segments: [], players: [] });
  });

  it("sets what it is given and leaves the rest", () => {
    let doc = run(setMarketDetails({ name: "Finance operations, EU", geography: "EU", description: "Finance teams" }));
    doc = run(doc, setMarketDetails({ currency: "CHF", horizonYears: 5 }));
    expect(lastError(doc)).toBeUndefined();
    expect(doc.state.global).toMatchObject({
      name: "Finance operations, EU",
      geography: "EU",
      description: "Finance teams",
      currency: "CHF",
      horizonYears: 5,
    });
  });

  it("clears a field set to null", () => {
    const doc = run(setMarketDetails({ name: "A" }), setMarketDetails({ name: null, description: null, geography: null, currency: null, horizonYears: null }));
    expect(doc.state.global).toMatchObject({ name: null, description: null, geography: null, currency: null, horizonYears: null });
  });

  it("refuses a horizon under one year", () => {
    const doc = run(setMarketDetails({ horizonYears: 0 }));
    expect(lastError(doc)).toBe("The horizon is at least one year");
    expect(doc.state.global.horizonYears).toBe(3);
  });

  it("keeps the currency and horizon of approved figures, but not the name", () => {
    let doc = approvedDoc();
    doc = run(doc, setMarketDetails({ currency: "USD" }));
    expect(lastError(doc)).toBe("Reopen the figures to change them");
    doc = run(doc, setMarketDetails({ horizonYears: 4 }));
    expect(lastError(doc)).toBe("Reopen the figures to change them");
    doc = run(doc, setMarketDetails({ name: "Renamed", currency: "EUR", horizonYears: 3 }));
    expect(lastError(doc)).toBeUndefined();
    expect(doc.state.global.name).toBe("Renamed");
    doc = run(doc, reopenSize({}), setMarketDetails({ currency: "USD" }));
    expect(doc.state.global.currency).toBe("USD");
  });
});
