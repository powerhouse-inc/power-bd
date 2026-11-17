import {
  addProofCase,
  addProofEvidence,
  linkProofComparable,
  reducer,
  removeProofCase,
  removeProofEvidence,
  unlinkProofComparable,
  updateProofCase,
  utils,
} from "document-models/playbook/v1";
import { describe, expect, it } from "vitest";

const BRISA = {
  id: "c1",
  title: "Brisa Labs · e-signature rollout",
  summary: "Brisa Labs moved its contract signing to us in six weeks.",
  mayBeNamedPublicly: true,
};
const KELVAR = {
  id: "c2",
  title: "Kelvar Institute · reporting pilot",
  summary: null,
  mayBeNamedPublicly: false,
};

/** Vault notes and sources, as a proof case keeps them: the id with its cached title. */
const ROLLOUT_REVIEW = {
  id: "note-rollout-review",
  title: "Rollout review, signed off by Brisa Labs",
};
const SIGNING_LOG = {
  id: "source-signing-log",
  title: "Brisa Labs signing log",
};

/** The error of each operation, in the order they were dispatched. */
function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

/** Brisa Labs (c1) and Kelvar Institute (c2), as the first two operations. */
function twoCases() {
  const document = reducer(utils.createDocument(), addProofCase(BRISA));
  return reducer(document, addProofCase(KELVAR));
}

describe("proof cases", () => {
  it("adds a proof case, which starts without evidence or comparables", () => {
    const document = reducer(
      utils.createDocument(),
      addProofCase({
        id: "c1",
        title: "Brisa Labs · e-signature rollout",
        summary: "Brisa Labs moved its contract signing to us in six weeks.",
        mayBeNamedPublicly: true,
      }),
    );

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global.proofCases).toStrictEqual([
      {
        id: "c1",
        title: "Brisa Labs · e-signature rollout",
        summary: "Brisa Labs moved its contract signing to us in six weeks.",
        evidence: [],
        mayBeNamedPublicly: true,
        comparables: [],
      },
    ]);
  });

  it("adds a proof case that has no summary yet and may not be named publicly", () => {
    const document = reducer(
      utils.createDocument(),
      addProofCase({
        id: "c2",
        title: "Kelvar Institute · reporting pilot",
        mayBeNamedPublicly: false,
      }),
    );

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global.proofCases).toStrictEqual([
      {
        id: "c2",
        title: "Kelvar Institute · reporting pilot",
        summary: null,
        evidence: [],
        mayBeNamedPublicly: false,
        comparables: [],
      },
    ]);
  });

  it("refuses a proof case whose id is already in the playbook", () => {
    let document = reducer(
      utils.createDocument(),
      addProofCase({
        id: "c1",
        title: "Brisa Labs · e-signature rollout",
        mayBeNamedPublicly: true,
      }),
    );
    document = reducer(
      document,
      addProofCase({
        id: "c1",
        title: "Kelvar Institute · reporting pilot",
        mayBeNamedPublicly: false,
      }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      "Proof case c1 already exists",
    ]);
    expect(document.state.global.proofCases).toStrictEqual([
      {
        id: "c1",
        title: "Brisa Labs · e-signature rollout",
        summary: null,
        evidence: [],
        mayBeNamedPublicly: true,
        comparables: [],
      },
    ]);
  });

  it("changes the title, the summary or whether the case may be named publicly, one field at a time", () => {
    let document = twoCases();
    document = reducer(
      document,
      updateProofCase({ id: "c2", title: "Kelvar Institute · yearly report" }),
    );
    document = reducer(
      document,
      updateProofCase({
        id: "c2",
        summary: "Kelvar Institute filed its yearly report in four days.",
      }),
    );
    document = reducer(
      document,
      updateProofCase({ id: "c2", mayBeNamedPublicly: true }),
    );
    document = reducer(
      document,
      updateProofCase({ id: "c1", mayBeNamedPublicly: false }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.proofCases).toStrictEqual([
      {
        id: "c1",
        title: "Brisa Labs · e-signature rollout",
        summary: "Brisa Labs moved its contract signing to us in six weeks.",
        evidence: [],
        mayBeNamedPublicly: false,
        comparables: [],
      },
      {
        id: "c2",
        title: "Kelvar Institute · yearly report",
        summary: "Kelvar Institute filed its yearly report in four days.",
        evidence: [],
        mayBeNamedPublicly: true,
        comparables: [],
      },
    ]);
  });

  it("clears the summary with null, and keeps a title and a public flag sent as null", () => {
    let document = twoCases();
    document = reducer(
      document,
      updateProofCase({
        id: "c1",
        title: null,
        summary: null,
        mayBeNamedPublicly: null,
      }),
    );

    expect(errors(document).slice(2)).toStrictEqual([undefined]);
    expect(document.state.global.proofCases[0]).toStrictEqual({
      id: "c1",
      title: "Brisa Labs · e-signature rollout",
      summary: null,
      evidence: [],
      mayBeNamedPublicly: true,
      comparables: [],
    });
  });

  it("refuses to update a proof case that is not in the playbook", () => {
    let document = twoCases();
    document = reducer(
      document,
      updateProofCase({ id: "c9", title: "A case nobody added" }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      "Proof case c9 not found",
    ]);
    expect(document.state.global.proofCases).toStrictEqual([
      { ...BRISA, evidence: [], comparables: [] },
      { ...KELVAR, evidence: [], comparables: [] },
    ]);
  });

  it("points a proof case at the vault notes and sources that back it", () => {
    let document = twoCases();
    document = reducer(
      document,
      addProofEvidence({
        proofCaseId: "c1",
        evidenceId: "note-rollout-review",
        title: "Rollout review, signed off by Brisa Labs",
      }),
    );
    document = reducer(
      document,
      addProofEvidence({
        proofCaseId: "c1",
        evidenceId: "source-signing-log",
        title: "Brisa Labs signing log",
      }),
    );

    expect(errors(document).slice(2)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.proofCases).toStrictEqual([
      {
        id: "c1",
        title: "Brisa Labs · e-signature rollout",
        summary: "Brisa Labs moved its contract signing to us in six weeks.",
        evidence: [
          {
            id: "note-rollout-review",
            title: "Rollout review, signed off by Brisa Labs",
          },
          { id: "source-signing-log", title: "Brisa Labs signing log" },
        ],
        mayBeNamedPublicly: true,
        comparables: [],
      },
      { ...KELVAR, evidence: [], comparables: [] },
    ]);
  });

  it("refuses evidence for an unknown proof case, and evidence the case already has", () => {
    let document = twoCases();
    document = reducer(
      document,
      addProofEvidence({
        proofCaseId: "c1",
        evidenceId: ROLLOUT_REVIEW.id,
        title: ROLLOUT_REVIEW.title,
      }),
    );
    document = reducer(
      document,
      addProofEvidence({
        proofCaseId: "c9",
        evidenceId: SIGNING_LOG.id,
        title: SIGNING_LOG.title,
      }),
    );
    document = reducer(
      document,
      addProofEvidence({
        proofCaseId: "c1",
        evidenceId: ROLLOUT_REVIEW.id,
        title: "The same note under another title",
      }),
    );
    // The same note may back another case.
    document = reducer(
      document,
      addProofEvidence({
        proofCaseId: "c2",
        evidenceId: ROLLOUT_REVIEW.id,
        title: ROLLOUT_REVIEW.title,
      }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      undefined,
      "Proof case c9 not found",
      "Evidence note-rollout-review already exists",
      undefined,
    ]);
    expect(document.state.global.proofCases).toStrictEqual([
      { ...BRISA, evidence: [ROLLOUT_REVIEW], comparables: [] },
      { ...KELVAR, evidence: [ROLLOUT_REVIEW], comparables: [] },
    ]);
  });

  it("removes evidence from a proof case, and refuses evidence it does not have", () => {
    let document = reducer(
      twoCases(),
      addProofEvidence({
        proofCaseId: "c1",
        evidenceId: ROLLOUT_REVIEW.id,
        title: ROLLOUT_REVIEW.title,
      }),
    );
    document = reducer(
      document,
      addProofEvidence({
        proofCaseId: "c1",
        evidenceId: SIGNING_LOG.id,
        title: SIGNING_LOG.title,
      }),
    );
    document = reducer(
      document,
      removeProofEvidence({ proofCaseId: "c1", evidenceId: ROLLOUT_REVIEW.id }),
    );
    document = reducer(
      document,
      removeProofEvidence({ proofCaseId: "c1", evidenceId: ROLLOUT_REVIEW.id }),
    );
    document = reducer(
      document,
      removeProofEvidence({ proofCaseId: "c9", evidenceId: SIGNING_LOG.id }),
    );

    expect(errors(document).slice(4)).toStrictEqual([
      undefined,
      "Evidence note-rollout-review not found",
      "Proof case c9 not found",
    ]);
    expect(document.state.global.proofCases[0].evidence).toStrictEqual([
      SIGNING_LOG,
    ]);
  });

  it("links and unlinks comparables, and refuses a repeat, an unknown one or an unknown case", () => {
    const comparable = {
      proofCaseId: "c1",
      comparableId: "note-halloway",
      title: "Halloway Fund round",
    };
    let document = reducer(twoCases(), linkProofComparable(comparable));
    document = reducer(document, linkProofComparable(comparable));
    document = reducer(
      document,
      linkProofComparable({ ...comparable, proofCaseId: "c9" }),
    );
    document = reducer(
      document,
      unlinkProofComparable({ proofCaseId: "c1", comparableId: "note-other" }),
    );
    document = reducer(
      document,
      unlinkProofComparable({
        proofCaseId: "c9",
        comparableId: "note-halloway",
      }),
    );
    expect(document.state.global.proofCases[0].comparables).toStrictEqual([
      { id: "note-halloway", title: "Halloway Fund round" },
    ]);
    document = reducer(
      document,
      unlinkProofComparable({
        proofCaseId: "c1",
        comparableId: "note-halloway",
      }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      undefined,
      'This note is already linked to proof case "Brisa Labs · e-signature rollout".',
      "Proof case c9 not found",
      'This note is not linked to proof case "Brisa Labs · e-signature rollout".',
      "Proof case c9 not found",
      undefined,
    ]);
    expect(document.state.global.proofCases[0].comparables).toStrictEqual([]);
  });

  it("removes a proof case, and refuses one the playbook does not have", () => {
    let document = reducer(twoCases(), removeProofCase({ id: "c1" }));
    document = reducer(document, removeProofCase({ id: "c1" }));

    expect(errors(document).slice(2)).toStrictEqual([
      undefined,
      "Proof case c1 not found",
    ]);
    expect(document.state.global.proofCases.map((c) => c.id)).toStrictEqual([
      "c2",
    ]);
  });
});
