import { describe, expect, it } from "vitest";
import {
  captureCandidates,
  captureInputs,
  captureMissing,
  captureNow,
  captureRecords,
  type CaptureForm,
} from "./capture.js";

const ME = "0xAbC0000000000000000000000000000000000001";
const OTHER = "0x0000000000000000000000000000000000000002";
const records = captureRecords({
  leads: [
    { id: "l1", changedAt: "2026-11-10T10:00:00Z", state: { name: "Kelvar pilot", status: "MET", owner: OTHER } },
    { id: "l2", changedAt: "2026-11-01T10:00:00Z", state: { name: "Brightwater audit", status: "IN_TOUCH", owner: ME.toLowerCase() } },
    { id: "l3", changedAt: "2026-11-17T10:00:00Z", state: { name: "Won deal", status: "WON", owner: ME } },
    { id: "l4", changedAt: null, state: { name: null, status: "TO_CONTACT" } },
  ],
  opportunities: [
    { id: "o1", changedAt: "2026-11-15T10:00:00Z", state: { name: "Kelvar grant", status: "PREPARING", owner: OTHER } },
    { id: "o2", changedAt: "2026-11-16T10:00:00Z", state: { name: "Old call", status: "NO_GO", owner: ME } },
    { id: "o3", changedAt: null, state: { name: "", status: "WATCHING", owner: null } },
  ],
});
const form = (over: Partial<CaptureForm> = {}): CaptureForm => ({
  recordId: "l1",
  kind: "MEETING",
  day: "2026-11-18",
  time: "14:30",
  what: " Went well, they want a pilot ",
  nextStep: "",
  nextDay: "",
  outcome: null,
  ...over,
});

describe("captureRecords and captureCandidates", () => {
  it("offers only open records, named", () => {
    expect(records.map((r) => `${r.kind}:${r.name}`)).toEqual([
      "lead:Kelvar pilot",
      "lead:Brightwater audit",
      "lead:Untitled lead",
      "opportunity:Kelvar grant",
      "opportunity:Untitled opportunity",
    ]);
  });

  it("puts mine first, then the most recently changed", () => {
    expect(captureCandidates(records, ME, "").map((r) => r.id)).toEqual(["l2", "o1", "l1", "l4", "o3"]);
    expect(captureCandidates(records, null, "", 2).map((r) => r.id)).toEqual(["o1", "l1"]);
  });

  it("searches by name, names that start with it first", () => {
    expect(captureCandidates(records, ME, "  kel ").map((r) => r.id)).toEqual(["o1", "l1"]);
    expect(captureCandidates(records, ME, "audit").map((r) => r.id)).toEqual(["l2"]);
    expect(captureCandidates(records, ME, "grant p")).toEqual([]);
    expect(captureCandidates(records, null, "untitled").map((r) => r.id)).toEqual(["l4", "o3"]);
  });
});

describe("the form", () => {
  it("starts at now in the team's time zone", () => {
    expect(captureNow("2026-11-18T13:30:00.000Z", "Europe/Ljubljana")).toEqual({ day: "2026-11-18", time: "14:30" });
  });

  it("says what saving waits for, in order", () => {
    expect(captureMissing(form())).toEqual([]);
    expect(captureMissing(form({ recordId: null, time: "", what: " ", nextDay: "2026-11-20" }))).toEqual([
      "Pick a lead or funding opportunity",
      "Say when it happened",
      "Say what happened, in a line",
      "Say what the next step is, or clear its date",
    ]);
  });

  it("makes a held interaction in the team's time zone, and the next step when there is one", () => {
    const ids = { interaction: "i1", step: "s1" };
    expect(captureInputs(form(), "Europe/Ljubljana", ME, ids)).toEqual({
      interaction: {
        id: "i1",
        kind: "MEETING",
        status: "HELD",
        at: "2026-11-18T13:30:00.000Z",
        timeZone: "Europe/Ljubljana",
        summary: "Went well, they want a pilot",
        teamMembers: [ME],
      },
      step: null,
      outcome: null,
    });
    const withStep = captureInputs(form({ nextStep: " Send the outline ", nextDay: "2026-11-20" }), "UTC", null, ids);
    expect(withStep.interaction.teamMembers).toEqual([]);
    expect(withStep.step).toEqual({ id: "s1", text: "Send the outline", owner: undefined, dueDate: "2026-11-20T00:00:00.000Z" });
    expect(captureInputs(form({ nextStep: "Call back" }), "UTC", ME, ids).step).toEqual({ id: "s1", text: "Call back", owner: ME, dueDate: undefined });
  });
});

describe("how it went", () => {
  it("saves how it went with the interaction, and nothing when not said", () => {
    const ids = { interaction: "i1", step: "s1" };
    const said = captureInputs(form({ outcome: "POSITIVE" }), "Europe/Ljubljana", null, ids);
    expect(said.outcome).toEqual({ id: "i1", outcome: "POSITIVE" });
    const silent = captureInputs(form(), "Europe/Ljubljana", null, ids);
    expect(silent.outcome).toBeNull();
  });
});
