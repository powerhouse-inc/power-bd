import { describe, expect, it } from "vitest";
import { today } from "./time.js";

describe("today", () => {
  it("is already tomorrow in Zurich late in the evening UTC", () => {
    expect(today("2026-11-15T23:30:00.000Z", "Europe/Zurich")).toBe(
      "2026-11-16",
    );
    expect(today("2026-11-15T23:30:00.000Z", "UTC")).toBe("2026-11-15");
  });
});
