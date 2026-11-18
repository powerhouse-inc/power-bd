import { describe, expect, it } from "vitest";
import { filterRows, sourceLists } from "./filter.js";

const rows = [
  { id: "1", state: "LISTED", sourceList: "Map" },
  { id: "2", state: "SHORTLISTED", sourceList: "Map" },
  { id: "3", state: "EXCLUDED", sourceList: "Other" },
  { id: "4", state: "ENGAGED", sourceList: null },
] as const;

describe("filter", () => {
  it("filters by state and source list", () => {
    expect(filterRows(rows, "ALL", null).length).toBe(4);
    expect(filterRows(rows, "SHORTLISTED", null).map((r) => r.id)).toEqual([
      "2",
    ]);
    expect(filterRows(rows, "ALL", "Map").map((r) => r.id)).toEqual(["1", "2"]);
  });
  it("lists the distinct source lists, sorted", () => {
    expect(sourceLists(rows)).toEqual(["Map", "Other"]);
  });
});
