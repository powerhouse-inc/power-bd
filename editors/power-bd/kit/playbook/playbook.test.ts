import { describe, expect, it } from "vitest";
import {
  approvalState,
  editNote,
  parsePhrases,
  phrasesToText,
} from "./playbook.js";

describe("editNote", () => {
  it("warns before editing approved positioning", () => {
    expect(editNote("APPROVED")).toMatch(/back to draft/);
  });
  it("says nothing for a draft", () => {
    expect(editNote("DRAFT")).toBeUndefined();
  });
  it("says retired positioning is final", () => {
    expect(editNote("RETIRED")).toMatch(/cannot change/);
  });
});

describe("parsePhrases", () => {
  it("splits lines, trims, drops blanks and repeats", () => {
    expect(parsePhrases(" a b \n\n c\na b\n")).toEqual(["a b", "c"]);
  });
  it("round-trips", () => {
    expect(parsePhrases(phrasesToText(["x", "y z"]))).toEqual(["x", "y z"]);
  });
});

describe("approvalState", () => {
  it("lets a signed-in person approve a draft", () => {
    expect(approvalState("DRAFT", true)).toEqual({ allowed: true });
  });
  it("needs a signed-in person", () => {
    expect(approvalState("DRAFT", false).allowed).toBe(false);
  });
  it("only a draft", () => {
    expect(approvalState("APPROVED", true).allowed).toBe(false);
    expect(approvalState("RETIRED", true).allowed).toBe(false);
  });
});
