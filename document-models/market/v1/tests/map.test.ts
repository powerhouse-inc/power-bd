import {
  linkPlayerEvidence,
  movePlayer,
  placePlayer,
  removePlayer,
  setAxes,
  setOurPosition,
  setPlayerNote,
  unlinkPlayerEvidence,
} from "document-models/market/v1";
import { describe, expect, it } from "vitest";
import { AXES, approvedDoc, lastError, run, withAxes } from "./helpers.js";

const solveai = placePlayer({ id: "p1", organisationId: "org-solveai", x: 20, y: 30 });
const OUT = "A position runs from 0 to 100 on each axis";

describe("MapOperations", () => {
  it("sets the axes, trimmed, and refuses an empty end", () => {
    const doc = run(setAxes({ ...AXES, xLabel: "  Who builds it " }));
    expect(doc.state.global.axes).toEqual({
      x: { label: "Who builds it", low: AXES.xLow, high: AXES.xHigh },
      y: { label: AXES.yLabel, low: AXES.yLow, high: AXES.yHigh },
    });
    expect(lastError(run(setAxes({ ...AXES, yHigh: " " })))).toBe("Each axis needs a label and two ends");
  });

  it("places an organisation once, inside the map, after the axes", () => {
    expect(lastError(run(solveai))).toBe("Set the map's axes first");
    const doc = run(withAxes(), solveai);
    expect(doc.state.global.players).toEqual([{ id: "p1", organisationId: "org-solveai", x: 20, y: 30, note: null, evidence: [] }]);
    expect(lastError(run(withAxes(), placePlayer({ id: "p1", organisationId: "o", x: 101, y: 0 })))).toBe(OUT);
    expect(lastError(run(withAxes(), placePlayer({ id: "p1", organisationId: "o", x: 0, y: -1 })))).toBe(OUT);
    expect(lastError(run(doc, placePlayer({ id: "p2", organisationId: "org-solveai", x: 1, y: 1 })))).toBe("The organisation is already on the map");
    expect(lastError(run(doc, placePlayer({ id: "p1", organisationId: "org-other", x: 1, y: 1, note: "n" })))).toBe("Player p1 already exists");
  });

  it("moves, notes and removes an organisation", () => {
    let doc = run(withAxes(), solveai, movePlayer({ id: "p1", x: 0, y: 100 }), setPlayerNote({ id: "p1", note: "Builds per customer" }));
    expect(doc.state.global.players[0]).toMatchObject({ x: 0, y: 100, note: "Builds per customer" });
    expect(lastError(run(doc, movePlayer({ id: "p1", x: 100.5, y: 1 })))).toBe(OUT);
    expect(lastError(run(doc, movePlayer({ id: "x", x: 1, y: 1 })))).toBe("Player x not found");
    doc = run(doc, setPlayerNote({ id: "p1", note: null }));
    expect(doc.state.global.players[0].note).toBeNull();
    expect(lastError(run(doc, setPlayerNote({ id: "x", note: "n" })))).toBe("Player x not found");
    doc = run(doc, removePlayer({ id: "p1" }));
    expect(doc.state.global.players).toEqual([]);
    expect(lastError(run(doc, removePlayer({ id: "p1" })))).toBe("Player p1 not found");
  });

  it("links evidence once and unlinks it", () => {
    let doc = run(withAxes(), solveai, linkPlayerEvidence({ id: "p1", refId: "note-1", refTitle: "SolveAI" }));
    expect(doc.state.global.players[0].evidence).toEqual([{ id: "note-1", title: "SolveAI" }]);
    expect(lastError(run(doc, linkPlayerEvidence({ id: "p1", refId: "note-1", refTitle: "again" })))).toBe("The note is already linked");
    expect(lastError(run(doc, linkPlayerEvidence({ id: "x", refId: "n", refTitle: "t" })))).toBe("Player x not found");
    doc = run(doc, unlinkPlayerEvidence({ id: "p1", refId: "note-1" }));
    expect(doc.state.global.players[0].evidence).toEqual([]);
    expect(lastError(run(doc, unlinkPlayerEvidence({ id: "p1", refId: "note-1" })))).toBe("The note is not linked");
    expect(lastError(run(doc, unlinkPlayerEvidence({ id: "x", refId: "n" })))).toBe("Player x not found");
  });

  it("places Powerhouse, optionally for a positioning statement", () => {
    expect(lastError(run(setOurPosition({ x: 80, y: 90 })))).toBe("Set the map's axes first");
    expect(lastError(run(withAxes(), setOurPosition({ x: 80, y: 190 })))).toBe(OUT);
    let doc = run(withAxes(), setOurPosition({ x: 80, y: 90 }));
    expect(doc.state.global.us).toEqual({ x: 80, y: 90, note: null, positioningId: null });
    doc = run(doc, setOurPosition({ x: 75, y: 95, note: "Signed record", positioningId: "pos-1" }));
    expect(doc.state.global.us).toEqual({ x: 75, y: 95, note: "Signed record", positioningId: "pos-1" });
  });

  it("stays editable while the figures are approved", () => {
    const doc = run(approvedDoc(), setAxes(AXES), solveai, setOurPosition({ x: 50, y: 50 }));
    expect(lastError(doc)).toBeUndefined();
    expect(doc.state.global.players).toHaveLength(1);
  });
});
