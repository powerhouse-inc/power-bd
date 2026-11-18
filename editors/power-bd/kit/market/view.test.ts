import { describe, expect, it } from "vitest";
import {
  approvalChecks,
  mapCandidates,
  mapsOf,
  marketCard,
  nudge,
  positionAt,
  somLabel,
  sourceLabel,
  totalTiles,
} from "./view.js";
import type { SegmentLike } from "./market.js";

const SRC = { title: "Registry", url: "https://example.org" };
const seg = (over: Partial<SegmentLike> & { id: string }): SegmentLike => ({
  name: over.id, accounts: 100, accountsSource: SRC, annualValue: 10_000, annualValueSource: SRC,
  serviceable: true, targetAccounts: 5, ...over,
});

describe("totalTiles", () => {
  it("names the three totals with the market's horizon", () => {
    const tiles = totalTiles({ currency: "EUR", horizonYears: 3, segments: [], sizeStatus: "DRAFT" });
    expect(tiles.map((t) => t.label)).toEqual(["Total market (TAM)", "Serviceable (SAM)", "Obtainable in 3 years (SOM)"]);
    expect(tiles.map((t) => t.value)).toEqual(["–", "–", "–"]);
    expect(tiles.map((t) => t.sub)).toEqual(["No segment yet", "No segment we can serve yet", "No segment we can serve yet"]);
  });

  it("shows amounts and what they leave out", () => {
    const tiles = totalTiles({
      currency: null, horizonYears: 1, sizeStatus: "DRAFT",
      segments: [seg({ id: "a" }), seg({ id: "b", accounts: null }), seg({ id: "c", serviceable: false, targetAccounts: null })],
    });
    expect(tiles[0]).toMatchObject({ value: "€2m", sub: "1 not counted yet" });
    expect(tiles[1]).toMatchObject({ value: "€1m", sub: "1 not counted yet" });
    // SOM counts targets: b has no number of organisations but has a target.
    expect(tiles[2]).toMatchObject({ label: "Obtainable in 1 year (SOM)", value: "€100k", sub: "From 2 segments" });
  });

  it("says when serviceable segments have no numbers or target yet", () => {
    const tiles = totalTiles({ currency: "EUR", segments: [seg({ id: "a", accounts: null, annualValue: null, targetAccounts: null })], sizeStatus: "DRAFT" });
    expect(tiles[1].sub).toBe("1 not counted yet");
    expect(tiles[2].label).toBe("Obtainable (SOM)");
    const empty = totalTiles({ currency: "EUR", segments: [seg({ id: "a" })].map((s) => ({ ...s, accounts: 1 })), sizeStatus: "DRAFT" });
    expect(empty[0].sub).toBe("From 1 segment");
  });

  it("labels SOM by the horizon", () => {
    expect(somLabel(5)).toBe("Obtainable in 5 years (SOM)");
    expect(somLabel(null)).toBe("Obtainable (SOM)");
  });
});

describe("approvalChecks", () => {
  it("lists what approval waits for, or one ok line", () => {
    expect(approvalChecks({ currency: "EUR", segments: [seg({ id: "a" })], sizeStatus: "DRAFT" })).toEqual([
      { text: "Every counted segment has a source for both numbers", tone: "ok" },
    ]);
    expect(approvalChecks({ currency: "EUR", segments: [seg({ id: "a", name: "Group", accountsSource: null })], sizeStatus: "DRAFT" })).toEqual([
      { text: "Add a source for the number of organisations in Group", tone: "warn" },
    ]);
  });
});

describe("sources and candidates", () => {
  it("names a source or its absence", () => {
    expect(sourceLabel(SRC)).toBe("Registry");
    expect(sourceLabel(null)).toBe("No source");
  });

  it("offers organisations not on the map, comparables and competitors first", () => {
    const c = mapCandidates(
      [
        { id: "z", name: "Zeta", tags: [] },
        { id: "s", name: "SolveAI", tags: ["comparable", "competitor"] },
        { id: "l", name: "Lexroom", tags: ["comparable"] },
        { id: "k", name: " ", tags: ["lead"] },
        { id: "p", name: "Placed", tags: ["comparable"] },
      ],
      [{ organisationId: "p" }],
    );
    expect(c.flagged.map((x) => x.name)).toEqual(["Lexroom", "SolveAI"]);
    expect(c.others.map((x) => x.name)).toEqual(["Untitled organisation", "Zeta"]);
  });
});

describe("moving a dot", () => {
  it("nudges by 2, or 10 with Shift, inside the map", () => {
    expect(nudge({ x: 50, y: 50 }, "ArrowRight", false)).toEqual({ x: 52, y: 50 });
    expect(nudge({ x: 50, y: 50 }, "ArrowUp", true)).toEqual({ x: 50, y: 60 });
    expect(nudge({ x: 1, y: 99 }, "ArrowLeft", false)).toEqual({ x: 0, y: 99 });
    expect(nudge({ x: 1, y: 99 }, "ArrowUp", true)).toEqual({ x: 1, y: 100 });
    expect(nudge({ x: 50, y: 5 }, "ArrowDown", true)).toEqual({ x: 50, y: 0 });
    expect(nudge({ x: 50, y: 50 }, "Enter", false)).toBeNull();
  });

  it("reads the pointer as a position, bottom to top", () => {
    const rect = { left: 100, top: 50, width: 400, height: 200 };
    expect(positionAt(rect, 100, 250)).toEqual({ x: 0, y: 0 });
    expect(positionAt(rect, 500, 50)).toEqual({ x: 100, y: 100 });
    expect(positionAt(rect, 300, 150)).toEqual({ x: 50, y: 50 });
    expect(positionAt(rect, 900, -40)).toEqual({ x: 100, y: 100 });
    expect(positionAt(rect, 133.3, 150)).toEqual({ x: 8.3, y: 50 });
  });
});

describe("cards and maps", () => {
  it("counts organisations on the map and says if the figures are approved", () => {
    expect(marketCard({ segments: [], sizeStatus: "APPROVED", players: [1, 2] })).toEqual({ onMap: 2, approved: true });
  });

  it("lists the markets an organisation is on, by name", () => {
    const markets = [
      { id: "m2", state: { name: "Law firms", players: [{ organisationId: "solve" }] } },
      { id: "m1", state: { name: "Finance operations", players: [{ organisationId: "solve" }, { organisationId: "lex" }] } },
      { id: "m3", state: { name: null, players: [{ organisationId: "solve" }] } },
      { id: "m4", state: { name: "Defence", players: [] } },
    ];
    expect(mapsOf("solve", markets)).toEqual([
      { id: "m1", name: "Finance operations" },
      { id: "m2", name: "Law firms" },
      { id: "m3", name: "Untitled market" },
    ]);
    expect(mapsOf("nobody", markets)).toEqual([]);
  });
});
