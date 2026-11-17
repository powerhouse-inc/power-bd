import { describe, expect, it } from "vitest";
import { lead, opportunity } from "./fixtures.js";
import { gatingDecisions } from "./gating.js";

describe("what a decision gates", () => {
  it("gates a lead through its decision references only", () => {
    const s = lead({
      references: [
        { id: "1", kind: "DECISION", documentId: "D1", title: "t" },
        { id: "2", kind: "NOTE", documentId: "N1", title: "t" },
      ] as never,
    });
    expect(gatingDecisions("lead", s)).toEqual(["D1"]);
  });

  it("gates an opportunity through its blocked decision and its conditions", () => {
    const s = opportunity({
      blocked: { decisionId: "D1", text: "w" },
      conditions: [{ id: "c", decisionIds: ["D2", "D3"] }] as never,
    });
    expect(gatingDecisions("opportunity", s)).toEqual(["D1", "D2", "D3"]);
    expect(
      gatingDecisions("opportunity", opportunity({ blocked: null })),
    ).toEqual([]);
  });
});
