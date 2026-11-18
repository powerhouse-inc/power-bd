import { addPublishedFigure, removePublishedFigure } from "document-models/market/v1";
import { describe, expect, it } from "vitest";
import { URL_, approvedDoc, lastError, run } from "./helpers.js";

const figure = (over: Partial<Parameters<typeof addPublishedFigure>[0]> = {}) =>
  addPublishedFigure({ id: "f1", label: " EU legal tech spend ", amount: 4_200_000_000, currency: "EUR", sourceTitle: " Analyst report ", sourceUrl: URL_, ...over });

describe("FiguresOperations", () => {
  it("adds a published figure with its source", () => {
    const doc = run(figure(), figure({ id: "f2", year: 2026, sourceUrl: null, sourceDocumentId: "n1" }));
    expect(doc.state.global.publishedFigures).toEqual([
      { id: "f1", label: "EU legal tech spend", amount: 4_200_000_000, currency: "EUR", year: null, source: { title: "Analyst report", url: URL_, documentId: null } },
      { id: "f2", label: "EU legal tech spend", amount: 4_200_000_000, currency: "EUR", year: 2026, source: { title: "Analyst report", url: null, documentId: "n1" } },
    ]);
  });

  it("refuses a figure without a label, below zero, without a source or with a repeated id", () => {
    expect(lastError(run(figure({ label: " " })))).toBe("A figure needs to say what it measures");
    expect(lastError(run(figure({ amount: -1 })))).toBe("A figure can't be negative");
    expect(lastError(run(figure({ sourceTitle: "" })))).toBe("A source needs a title");
    expect(lastError(run(figure({ sourceUrl: null })))).toBe("A source needs a link or a vault note");
    expect(lastError(run(figure(), figure()))).toBe("Figure f1 already exists");
  });

  it("removes a figure", () => {
    const doc = run(figure(), removePublishedFigure({ id: "f1" }));
    expect(doc.state.global.publishedFigures).toEqual([]);
    expect(lastError(run(doc, removePublishedFigure({ id: "f1" })))).toBe("Figure f1 not found");
  });

  it("changes no figure while they are approved", () => {
    expect(lastError(run(approvedDoc(), figure()))).toBe("Reopen the figures to change them");
    expect(lastError(run(approvedDoc(), removePublishedFigure({ id: "f1" })))).toBe("Reopen the figures to change them");
  });
});
