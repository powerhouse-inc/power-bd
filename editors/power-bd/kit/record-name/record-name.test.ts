import { describe, expect, it } from "vitest";
import { nameToSync, recordTitle } from "./record-name.js";

describe("a record's title from its state", () => {
  it("reads the field each kind of record is named by", () => {
    expect(
      recordTitle("powerbd/lead", { global: { name: " Brisa Labs: pilot " } }),
    ).toBe("Brisa Labs: pilot");
    expect(recordTitle("powerbd/opportunity", { global: { name: "Fund X" } })).toBe(
      "Fund X",
    );
    expect(recordTitle("powerbd/contact", { global: { name: "Kelvar" } })).toBe(
      "Kelvar",
    );
    expect(
      recordTitle("powerbd/decision", { global: { question: "Apply?" } }),
    ).toBe("Apply?");
    expect(recordTitle("powerbd/proposal", { global: { title: "Scope A" } })).toBe(
      "Scope A",
    );
  });
  it("is null for a record with no name of its own, or none yet", () => {
    expect(recordTitle("powerbd/settings", { global: { name: "x" } })).toBeNull();
    expect(recordTitle("powerbd/lead", { global: { name: "  " } })).toBeNull();
    expect(recordTitle("powerbd/lead", { global: { name: null } })).toBeNull();
    expect(recordTitle("powerbd/lead", { global: null })).toBeNull();
    expect(recordTitle("powerbd/lead", undefined)).toBeNull();
    expect(recordTitle(undefined, { global: { name: "x" } })).toBeNull();
  });
});

describe("the name to bring an entry in line with", () => {
  it("is the title when a name it is stored under differs", () => {
    expect(nameToSync("Brisa Labs: pilot", ["New lead"])).toBe(
      "Brisa Labs: pilot",
    );
    expect(
      nameToSync("Brisa Labs: pilot", ["Brisa Labs: pilot", "New lead"]),
    ).toBe("Brisa Labs: pilot");
  });
  it("is nothing when every known name matches, or there is no title", () => {
    expect(nameToSync("A", ["A", undefined, null])).toBeNull();
    expect(nameToSync("A", [undefined])).toBeNull();
    expect(nameToSync(null, ["New lead"])).toBeNull();
  });
});
