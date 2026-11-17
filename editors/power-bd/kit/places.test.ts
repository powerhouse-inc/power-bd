import { describe, expect, it } from "vitest";
import { ICONS } from "../../../design-system/icons.js";
import { PLACES, countFor, placeById, saveStateView } from "./places.js";

describe("places", () => {
  it("lists the ten places, the Agent and Settings last", () => {
    expect(PLACES.map((p) => p.label)).toEqual([
      "Overview",
      "Leads",
      "Proposals",
      "Funding",
      "Investors",
      "Organisations",
      "Decisions",
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
  });
});
