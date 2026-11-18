import { describe, expect, it } from "vitest";
import { openingSpot, parseSpot, spotStore, type Spot } from "./last-spot.js";

const SAVED: Spot = { place: "agent", beside: false, from: { place: "leads", recordId: "lead-1" } };

describe("openingSpot: how a space opens", () => {
  it("comes back to where the person was when the address names neither a place nor a record", () => {
    expect(openingSpot({ place: undefined, namesRecord: false }, SAVED)).toEqual({
      place: "agent",
      beside: false,
      from: { place: "leads", recordId: "lead-1" },
    });
    expect(
      openingSpot({ place: undefined, namesRecord: false }, { place: "leads", recordId: "lead-2", beside: true }),
    ).toEqual({ place: "leads", beside: true, record: "lead-2" });
  });

  it("opens what an address says, with the agent beside as the person left it", () => {
    expect(openingSpot({ place: "funding", namesRecord: false }, { place: "leads", recordId: "lead-2", beside: true })).toEqual({
      place: "funding",
      beside: true,
    });
    expect(openingSpot({ place: undefined, namesRecord: true }, { place: "leads", recordId: "lead-2", beside: true })).toEqual({
      place: "overview",
      beside: true,
    });
  });

  it("opens the Overview, the agent closed, for someone new to the space", () => {
    expect(openingSpot({ place: undefined, namesRecord: false }, undefined)).toEqual({ place: "overview", beside: false });
  });
});

describe("parseSpot", () => {
  it("reads a kept spot, and ignores what it does not know", () => {
    expect(parseSpot(JSON.stringify({ place: "leads", recordId: "r", beside: true, from: { place: "agent", recordId: "x" } }))).toEqual({
      place: "leads",
      recordId: "r",
      beside: true,
      from: { place: "agent", recordId: "x" },
    });
    expect(parseSpot(JSON.stringify({ place: "leads", recordId: "", beside: "yes", from: { place: "nowhere" } }))).toEqual({
      place: "leads",
      beside: false,
    });
    expect(parseSpot(JSON.stringify({ place: "overview" }))).toEqual({ place: "overview", beside: false });
    expect(parseSpot(JSON.stringify({ place: "leads", from: { place: "funding", recordId: 3 } }))).toEqual({
      place: "leads",
      beside: false,
      from: { place: "funding" },
    });
  });

  it("is nothing for what is not a spot", () => {
    for (const text of [null, undefined, "", "not json", "[]", "3", JSON.stringify({ place: "nowhere" }), JSON.stringify({ place: 3 })])
      expect(parseSpot(text)).toBeUndefined();
  });
});

describe("spotStore", () => {
  function memory() {
    const items = new Map<string, string>();
    let writes = 0;
    return {
      items,
      writes: () => writes,
      getItem: (k: string) => items.get(k) ?? null,
      setItem: (k: string, v: string) => {
        writes++;
        items.set(k, v);
      },
      removeItem: (k: string) => void items.delete(k),
    };
  }

  it("keeps a spot for each person in each space, and skips a write that changes nothing", () => {
    const storage = memory();
    const spots = spotStore(() => storage);
    spots.write("space-1", "ann", SAVED);
    spots.write("space-1", "ann", SAVED);
    expect(storage.writes()).toBe(1);
    expect(spots.read("space-1", "ann")).toEqual(SAVED);
    expect(spots.read("space-1", "bob")).toBeUndefined();
    expect(spots.read("space-2", "ann")).toBeUndefined();
    expect(spotStore(() => storage).read("space-1", "ann")).toEqual(SAVED);
  });

  it("keeps the spot in the page when the browser keeps nothing, or refuses", () => {
    const none = spotStore(() => undefined);
    none.write("s", "ann", SAVED);
    expect(none.read("s", "ann")).toEqual(SAVED);
    const refusing = spotStore(() => ({
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("full");
      },
      removeItem: () => undefined,
    }));
    expect(refusing.read("s", "ann")).toBeUndefined();
    refusing.write("s", "ann", SAVED);
    expect(refusing.read("s", "ann")).toEqual(SAVED);
  });
});

describe("openingSpot: the agent's full view", () => {
  it("opens no record with it, whatever was kept", () => {
    expect(openingSpot({ place: undefined, namesRecord: false }, { place: "agent", recordId: "lead-1", beside: false })).toEqual({
      place: "agent",
      beside: false,
    });
  });
});
