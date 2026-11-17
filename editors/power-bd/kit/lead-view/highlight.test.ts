import { describe, expect, it } from "vitest";
import { highlight } from "./highlight.js";

describe("highlight", () => {
  it("splits text around the ranges", () => {
    expect(highlight("abcdef", [{ start: 1, end: 3 }])).toEqual([
      { text: "a", marked: false },
      { text: "bc", marked: true },
      { text: "def", marked: false },
    ]);
  });
  it("merges overlapping ranges and handles no ranges", () => {
    expect(
      highlight("abcdef", [
        { start: 0, end: 2 },
        { start: 1, end: 4 },
      ]),
    ).toEqual([
      { text: "abcd", marked: true },
      { text: "ef", marked: false },
    ]);
    expect(highlight("abc", [])).toEqual([{ text: "abc", marked: false }]);
  });
});

describe("highlight edges", () => {
  it("marks a range that runs to the end of the text", () => {
    expect(highlight("abcd", [{ start: 2, end: 4 }])).toEqual([
      { text: "ab", marked: false },
      { text: "cd", marked: true },
    ]);
  });
  it("ignores a range inside one already marked", () => {
    expect(
      highlight("abcdef", [
        { start: 0, end: 4 },
        { start: 1, end: 3 },
      ]),
    ).toEqual([
      { text: "abcd", marked: true },
      { text: "ef", marked: false },
    ]);
  });
  it("joins ranges that touch without a gap", () => {
    expect(
      highlight("abcdef", [
        { start: 0, end: 2 },
        { start: 2, end: 4 },
      ]),
    ).toEqual([
      { text: "abcd", marked: true },
      { text: "ef", marked: false },
    ]);
  });
  it("returns the whole text unmarked when every range is empty", () => {
    expect(highlight("abc", [{ start: 1, end: 1 }])).toEqual([
      { text: "abc", marked: false },
    ]);
  });
});

describe("highlight of empty text", () => {
  it("returns one empty unmarked piece", () => {
    expect(highlight("", [])).toEqual([{ text: "", marked: false }]);
  });
});
