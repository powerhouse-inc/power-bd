import { addSegment, approveSize, reopenSize, setSegmentSource, updateSegment } from "document-models/market/v1";
import { describe, expect, it } from "vitest";
import { AT, ME, URL_, countedSegment, lastError, run } from "./helpers.js";

const approve = approveSize({ approvedBy: ME, approvedAt: AT });

describe("ApprovalOperations", () => {
  it("waits for a counted segment", () => {
    expect(lastError(run(approve))).toBe("Count at least one segment before approving");
    const doc = run(addSegment({ id: "s1", name: "A" }), updateSegment({ id: "s1", accounts: 10 }), approve);
    expect(lastError(doc)).toBe("Count at least one segment before approving");
    expect(doc.state.global.sizeStatus).toBe("DRAFT");
  });

  it("waits for both sources of every counted segment, naming it", () => {
    const counted = [addSegment({ id: "s1", name: "Group finance" }), updateSegment({ id: "s1", accounts: 10, annualValue: 100 })];
    expect(lastError(run(...counted, approve))).toBe("Add the sources for Group finance before approving");
    const accountsOnly = run(...counted, setSegmentSource({ id: "s1", figure: "ACCOUNTS", title: "R", url: URL_ }), approve);
    expect(lastError(accountsOnly)).toBe("Add the sources for Group finance before approving");
  });

  it("approves, ignoring segments not counted yet, then reopens", () => {
    let doc = run(...countedSegment(), addSegment({ id: "s2", name: "Not counted" }), approve);
    expect(lastError(doc)).toBeUndefined();
    expect(doc.state.global).toMatchObject({ sizeStatus: "APPROVED", sizeApprovedBy: ME, sizeApprovedAt: AT });
    expect(lastError(run(doc, approve))).toBe("Only draft figures can be approved");
    doc = run(doc, reopenSize({}));
    expect(doc.state.global).toMatchObject({ sizeStatus: "DRAFT", sizeApprovedBy: null, sizeApprovedAt: null });
    expect(lastError(run(doc, reopenSize({})))).toBe("Only approved figures can be reopened");
  });
});
