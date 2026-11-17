import { describe, expect, it } from "vitest";
import type { DueItem, DueKind } from "../overview/index.js";
import { dueClass, dueStrip, stripDayText, stripMarks } from "./strip.js";

const item = (due: DueKind, day: string): DueItem => ({
  due,
  day,
  label: "x",
  people: [],
  source: { kind: "lead", id: "l", name: "Harbour Studio" },
});

describe("dueClass", () => {
  it("tells deadlines, meetings and next steps apart", () => {
    expect(dueClass("NEXT_STEP")).toBe("step");
    expect(dueClass("MEETING")).toBe("meeting");
    for (const d of [
      "OPPORTUNITY_STEP",
      "DECIDE_BY",
      "EXPECTED_OPENING",
      "PROPOSAL_VALID_UNTIL",
    ] as const)
      expect(dueClass(d)).toBe("deadline");
  });
});

describe("dueStrip", () => {
  // 2026-11-17 is a Tuesday.
  const strip = dueStrip(
    [
      item("NEXT_STEP", "2026-11-20"),
      item("DECIDE_BY", "2026-11-20"),
      item("OPPORTUNITY_STEP", "2026-11-20"),
      item("MEETING", "2026-11-24"),
      item("NEXT_STEP", "2026-12-25"),
      item("NEXT_STEP", "2026-11-16"),
    ],
    "2026-11-17",
    14,
  );

  it("lays out every day of the window, today first and the last day included", () => {
    expect(strip).toHaveLength(15);
    expect(strip[0]).toMatchObject({
      day: "2026-11-17",
      date: 17,
      today: true,
      distance: 0,
    });
    expect(strip[14]).toMatchObject({
      day: "2026-12-01",
      date: 1,
      today: false,
      distance: 14,
    });
  });

  it("counts what is due on each day by its class", () => {
    expect(strip[3].counts).toEqual({ deadline: 2, meeting: 0, step: 1 });
    expect(strip[3].total).toBe(3);
    expect(strip[7].counts).toEqual({ deadline: 0, meeting: 1, step: 0 });
    expect(strip[1].total).toBe(0);
  });

  it("leaves out what falls outside the window", () => {
    expect(strip.reduce((n, d) => n + d.total, 0)).toBe(4);
  });

  it("marks weekends and the start of each new week", () => {
    expect(strip.filter((d) => d.weekend).map((d) => d.day)).toEqual([
      "2026-11-21",
      "2026-11-22",
      "2026-11-28",
      "2026-11-29",
    ]);
    expect(strip.filter((d) => d.weekStart).map((d) => d.day)).toEqual([
      "2026-11-23",
      "2026-11-30",
    ]);
    expect(strip[0].weekday).toBe("Tue");
  });

  it("does not mark a week start on the first day", () => {
    expect(dueStrip([], "2026-11-23", 1).map((d) => d.weekStart)).toEqual([
      false,
      false,
    ]);
  });
});

describe("stripDayText and stripMarks", () => {
  const [, busy, one] = dueStrip(
    [
      item("NEXT_STEP", "2026-11-18"),
      item("NEXT_STEP", "2026-11-18"),
      item("MEETING", "2026-11-18"),
      item("DECIDE_BY", "2026-11-18"),
      item("MEETING", "2026-11-19"),
    ],
    "2026-11-17",
    2,
  );
  const empty = dueStrip([], "2026-11-17", 0)[0];

  it("says what is due on a day in words", () => {
    expect(stripDayText(busy)).toBe("1 deadline, 1 meeting, 2 next steps");
    expect(stripDayText(one)).toBe("1 meeting");
    expect(stripDayText(empty)).toBe("nothing due");
  });

  it("stacks at most three marks, deadlines first, and counts the rest", () => {
    expect(stripMarks(busy)).toEqual({
      marks: ["deadline", "meeting", "step"],
      more: 1,
    });
    expect(stripMarks(one)).toEqual({ marks: ["meeting"], more: 0 });
    expect(stripMarks(empty)).toEqual({ marks: [], more: 0 });
  });
});
