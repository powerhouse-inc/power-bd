import { describe, expect, it } from "vitest";
import {
  columnMode,
  tileActive,
  tileView,
  type BoardViewState,
} from "./board-view.js";

const base: BoardViewState = {
  asTable: false,
  kind: "",
  owner: "",
  status: "",
  mine: false,
};

describe("columnMode", () => {
  it("opens a stage that holds something", () => {
    expect(columnMode("NEW", 3, false)).toBe("open");
    expect(columnMode("CLOSED", 2, true)).toBe("open");
  });

  it("keeps Closed folded until it is asked for", () => {
    expect(columnMode("CLOSED", 2, false)).toBe("collapsed");
  });

  it("folds any empty stage to a strip that cannot be opened", () => {
    expect(columnMode("PARKED", 0, false)).toBe("empty");
    expect(columnMode("CLOSED", 0, false)).toBe("empty");
    expect(columnMode("CLOSED", 0, true)).toBe("empty");
  });
});

describe("tileView", () => {
  const narrowed: BoardViewState = {
    asTable: true,
    kind: "lead",
    owner: "0xa1",
    status: "MET",
    mine: true,
  };

  it("shows every relationship on the board", () => {
    expect(tileView("relationships", narrowed)).toEqual(base);
  });

  it("shows the open decisions in the table, where decisions live", () => {
    const v = tileView("decisions", narrowed);
    expect(v).toEqual({
      asTable: true,
      kind: "decision",
      owner: "",
      status: "OPEN",
      mine: false,
    });
    expect(tileActive("decisions", v)).toBe(true);
    expect(tileView("decisions", v)).toEqual(base);
  });

  it("narrows to funding, in whichever of board or table is showing", () => {
    const v = tileView("funding", narrowed);
    expect(v).toEqual({
      asTable: true,
      kind: "opportunity",
      owner: "",
      status: "",
      mine: false,
    });
    expect(tileActive("funding", v)).toBe(true);
    expect(tileView("funding", v)).toEqual({ ...base, asTable: true });
    expect(tileView("funding", base).asTable).toBe(false);
  });
});

describe("tileActive", () => {
  it("is off when another filter narrows further, since the figure no longer matches", () => {
    expect(
      tileActive("funding", { ...base, kind: "opportunity", mine: true }),
    ).toBe(false);
    expect(
      tileActive("funding", { ...base, kind: "opportunity", status: "X" }),
    ).toBe(false);
    expect(
      tileActive("decisions", {
        ...base,
        asTable: true,
        kind: "decision",
        status: "OPEN",
        owner: "0xa1",
      }),
    ).toBe(false);
    expect(tileActive("decisions", base)).toBe(false);
    expect(tileActive("funding", base)).toBe(false);
  });

  it("is never on for the relationships tile, which only resets", () => {
    expect(tileActive("relationships", base)).toBe(false);
  });
});
