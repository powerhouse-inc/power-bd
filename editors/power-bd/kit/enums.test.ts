import { describe, expect, it } from "vitest";
import { enumValue, FITS, LEAD_STATUSES } from "./enums.js";

describe("enumValue", () => {
  it("returns the value when the text is a member", () => {
    expect(enumValue(FITS, "GOOD")).toBe("GOOD");
  });
  it("returns undefined for text outside the list, including empty", () => {
    expect(enumValue(FITS, "good")).toBeUndefined();
    expect(enumValue(LEAD_STATUSES, "")).toBeUndefined();
  });
});
