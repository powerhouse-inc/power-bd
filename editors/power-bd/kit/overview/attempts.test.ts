import { describe, expect, it } from "vitest";
import { attemptsLeft } from "./attempts.js";
import { opportunity } from "./fixtures.js";

const prog = { id: "prog-1", title: "Green Grants" };
const entity = { id: "ent-1", title: "Northwind Foundation" };
const limit = (max: number, withdrawnCounts = false) => ({
  max,
  withdrawnCounts,
  source: "call text",
  checkedAt: "2026-01-01T00:00:00.000Z",
});
const sub = (result: string, id = "u") => ({
  id,
  submittedAt: "2026-02-01T00:00:00.000Z",
  submittedBy: "0x1",
  outcome: { result, receivedAt: "2026-03-01T00:00:00.000Z" },
});
const opp = (id: string, over: object = {}) => ({
  id,
  state: opportunity({
    programme: prog,
    applyingEntity: entity,
    attemptLimit: limit(3),
    ...over,
  }),
});

describe("attemptsLeft", () => {
  it("is the limit when nothing was unsuccessful", () => {
    const a = opp("a");
    expect(attemptsLeft(a, [a])).toBe(3);
  });

  it("counts a rejected step on another opportunity of the same programme and entity", () => {
    const a = opp("a");
    const b = opp("b", { submissions: [sub("UNSUCCESSFUL")] });
    expect(attemptsLeft(a, [a, b])).toBe(2);
    expect(attemptsLeft(b, [a, b])).toBe(2);
  });

  it("counts unsuccessful outcomes of two steps", () => {
    const a = opp("a", { submissions: [sub("UNSUCCESSFUL", "x")] });
    const b = opp("b", {
      submissions: [sub("UNSUCCESSFUL", "y"), sub("PASSED", "z")],
    });
    expect(attemptsLeft(a, [a, b])).toBe(1);
  });

  it("does not count a different entity or programme", () => {
    const a = opp("a");
    const other = opp("b", {
      applyingEntity: { id: "ent-2", title: "Southwind" },
      submissions: [sub("UNSUCCESSFUL")],
    });
    const otherProg = opp("c", {
      programme: { id: "prog-2", title: "Blue Grants" },
      submissions: [sub("UNSUCCESSFUL")],
    });
    expect(attemptsLeft(a, [a, other, otherProg])).toBe(3);
  });

  it("counts a withdrawn submission only when the limit says so", () => {
    const w = { submissions: [sub("WITHDRAWN")] };
    const no = opp("a", w);
    const yes = opp("b", { ...w, attemptLimit: limit(3, true) });
    expect(attemptsLeft(no, [no])).toBe(3);
    expect(attemptsLeft(yes, [yes])).toBe(2);
  });

  it("ignores submissions without an outcome, passed and awarded", () => {
    const a = opp("a", {
      submissions: [
        { ...sub("PASSED"), outcome: null },
        sub("PASSED", "p"),
        sub("AWARDED", "w"),
      ],
    });
    expect(attemptsLeft(a, [a])).toBe(3);
  });

  it("never goes below zero", () => {
    const a = opp("a", {
      attemptLimit: limit(1),
      submissions: [sub("UNSUCCESSFUL", "x"), sub("UNSUCCESSFUL", "y")],
    });
    expect(attemptsLeft(a, [a])).toBe(0);
  });

  it("is unknown without a limit or an applying entity", () => {
    const noLimit = opp("a", { attemptLimit: null });
    const noEntity = opp("b", { applyingEntity: null });
    expect(attemptsLeft(noLimit, [noLimit])).toBeNull();
    expect(attemptsLeft(noEntity, [noEntity])).toBeNull();
  });

  it("matches opportunities without a programme to each other only", () => {
    const a = opp("a", { programme: null });
    const b = opp("b", { programme: null, submissions: [sub("UNSUCCESSFUL")] });
    const c = opp("c", { submissions: [sub("UNSUCCESSFUL")] });
    expect(attemptsLeft(a, [a, b, c])).toBe(2);
  });
});
