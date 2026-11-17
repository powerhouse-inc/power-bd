import { describe, expect, it } from "vitest";
import { agoText, daysBetween, daysLate, overdueText, relativeDay } from "./when.js";

const NOW = "2026-11-17T10:00:00.000Z";

describe("agoText", () => {
  it.each([
    ["2026-11-17T09:59:30.000Z", "just now"],
    ["2026-11-17T09:59:00.000Z", "1 minute ago"],
    ["2026-11-17T09:15:00.000Z", "45 minutes ago"],
    ["2026-11-17T09:00:00.000Z", "1 hour ago"],
    ["2026-11-17T03:00:00.000Z", "7 hours ago"],
    ["2026-11-16T09:00:00.000Z", "yesterday"],
    ["2026-11-14T10:00:00.000Z", "3 days ago"],
    ["2026-11-03T10:00:00.000Z", "2 weeks ago"],
    ["2026-09-01T10:00:00.000Z", "2 months ago"],
    ["2026-10-10T10:00:00.000Z", "5 weeks ago"],
  ])("reads %s as %s", (from, text) => {
    expect(agoText(from, NOW)).toBe(text);
  });

  it("reads an instant after now as just now", () => {
    expect(agoText("2026-11-17T10:05:00.000Z", NOW)).toBe("just now");
  });

  it("says nothing for a date it cannot read", () => {
    expect(agoText("", NOW)).toBe("");
  });
});

describe("daysBetween", () => {
  it("counts whole calendar days, across months", () => {
    expect(daysBetween("2026-11-17", "2026-11-17")).toBe(0);
    expect(daysBetween("2026-11-17", "2026-12-01")).toBe(14);
    expect(daysBetween("2026-11-17", "2026-11-10")).toBe(-7);
  });
});

describe("relativeDay", () => {
  it.each([
    ["2026-11-17", "today"],
    ["2026-11-18", "tomorrow"],
    ["2026-11-20", "in 3 days"],
    ["2026-11-16", "yesterday"],
    ["2026-11-10", "7 days ago"],
  ])("reads %s as %s", (day, text) => {
    expect(relativeDay(day, "2026-11-17")).toBe(text);
  });
});

describe("daysLate", () => {
  it("counts the whole days a due day is past today", () => {
    expect(daysLate("2026-11-10", "2026-11-17")).toBe(7);
    expect(daysLate("2026-11-16", "2026-11-17")).toBe(1);
  });

  it("reads a stored whole day by its date", () => {
    expect(daysLate("2026-11-16T00:00:00.000Z", "2026-11-17")).toBe(1);
  });

  it("is 0 for today and the days ahead", () => {
    expect(daysLate("2026-11-17", "2026-11-17")).toBe(0);
    expect(daysLate("2026-11-20", "2026-11-17")).toBe(0);
  });

  it("counts across a month and a clock change", () => {
    expect(daysLate("2026-10-24", "2026-11-02")).toBe(9);
  });
});

describe("overdueText", () => {
  it("says one day, or so many days", () => {
    expect(overdueText(1)).toBe("1 day overdue");
    expect(overdueText(7)).toBe("7 days overdue");
  });
});
