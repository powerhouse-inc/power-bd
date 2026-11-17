import { describe, expect, it } from "vitest";
import { isLapsed, nextStep, proposalPath } from "./proposal-view.js";

describe("proposalPath", () => {
  it("marks earlier steps done and the current one", () => {
    const p = proposalPath("APPROVED");
    expect(p.map((s) => s.state)).toEqual(["done", "current", "todo", "todo"]);
    expect(p.map((s) => s.value)).toEqual([
      "DRAFT",
      "APPROVED",
      "SENT",
      "ANSWER",
    ]);
  });
  it("shows the answer as the last step", () => {
    const p = proposalPath("DECLINED");
    expect(p.at(-1)).toMatchObject({ value: "DECLINED", state: "current" });
    expect(p.slice(0, 3).every((s) => s.state === "done")).toBe(true);
  });
  it("shows an end state in place of the answer", () => {
    expect(proposalPath("WITHDRAWN").at(-1)?.value).toBe("WITHDRAWN");
    expect(proposalPath("SUPERSEDED").at(-1)?.value).toBe("SUPERSEDED");
  });
});

describe("isLapsed", () => {
  it("is a sent proposal past its valid-until day", () => {
    expect(isLapsed("SENT", "2026-11-01T00:00:00.000Z", "2026-11-16")).toBe(
      true,
    );
    expect(isLapsed("SENT", "2026-12-01T00:00:00.000Z", "2026-11-16")).toBe(
      false,
    );
    expect(isLapsed("ACCEPTED", "2026-11-01T00:00:00.000Z", "2026-11-16")).toBe(
      false,
    );
  });
});

describe("nextStep", () => {
  it("asks to fix findings, then to approve", () => {
    expect(
      nextStep({
        status: "DRAFT",
        findings: 2,
        lapsed: false,
        signedCopy: false,
      })?.what,
    ).toMatch(/2 findings/);
    expect(
      nextStep({
        status: "DRAFT",
        findings: 0,
        lapsed: false,
        signedCopy: false,
      })?.what,
    ).toMatch(/Approve/);
  });
  it("follows the status", () => {
    expect(
      nextStep({
        status: "APPROVED",
        findings: 0,
        lapsed: false,
        signedCopy: false,
      })?.what,
    ).toMatch(/Send/);
    expect(
      nextStep({ status: "SENT", findings: 0, lapsed: true, signedCopy: false })
        ?.why,
    ).toMatch(/valid until/i);
    expect(
      nextStep({
        status: "ACCEPTED",
        findings: 0,
        lapsed: false,
        signedCopy: false,
      })?.what,
    ).toMatch(/signed/i);
    expect(
      nextStep({
        status: "ACCEPTED",
        findings: 0,
        lapsed: false,
        signedCopy: true,
      }),
    ).toBeNull();
    expect(
      nextStep({
        status: "WITHDRAWN",
        findings: 0,
        lapsed: false,
        signedCopy: false,
      }),
    ).toBeNull();
  });
});

describe("nextStep wording", () => {
  it("says finding in the singular for one", () => {
    expect(
      nextStep({
        status: "DRAFT",
        findings: 1,
        lapsed: false,
        signedCopy: false,
      })?.what,
    ).toBe("Fix 1 finding");
  });
  it("explains what an answer is while a sent proposal has not lapsed", () => {
    expect(
      nextStep({
        status: "SENT",
        findings: 0,
        lapsed: false,
        signedCopy: false,
      })?.why,
    ).toBe("Accepted with the option chosen, or declined with a reason");
  });
});
