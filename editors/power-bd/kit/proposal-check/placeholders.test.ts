import { describe, expect, it } from "vitest";
import { emptyProposal, pkg } from "../proposal-totals/fixtures.js";
import { markPlaceholders, proposalCodes } from "./proposal-check.js";

const none = new Set<string>();

describe("markPlaceholders", () => {
  it("returns a text without placeholders as one unmarked piece", () => {
    expect(markPlaceholders("All written.", none)).toEqual([
      { text: "All written.", placeholder: false },
    ]);
  });
  it("marks every placeholder, in the order they are read", () => {
    expect(
      markPlaceholders("Owner: [•]. Start TBD, sign ____ [Client name]", none),
    ).toEqual([
      { text: "Owner: ", placeholder: false },
      { text: "[•]", placeholder: true },
      { text: ". Start ", placeholder: false },
      { text: "TBD", placeholder: true },
      { text: ", sign ", placeholder: false },
      { text: "____", placeholder: true },
      { text: " ", placeholder: false },
      { text: "[Client name]", placeholder: true },
    ]);
  });
  it("marks a word inside brackets once, as the whole bracket", () => {
    expect(markPlaceholders("[TBD]", none)).toEqual([
      { text: "[TBD]", placeholder: true },
    ]);
  });
  it("leaves the proposal's codes, links, task boxes and footnotes unmarked", () => {
    const text = "[BRI] [x] [a](https://example.test) note[^1]";
    expect(markPlaceholders(text, new Set(["BRI"]))).toEqual([
      { text, placeholder: false },
    ]);
  });
  it("gives nothing for an empty text", () => {
    expect(markPlaceholders("", none)).toEqual([]);
  });
});

describe("proposalCodes", () => {
  it("collects the codes of the proposal and its items", () => {
    expect(
      proposalCodes(emptyProposal({ code: "BRI", packages: [pkg("p1")] })),
    ).toEqual(new Set(["BRI", "P1"]));
  });
});
