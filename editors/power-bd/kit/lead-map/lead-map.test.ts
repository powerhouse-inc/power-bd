import { describe, expect, it } from "vitest";
import {
  DOT_MAX,
  DOT_MIN,
  leftOutLine,
  priorityMap,
  quadrantOf,
  type MapLead,
  MOOD_QUADRANT_LABEL,
  moodMap,
  type MoodLead,
} from "./lead-map.js";

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

describe("moodMap", () => {
  const NOW = "2026-11-18T12:00:00.000Z";
  const held = (daysAgo: number, outcome: string | null) => ({ status: "HELD", at: new Date(Date.parse(NOW) - daysAgo * 86_400_000).toISOString(), outcome });
  const m = (id: string, interactions: { status: string; at: string; outcome: string | null }[], status: MoodLead["status"] = "MET"): MoodLead => ({ id, name: id, status, interactions });

  it("places warm, active leads under Move to a proposal and cool, quiet ones under Park", () => {
    const map = moodMap([
      m("warm", [held(2, "POSITIVE"), held(10, "POSITIVE"), held(20, "NEUTRAL"), held(30, "POSITIVE")]),
      m("cold", [held(55, "NEGATIVE")]),
    ], NOW);
    const by = Object.fromEntries(map.dots.map((d) => [d.id, d]));
    expect(by.warm.quadrant).toBe("PROPOSE");
    expect(by.warm.x).toBeGreaterThan(50);
    expect(by.cold.quadrant).toBe("PARK");
    expect(by.cold.x).toBeLessThan(50);
  });

  it("counts the latest outcome most, and a neutral average as not yet warm", () => {
    const turning = moodMap([m("t", [held(1, "NEGATIVE"), held(5, "POSITIVE"), held(9, "POSITIVE")])], NOW).dots[0];
    expect(turning.x).toBe(50); // (−3 + 2 + 1) / 6 = 0: on the line
    expect(turning.quadrant).toBe("CONCERN");
    const quiet = moodMap([m("q", [held(50, "POSITIVE")])], NOW).dots[0];
    expect(quiet.quadrant).toBe("REENGAGE");
  });

  it("lists leads with no outcome yet, ignores what has not happened, and leaves out closed and parked leads", () => {
    const map = moodMap([
      m("none", [held(3, null)]),
      m("future", [{ status: "HELD", at: "2026-12-01T09:00:00.000Z", outcome: "POSITIVE" }]),
      m("won", [held(3, "POSITIVE")], "WON"),
      m("lost", [], "LOST"),
      m("parked", [], "PARKED"),
    ], NOW);
    expect(map.unplaced.map((u) => u.id)).toEqual(["none", "future"]);
    expect(map.left).toEqual({ won: 1, lost: 1, parked: 1 });
    expect(map.dots).toEqual([]);
  });

  it("spreads leads that land on the same spot, keeping them on the map", () => {
    const same = [held(2, "POSITIVE")];
    const map = moodMap([m("a", same), m("b", same), m("c", same)], NOW);
    expect(new Set(map.dots.map((d) => d.y)).size).toBe(3);
    for (const d of map.dots) expect(d.y).toBeGreaterThanOrEqual(5);
    expect(MOOD_QUADRANT_LABEL.PROPOSE).toBe("Move to a proposal");
  });
});
