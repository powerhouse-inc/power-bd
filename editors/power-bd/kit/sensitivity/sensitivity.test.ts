import { describe, expect, it } from "vitest";
import { checkSensitivity } from "./sensitivity.js";

const neverClaims = [
  { id: "nc-1", phrases: ["guaranteed returns", "Zorblax certified"] },
  { id: "nc-2", phrases: [""] },
];
const confidential = [
  {
    id: "ci-1",
    text: "The Quillfeather board privately wants a merger with Marnoble before spring ends",
  },
];

describe("checkSensitivity: never-claim phrases", () => {
  it("finds a phrase written in another letter case, with its place", () => {
    const text = "We offer GUARANTEED Returns to all.";
    expect(checkSensitivity(text, neverClaims, [])).toEqual([
      {
        kind: "never-claim",
        itemId: "nc-1",
        phrase: "guaranteed returns",
        start: 9,
        end: 27,
      },
    ]);
  });

  it("finds every occurrence and ignores empty phrases", () => {
    const text = "zorblax certified, truly Zorblax Certified";
    const found = checkSensitivity(text, neverClaims, []);
    expect(found.map((f) => [f.itemId, f.start, f.end])).toEqual([
      ["nc-1", 0, 17],
      ["nc-1", 25, 42],
    ]);
  });

  it("returns nothing for a clean text", () => {
    expect(
      checkSensitivity("A plain, honest sentence.", neverClaims, confidential),
    ).toEqual([]);
  });
});

describe("checkSensitivity: confidential items", () => {
  it("finds an eight-word quote, in other case and punctuation", () => {
    const text =
      "Rumour: the QUILLFEATHER board, privately wants a merger with Marnoble!";
    expect(checkSensitivity(text, [], confidential)).toEqual([
      {
        kind: "confidential",
        itemId: "ci-1",
        words: 9,
        start: 8,
        end: 70,
      },
    ]);
  });

  it("does not find seven shared words", () => {
    const text = "board privately wants a merger with Marnoble";
    expect(checkSensitivity(text, [], confidential)).toEqual([]);
  });

  it("reports the longest shared run once, not each window", () => {
    const text =
      "x The Quillfeather board privately wants a merger with Marnoble before spring ends y";
    const found = checkSensitivity(text, [], confidential);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ words: 12, start: 2, end: 82 });
  });

  it("names the item for each of several items", () => {
    const items = [
      { id: "a", text: "one two three four five six seven eight" },
      { id: "b", text: "alpha beta gamma delta epsilon zeta eta theta" },
    ];
    const text =
      "alpha beta gamma delta epsilon zeta eta theta then one two three four five six seven eight";
    expect(checkSensitivity(text, [], items).map((f) => f.itemId)).toEqual([
      "b",
      "a",
    ]);
  });

  it("finds a repeated quote at each place", () => {
    const items = [
      { id: "a", text: "one two three four five six seven eight" },
    ];
    const text =
      "one two three four five six seven eight, again one two three four five six seven eight";
    expect(checkSensitivity(text, [], items).map((f) => f.start)).toEqual([
      0, 47,
    ]);
  });

  it("reports one finding when a repeating item yields overlapping runs", () => {
    const items = [{ id: "a", text: "la la la la la la la la la la" }];
    const found = checkSensitivity("la la la la la la la la la la", [], items);
    expect(found).toEqual([
      { kind: "confidential", itemId: "a", words: 10, start: 0, end: 29 },
    ]);
  });
});
