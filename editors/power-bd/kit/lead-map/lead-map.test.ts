import { describe, expect, it } from "vitest";
import { DOT_MAX, DOT_MIN, leftOutLine, priorityMap, quadrantOf, type MapLead } from "./lead-map.js";

let n = 0;
const lead = (over: Partial<MapLead> = {}): MapLead => ({
  id: `l${++n}`,
  name: `Lead ${n}`,
  status: "TO_CONTACT",
  fits: ["GOOD"],
  value: [],
  slipping: false,
  ...over,
});

describe("priorityMap", () => {
  it("places a lead by its best angle's fit and how far along it is", () => {
    const { dots } = priorityMap([lead({ name: "A", status: "MET", fits: ["LATER", "BEST"] })]);
    expect(dots[0]).toMatchObject({ name: "A", column: 4, row: 3, quadrant: "CLOSE", x: 90, y: 70 });
  });

  it("puts a lead with no angle in the not-assessed column, outside the quadrants", () => {
    const map = priorityMap([lead({ fits: [] })]);
    expect(map.dots[0]).toMatchObject({ column: 0, quadrant: null, x: 10 });
    expect(map.unassessed).toBe(1);
  });

  it("names the four quadrants by fit and stage", () => {
    expect([quadrantOf(4, 4), quadrantOf(3, 0), quadrantOf(2, 2), quadrantOf(1, 1), quadrantOf(0, 4)]).toEqual([
      "CLOSE",
      "START",
      "CHECK",
      "PARK",
      null,
    ]);
  });

  it("leaves won, lost and parked leads off, counting them", () => {
    const map = priorityMap([lead({ status: "WON" }), lead({ status: "LOST" }), lead({ status: "LOST" }), lead({ status: "PARKED" }), lead()]);
    expect(map.dots).toHaveLength(1);
    expect(map.left).toEqual({ won: 1, lost: 2, parked: 1 });
  });

  it("spreads dots sharing a cell in a fixed order, inside the cell", () => {
    const leads = ["D", "B", "A", "C", "E"].map((name) => lead({ name, status: "IN_TOUCH", fits: ["UNLIKELY"] }));
    const once = priorityMap(leads).dots;
    const again = priorityMap([...leads].reverse()).dots;
    expect(once).toEqual(again);
    expect(once.map((d) => d.name)).toEqual(["A", "B", "C", "D", "E"]);
    const spots = new Set(once.map((d) => `${d.x}:${d.y}`));
    expect(spots.size).toBe(5);
    for (const d of once) {
      expect(d.x).toBeGreaterThan(20);
      expect(d.x).toBeLessThan(40);
      expect(d.y).toBeGreaterThan(20);
      expect(d.y).toBeLessThan(40);
    }
  });

  it("sizes a dot by its proposal's value, against the largest on the map", () => {
    const { dots } = priorityMap([
      lead({ name: "Big", value: [{ currency: "EUR", amount: 20000 }] }),
      lead({ name: "Range", value: [{ currency: "EUR", amount: 1000, upper: 5000 }] }),
      lead({ name: "None" }),
    ]);
    const size = (name: string) => dots.find((d) => d.name === name)?.size;
    expect(size("Big")).toBe(DOT_MAX);
    expect(size("None")).toBe(DOT_MIN);
    expect(size("Range")).toBe(Math.round(DOT_MIN + (DOT_MAX - DOT_MIN) * Math.sqrt(5000 / 20000)));
  });

  it("keeps the slipping signal", () => {
    expect(priorityMap([lead({ slipping: true })]).dots[0].slipping).toBe(true);
  });
});

describe("leftOutLine", () => {
  it("says what is not on the map, or nothing", () => {
    expect(leftOutLine({ won: 2, lost: 1, parked: 1 })).toBe("Not on the map: 2 won, 1 lost and 1 parked");
    expect(leftOutLine({ won: 0, lost: 3, parked: 0 })).toBe("Not on the map: 3 lost");
    expect(leftOutLine({ won: 0, lost: 0, parked: 0 })).toBeNull();
  });
});
