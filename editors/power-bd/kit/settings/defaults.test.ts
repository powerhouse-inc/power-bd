import { describe, expect, it } from "vitest";
import { settingsOrDefaults } from "./defaults.js";

describe("settingsOrDefaults", () => {
  it("falls back to UTC and a 14 day window with no settings", () => {
    expect(settingsOrDefaults(undefined)).toEqual({
      timeZone: "UTC",
      dueWindowDays: 14,
    });
    expect(
      settingsOrDefaults({ timeZone: "", dueWindowDays: undefined }),
    ).toEqual({
      timeZone: "UTC",
      dueWindowDays: 14,
    });
  });
  it("keeps what is set, including a zero window", () => {
    expect(
      settingsOrDefaults({ timeZone: "Europe/Berlin", dueWindowDays: 0 }),
    ).toEqual({ timeZone: "Europe/Berlin", dueWindowDays: 0 });
  });
});
