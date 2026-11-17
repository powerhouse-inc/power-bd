import { describe, expect, it } from "vitest";
import {
  findingsHeadline,
  findingRows,
  findingTarget,
  openingView,
  PROPOSAL_TABS,
} from "./proposal-views.js";

describe("openingView", () => {
  it("opens a draft on Edit", () => {
    expect(openingView("DRAFT")).toBe("edit");
  });
  it.each([
    "APPROVED",
    "SENT",
    "ACCEPTED",
    "DECLINED",
    "WITHDRAWN",
    "SUPERSEDED",
  ] as const)("opens a locked proposal (%s) on Preview", (status) => {
    expect(openingView(status)).toBe("preview");
  });
});

describe("PROPOSAL_TABS", () => {
  it("lists the tabs of the Edit view in order", () => {
    expect(PROPOSAL_TABS.map((t) => t.label)).toEqual([
      "Details",
      "Packages",
      "Options and payment",
      "Scope",
      "Content",
      "References",
    ]);
  });
});

describe("findingTarget", () => {
  it.each([
    ["references", "references"],
    ["packages", "packages"],
    ["deliverables", "packages"],
    ["options", "options"],
    ["adjustments", "options"],
    ["paymentSteps", "options"],
    ["actors", "scope"],
    ["useCases", "scope"],
    ["boundaries", "scope"],
    ["sections", "content"],
    ["clauses", "content"],
    ["annexes", "content"],
    ["figures", "content"],
  ])("sends an item of %s to the %s tab", (list, tab) => {
    expect(findingTarget({ list, id: "x", field: "body" })).toEqual({
      tab,
      key: `${list}:x`,
      field: "body",
    });
    expect(findingTarget({ list, id: "x" })).toEqual({ tab, key: `${list}:x` });
  });
  it.each([
    ["title", "details"],
    ["validUntil", "details"],
    ["paymentSteps", "options"],
    ["clauses", "content"],
    ["annexes", "content"],
  ])("sends the %s of the proposal to the %s tab", (field, tab) => {
    expect(findingTarget({ field })).toEqual({ tab, key: `field:${field}` });
  });
  it("gives no target for something it does not know", () => {
    expect(findingTarget({ list: "elsewhere", id: "x" })).toBeNull();
    expect(findingTarget({ field: "elsewhere" })).toBeNull();
  });
});

describe("findingRows", () => {
  it("gives each finding its sentence and where to fix it", () => {
    expect(
      findingRows([
        {
          concerns: { list: "sections", id: "s1", field: "body" },
          sentence: "Section one still holds a placeholder.",
        },
        { concerns: { field: "elsewhere" }, sentence: "Something else." },
      ]),
    ).toEqual([
      {
        sentence: "Section one still holds a placeholder.",
        target: { tab: "content", key: "sections:s1", field: "body" },
        where: "Content",
      },
      { sentence: "Something else.", target: null, where: null },
    ]);
  });
});

describe("findingsHeadline", () => {
  it("says what the findings hold up on a draft", () => {
    expect(findingsHeadline(1, "DRAFT")).toBe(
      "1 thing to fix before you can approve",
    );
    expect(findingsHeadline(3, "DRAFT")).toBe(
      "3 things to fix before you can approve",
    );
  });
  it("only counts them once the proposal is approved", () => {
    expect(findingsHeadline(2, "APPROVED")).toBe("2 things to fix");
  });
});
