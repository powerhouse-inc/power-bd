import { describe, expect, it } from "vitest";
import { ICONS } from "../../../design-system/icons.js";
import { PLACES, countFor, hashOf, placeById, placeFromHash, saveStateView } from "./places.js";

describe("places", () => {
  it("lists the thirteen places, the Agent and Settings last", () => {
    expect(PLACES.map((p) => p.label)).toEqual([
      "Overview",
      "Calendar",
      "Leads",
      "Proposals",
      "Funding",
      "Investors",
      "Organisations",
      "Market",
      "Decisions",
      "Reports",
      "Playbook",
      "Agent",
      "Settings",
    ]);
  });
  it("uses icons the design system has", () => {
    for (const p of PLACES) expect(p.icon in ICONS).toBe(true);
  });
  it("counts only the places that have a count", () => {
    const c = { leads: 4, proposals: 3, funding: 2, decisions: 1 };
    expect(countFor("leads", c)).toBe(4);
    expect(countFor("proposals", c)).toBe(3);
    expect(countFor("funding", c)).toBe(2);
    expect(countFor("decisions", c)).toBe(1);
    expect(countFor("overview", c)).toBeUndefined();
    expect(countFor("agent", c)).toBeUndefined();
  });
  it("finds a place by id", () => {
    expect(placeById("playbook").label).toBe("Playbook");
  });
  it("words the save state in BD terms", () => {
    expect(saveStateView("up-to-date").label).toBe("Up to date");
    expect(saveStateView("setting-up").className).toContain("is-saving");
    expect(saveStateView("offline").className).toContain("is-offline");
    expect(saveStateView("unreachable")).toMatchObject({ label: "Can't reach the server", icon: "cloud-off" });
    expect(saveStateView("view-only")).toMatchObject({ label: "View only", icon: "eye" });
  });
});

describe("a place in the address", () => {
  it("names each place in the hash, the Overview too", () => {
    expect(hashOf("overview")).toBe("#overview");
    expect(hashOf("leads")).toBe("#leads");
    expect(hashOf("agent")).toBe("#agent");
  });

  it("reads back every place from its hash", () => {
    for (const { id } of PLACES) expect(placeFromHash(hashOf(id))).toBe(id);
  });

  it("reads nothing from a hash that names no place", () => {
    for (const hash of ["", "#", "#nowhere", "#Leads", "leads", "#leads/x", "#toString", "#constructor"])
      expect(placeFromHash(hash)).toBeUndefined();
  });
});
