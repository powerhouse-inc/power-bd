import { describe, expect, it } from "vitest";
import { parseImport } from "./import.js";

const ids = () => {
  let n = 0;
  return () => `id-${++n}`;
};

describe("parseImport", () => {
  it("reads name, website and source list", () => {
    const r = parseImport(
      "Velden Capital, velden.example, Regional map 2026\nArbor Nine, arbornine.example, Regional map 2026",
      ids(),
    );
    expect(r.rows).toEqual([
      {
        id: "id-1",
        name: "Velden Capital",
        website: "velden.example",
        sourceList: "Regional map 2026",
      },
      {
        id: "id-2",
        name: "Arbor Nine",
        website: "arbornine.example",
        sourceList: "Regional map 2026",
      },
    ]);
    expect(r.skipped).toEqual([]);
  });

  it("accepts tabs and a name alone, and leaves missing parts out", () => {
    const r = parseImport("Halloway Fund\tgrowth.example\nPemberly", ids());
    expect(r.rows[0]).toMatchObject({
      name: "Halloway Fund",
      website: "growth.example",
    });
    expect(r.rows[0].sourceList).toBeUndefined();
    expect(r.rows[1]).toEqual({ id: "id-2", name: "Pemberly" });
  });

  it("keeps commas inside the last part", () => {
    const r = parseImport("A, a.example, Map, second edition", ids());
    expect(r.rows[0].sourceList).toBe("Map, second edition");
  });

  it("skips blank lines silently and lines without a name with their number", () => {
    const r = parseImport("\nA, a.example\n , b.example\n\nB", ids());
    expect(r.rows.map((x) => x.name)).toEqual(["A", "B"]);
    expect(r.skipped).toEqual([{ line: 3, text: ", b.example" }]);
  });

  it("drops a repeated name within the paste", () => {
    const r = parseImport("A\na\nB", ids());
    expect(r.rows.map((x) => x.name)).toEqual(["A", "B"]);
    expect(r.skipped).toEqual([{ line: 2, text: "a" }]);
  });
});
