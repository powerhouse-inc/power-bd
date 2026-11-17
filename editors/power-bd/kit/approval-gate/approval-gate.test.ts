import { describe, expect, it } from "vitest";
import { approvalGate } from "./approval-gate.js";

const ok = { playbookLoaded: true, findings: 0, signedIn: true };

describe("approvalGate", () => {
  it("opens when everything is loaded, nothing is left to fix and a person is signed in", () => {
    expect(approvalGate(ok)).toEqual({ canApprove: true, message: null });
    expect(approvalGate({ ...ok, leadLoaded: true })).toEqual({
      canApprove: true,
      message: null,
    });
  });

  it("stays closed with a reason when the playbook is not loaded", () => {
    expect(approvalGate({ ...ok, playbookLoaded: false })).toEqual({
      canApprove: false,
      message: "The playbook is not loaded, so this cannot be checked yet",
    });
  });

  it("names the lead when only the lead is missing, and both when both are", () => {
    expect(approvalGate({ ...ok, leadLoaded: false }).message).toBe(
      "The lead is not loaded, so this cannot be checked yet",
    );
    expect(
      approvalGate({ ...ok, playbookLoaded: false, leadLoaded: false }),
    ).toEqual({
      canApprove: false,
      message:
        "The playbook and the lead are not loaded, so this cannot be checked yet",
    });
  });

  it("stays closed, without a loading message, for findings or no sign-in", () => {
    expect(approvalGate({ ...ok, findings: 2 })).toEqual({
      canApprove: false,
      message: null,
    });
    expect(approvalGate({ ...ok, signedIn: false })).toEqual({
      canApprove: false,
      message: null,
    });
  });
});
