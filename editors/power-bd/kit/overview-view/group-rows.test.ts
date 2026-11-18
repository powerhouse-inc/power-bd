import { describe, expect, it } from "vitest";
import { groupRows } from "./group-rows.js";

type Row = { id: string; status: "A" | "B" | "C" };
const rows: Row[] = [
  { id: "1", status: "B" },
  { id: "2", status: "A" },
  { id: "3", status: "B" },
];

describe("groupRows", () => {
  it("puts the groups in the board's order, whatever the rows' order", () => {
    expect(
      groupRows(rows, ["A", "B", "C"], (r) => r.status).map((g) => g.status),
    ).toEqual(["A", "B", "C"]);
  });

  it("keeps the list's order inside each group", () => {
    const b = groupRows(rows, ["A", "B", "C"], (r) => r.status).at(1);
    expect(b?.rows.map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("gives an empty status its group, so it can take a drop", () => {
    expect(groupRows(rows, ["A", "B", "C"], (r) => r.status)[2]).toEqual({
      status: "C",
      rows: [],
    });
    expect(groupRows([], ["A", "B"], (r: Row) => r.status)).toEqual([
      { status: "A", rows: [] },
      { status: "B", rows: [] },
    ]);
  });

  it("leaves out a row whose status has no group", () => {
    const groups = groupRows(rows, ["A"], (r) => r.status);
    expect(groups).toEqual([{ status: "A", rows: [{ id: "2", status: "A" }] }]);
  });
});
