import { afterEach, describe, expect, it, vi } from "vitest";
import {
  initials,
  isAddress,
  memberName,
  parseWholeNumber,
  runtimeTimeZones,
  timeZoneOptions,
} from "./settings.js";

const members = [
  {
    id: "1",
    name: "Mara Lind",
    address: "0xAbc0000000000000000000000000000000000001",
    active: true,
  },
  {
    id: "2",
    name: "Jonas Veil",
    address: "0xabc0000000000000000000000000000000000002",
    active: false,
  },
];

describe("timeZoneOptions", () => {
  it("puts UTC first, removes repeats and sorts the rest", () => {
    expect(
      timeZoneOptions(["Europe/Zurich", "Asia/Tokyo", "UTC", "Asia/Tokyo"]),
    ).toEqual(["UTC", "Asia/Tokyo", "Europe/Zurich"]);
  });
  it("offers UTC even when the runtime lists nothing", () => {
    expect(timeZoneOptions([])).toEqual(["UTC"]);
  });
});

describe("memberName", () => {
  it("resolves an address regardless of case, inactive members included", () => {
    expect(
      memberName(members, "0xABC0000000000000000000000000000000000001"),
    ).toBe("Mara Lind");
    expect(
      memberName(members, "0xabc0000000000000000000000000000000000002"),
    ).toBe("Jonas Veil");
  });
  it("returns undefined for an unknown or empty address", () => {
    expect(memberName(members, "0x0")).toBeUndefined();
    expect(memberName(members, undefined)).toBeUndefined();
  });
});

describe("initials", () => {
  it("takes the first letters of the first two words", () => {
    expect(initials("Mara Lind")).toBe("ML");
    expect(initials("  jonas ")).toBe("J");
    expect(initials("")).toBe("?");
  });
});

describe("isAddress", () => {
  it("accepts 0x and 40 hex digits only", () => {
    expect(isAddress("0xAbc0000000000000000000000000000000000001")).toBe(true);
    expect(isAddress("0x123")).toBe(false);
    expect(isAddress("")).toBe(false);
  });
});

describe("parseWholeNumber", () => {
  it("parses whole numbers and refuses the rest", () => {
    expect(parseWholeNumber(" 14 ")).toBe(14);
    expect(parseWholeNumber("1.5")).toBeUndefined();
    expect(parseWholeNumber("")).toBeUndefined();
    expect(parseWholeNumber("abc")).toBeUndefined();
  });
});

describe("runtimeTimeZones", () => {
  afterEach(() => vi.restoreAllMocks());
  it("lists UTC first, then the zones the browser knows", () => {
    vi.spyOn(Intl, "supportedValuesOf").mockReturnValue([
      "Europe/Zurich",
      "Asia/Tokyo",
    ]);
    expect(runtimeTimeZones()).toEqual(["UTC", "Asia/Tokyo", "Europe/Zurich"]);
  });
  it("offers only UTC when the browser cannot list zones", () => {
    vi.spyOn(Intl, "supportedValuesOf").mockImplementation(() => {
      throw new RangeError("unsupported");
    });
    expect(runtimeTimeZones()).toEqual(["UTC"]);
  });
});
