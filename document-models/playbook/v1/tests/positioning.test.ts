import {
  addPositioning,
  addProofCase,
  approvePositioning,
  linkPositioningComparable,
  linkPositioningProof,
  reducer,
  removeProofCase,
  retirePositioning,
  unlinkPositioningComparable,
  unlinkPositioningProof,
  updatePositioning,
  utils,
} from "document-models/playbook/v1";
import { describe, expect, it } from "vitest";

const INES = "0x2222222222222222222222222222222222222bbb";
const APPROVAL = { approvedBy: INES, approvedAt: "2026-11-18T09:30:00.000Z" };
const FAST = {
  id: "p1",
  title: "Fast signing",
  text: "We move contract signing online in six weeks.",
};
const CASE = {
  id: "c1",
  title: "Brisa Labs · e-signature rollout",
  summary: null,
  mayBeNamedPublicly: true,
};

/** The error of each operation, in the order they were dispatched. */
function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

/** One draft (p1) as the first operation. */
function oneDraft() {
  return reducer(utils.createDocument(), addPositioning(FAST));
}

/** One approved positioning (p1): operations 0 and 1. */
function approved() {
  return reducer(oneDraft(), approvePositioning({ id: "p1", ...APPROVAL }));
}

/** One retired positioning (p1): operations 0 and 1. */
function retired() {
  return reducer(oneDraft(), retirePositioning({ id: "p1" }));
}

describe("positioning", () => {
  it("starts as a draft with no approval, comparables or proof cases", () => {
    const document = oneDraft();

    expect(document.operations.global[0].error).toBeUndefined();
    expect(document.state.global.positioning).toStrictEqual([
      {
        ...FAST,
        status: "DRAFT",
        approvedBy: null,
        approvedAt: null,
        comparables: [],
        proofCaseIds: [],
      },
    ]);
  });

  it("refuses a second positioning with the same id", () => {
    const document = reducer(
      oneDraft(),
      addPositioning({ ...FAST, title: "Other" }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      "Positioning p1 already exists",
    ]);
    expect(document.state.global.positioning).toHaveLength(1);
  });

  it("changes the title or the text of a draft, one field at a time", () => {
    let document = reducer(
      oneDraft(),
      updatePositioning({ id: "p1", title: "Quick signing" }),
    );
    document = reducer(
      document,
      updatePositioning({ id: "p1", text: "Signed in six weeks." }),
    );
    document = reducer(
      document,
      updatePositioning({ id: "p1", title: null, text: null }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.positioning[0]).toMatchObject({
      title: "Quick signing",
      text: "Signed in six weeks.",
      status: "DRAFT",
    });
  });

  it("approves a draft, recording who and when", () => {
    const document = approved();

    expect(document.operations.global[1].error).toBeUndefined();
    expect(document.state.global.positioning[0]).toMatchObject({
      status: "APPROVED",
      approvedBy: INES,
      approvedAt: "2026-11-18T09:30:00.000Z",
    });
  });

  it("returns approved positioning to draft, and clears the approval, when it is updated", () => {
    const document = reducer(
      approved(),
      updatePositioning({ id: "p1", text: "Signed in five weeks." }),
    );

    expect(document.operations.global[2].error).toBeUndefined();
    expect(document.state.global.positioning[0]).toMatchObject({
      text: "Signed in five weeks.",
      status: "DRAFT",
      approvedBy: null,
      approvedAt: null,
    });
  });

  it("refuses to approve anything but a draft", () => {
    let document = reducer(
      approved(),
      approvePositioning({ id: "p1", ...APPROVAL }),
    );
    document = reducer(
      retired(),
      approvePositioning({ id: "p1", ...APPROVAL }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      "Only a draft can be approved",
    ]);
    expect(document.state.global.positioning[0]).toMatchObject({
      status: "RETIRED",
      approvedBy: null,
    });
    const again = reducer(
      approved(),
      approvePositioning({ id: "p1", ...APPROVAL }),
    );
    expect(again.operations.global[2].error).toBe(
      "Only a draft can be approved",
    );
    expect(again.state.global.positioning[0].status).toBe("APPROVED");
  });

  it("retires positioning for good: nothing changes it afterwards", () => {
    let document = retired();
    const before = document.state.global;
    document = reducer(document, updatePositioning({ id: "p1", title: "x" }));
    document = reducer(document, retirePositioning({ id: "p1" }));
    document = reducer(
      document,
      linkPositioningComparable({
        positioningId: "p1",
        comparableId: "n1",
        title: "t",
      }),
    );
    document = reducer(
      document,
      unlinkPositioningComparable({ positioningId: "p1", comparableId: "n1" }),
    );
    document = reducer(
      document,
      linkPositioningProof({ positioningId: "p1", proofCaseId: "c1" }),
    );
    document = reducer(
      document,
      unlinkPositioningProof({ positioningId: "p1", proofCaseId: "c1" }),
    );

    expect(errors(document).slice(2)).toStrictEqual(
      Array(6).fill("Positioning p1 is retired and cannot change"),
    );
    expect(document.state.global).toStrictEqual(before);
  });

  it("links and unlinks comparables, and refuses a repeat or an unknown one", () => {
    const link = {
      positioningId: "p1",
      comparableId: "note-halloway",
      title: "Halloway Fund round",
    };
    let document = reducer(oneDraft(), linkPositioningComparable(link));
    document = reducer(document, linkPositioningComparable(link));
    document = reducer(
      document,
      unlinkPositioningComparable({
        positioningId: "p1",
        comparableId: "note-other",
      }),
    );
    expect(document.state.global.positioning[0].comparables).toStrictEqual([
      { id: "note-halloway", title: "Halloway Fund round" },
    ]);
    document = reducer(
      document,
      unlinkPositioningComparable({
        positioningId: "p1",
        comparableId: "note-halloway",
      }),
    );

    expect(errors(document).slice(1)).toStrictEqual([
      undefined,
      'This note is already linked to positioning "Fast signing".',
      'This note is not linked to positioning "Fast signing".',
      undefined,
    ]);
    expect(document.state.global.positioning[0].comparables).toStrictEqual([]);
  });

  it("links and unlinks proof cases, and refuses a repeat, an unknown or an unlinked one", () => {
    let document = reducer(oneDraft(), addProofCase(CASE));
    document = reducer(
      document,
      linkPositioningProof({ positioningId: "p1", proofCaseId: "c1" }),
    );
    document = reducer(
      document,
      linkPositioningProof({ positioningId: "p1", proofCaseId: "c1" }),
    );
    document = reducer(
      document,
      linkPositioningProof({ positioningId: "p1", proofCaseId: "c9" }),
    );
    document = reducer(
      document,
      unlinkPositioningProof({ positioningId: "p1", proofCaseId: "c9" }),
    );
    expect(document.state.global.positioning[0].proofCaseIds).toStrictEqual([
      "c1",
    ]);
    document = reducer(
      document,
      unlinkPositioningProof({ positioningId: "p1", proofCaseId: "c1" }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      undefined,
      'Proof case "Brisa Labs · e-signature rollout" is already linked to positioning "Fast signing".',
      "Proof case c9 not found",
      'That proof case is not linked to positioning "Fast signing".',
      undefined,
    ]);
    expect(document.state.global.positioning[0].proofCaseIds).toStrictEqual([]);
  });

  it("refuses every operation on positioning the playbook does not have", () => {
    let document = utils.createDocument();
    document = reducer(document, updatePositioning({ id: "p9" }));
    document = reducer(document, approvePositioning({ id: "p9", ...APPROVAL }));
    document = reducer(document, retirePositioning({ id: "p9" }));
    document = reducer(
      document,
      linkPositioningComparable({
        positioningId: "p9",
        comparableId: "n1",
        title: "t",
      }),
    );
    document = reducer(
      document,
      unlinkPositioningComparable({ positioningId: "p9", comparableId: "n1" }),
    );
    document = reducer(
      document,
      linkPositioningProof({ positioningId: "p9", proofCaseId: "c1" }),
    );
    document = reducer(
      document,
      unlinkPositioningProof({ positioningId: "p9", proofCaseId: "c1" }),
    );

    expect(errors(document)).toStrictEqual(
      Array(7).fill("Positioning p9 not found"),
    );
  });

  it("unlinks a removed proof case from every positioning that links to it", () => {
    let document = reducer(
      oneDraft(),
      addPositioning({ ...FAST, id: "p2", title: "Other" }),
    );
    document = reducer(document, addProofCase(CASE));
    document = reducer(
      document,
      addProofCase({ ...CASE, id: "c2", title: "Kelvar Institute · pilot" }),
    );
    for (const [positioningId, proofCaseId] of [
      ["p1", "c1"],
      ["p1", "c2"],
      ["p2", "c1"],
    ])
      document = reducer(
        document,
        linkPositioningProof({ positioningId, proofCaseId }),
      );
    document = reducer(document, removeProofCase({ id: "c1" }));

    expect(errors(document).every((error) => error === undefined)).toBe(true);
    expect(document.state.global.proofCases.map((c) => c.id)).toStrictEqual([
      "c2",
    ]);
    expect(
      document.state.global.positioning.map((p) => p.proofCaseIds),
    ).toStrictEqual([["c2"], []]);
  });
});
