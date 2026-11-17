import { describe, expect, it } from "vitest";
import { nextAction, statusPath } from "./lead-view.js";

describe("statusPath", () => {
  it("marks earlier steps done and the current one", () => {
    const p = statusPath("MEETING_SET", "SALES", null);
    expect(p.map((s) => s.state)).toEqual([
      "done",
      "done",
      "current",
      "todo",
      "todo",
      "todo",
    ]);
  });
  it("leaves out proposal and won for an investor lead", () => {
    expect(statusPath("MET", "INVESTOR", null).map((s) => s.value)).toEqual([
      "TO_CONTACT",
      "IN_TOUCH",
      "MEETING_SET",
      "MET",
    ]);
  });
  it("shows a parked lead at the step it was parked from", () => {
    const p = statusPath("PARKED", "SALES", "IN_TOUCH");
    expect(p.find((s) => s.state === "current")?.value).toBe("IN_TOUCH");
  });
  it("ends a lost lead's path with lost", () => {
    const p = statusPath("LOST", "SALES", null);
    expect(p[p.length - 1]).toMatchObject({ value: "LOST", state: "current" });
  });
});

const base = {
  owner: "0xabc",
  status: "IN_TOUCH" as const,
  nextSteps: [],
  messages: [],
};

describe("nextAction", () => {
  it("asks for an owner first", () => {
    expect(nextAction({ ...base, owner: null }, "2026-11-16")).toMatchObject({
      kind: "owner",
    });
  });
  it("picks the earliest open next step", () => {
    const steps = [
      { id: "b", text: "B", dueDate: "2026-11-20", doneAt: null },
      { id: "a", text: "A", dueDate: "2026-11-18", doneAt: null },
      { id: "c", text: "C", dueDate: null, doneAt: "2026-11-01T00:00:00Z" },
    ];
    expect(
      nextAction({ ...base, nextSteps: steps }, "2026-11-16"),
    ).toMatchObject({ kind: "step", id: "a", overdue: false });
  });
  it("flags an overdue step", () => {
    const steps = [{ id: "a", text: "A", dueDate: "2026-11-10", doneAt: null }];
    expect(
      nextAction({ ...base, nextSteps: steps }, "2026-11-16"),
    ).toMatchObject({ overdue: true, daysLate: 6 });
  });
  it("does not call a step due today overdue", () => {
    const steps = [{ id: "a", text: "A", dueDate: "2026-11-16T00:00:00.000Z", doneAt: null }];
    expect(
      nextAction({ ...base, nextSteps: steps }, "2026-11-16"),
    ).toMatchObject({ overdue: false, daysLate: 0 });
  });
  it("points at an approved message to send, then a draft", () => {
    const m = (id: string, status: string) => ({ id, status });
    expect(
      nextAction(
        { ...base, messages: [m("d", "DRAFT"), m("a", "APPROVED")] },
        "2026-11-16",
      ),
    ).toMatchObject({ kind: "message", id: "a" });
    expect(
      nextAction({ ...base, messages: [m("d", "DRAFT")] }, "2026-11-16"),
    ).toMatchObject({ kind: "message", id: "d" });
  });
  it("suggests adding a step, and nothing for a closed lead", () => {
    expect(nextAction(base, "2026-11-16").kind).toBe("add-step");
    expect(nextAction({ ...base, status: "WON" }, "2026-11-16").kind).toBe(
      "none",
    );
  });
});

describe("lead view edge cases", () => {
  it("shows a lead parked without a recorded origin at the first step", () => {
    const p = statusPath("PARKED", "SALES", null);
    expect(p.find((s) => s.state === "current")?.value).toBe("TO_CONTACT");
  });
  it("puts a dated step ahead of an undated one", () => {
    const steps = [
      { id: "u", text: "Undated", doneAt: null },
      { id: "d", text: "Dated", dueDate: "2026-12-01T09:00:00Z", doneAt: null },
    ];
    expect(
      nextAction({ ...base, nextSteps: steps }, "2026-11-16T08:00:00Z"),
    ).toEqual({
      kind: "step",
      id: "d",
      text: "Dated",
      dueDate: "2026-12-01",
      overdue: false,
      daysLate: 0,
    });
  });
  it("keeps a dated step ahead whichever order the steps come in", () => {
    const steps = [
      { id: "d", text: "Dated", dueDate: "2026-12-01T09:00:00Z", doneAt: null },
      { id: "u", text: "Undated", doneAt: null },
    ];
    expect(nextAction({ ...base, nextSteps: steps }, "2026-11-16")).toMatchObject({ id: "d" });
  });
  it("offers an undated step with no due day and never calls it overdue", () => {
    const steps = [{ id: "u", text: "Undated", dueDate: null, doneAt: null }];
    expect(nextAction({ ...base, nextSteps: steps }, "2026-11-16")).toEqual({
      kind: "step",
      id: "u",
      text: "Undated",
      dueDate: null,
      overdue: false,
      daysLate: 0,
    });
  });
});
