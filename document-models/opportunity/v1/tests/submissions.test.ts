import {
  addStep,
  markSubmission,
  recordSubmissionOutcome,
  reducer,
  removeStep,
  utils,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";

type Doc = ReturnType<typeof utils.createDocument>;

const MEMBER = "0x1111111111111111111111111111111111111111";
const SENT = {
  id: "sub-1",
  stepId: "step-cut-1",
  submittedAt: "2027-03-14T16:00:00.000Z",
  where: "https://apply.halloway.example",
  submittedBy: MEMBER,
};
const OUTCOME = {
  id: "sub-1",
  result: "AWARDED" as const,
  amount: 180000,
  currency: "EUR",
  text: "Awarded with two conditions",
  receivedAt: "2027-06-01T09:00:00.000Z",
};

function lastError(document: Doc) {
  return document.operations.global.at(-1)?.error;
}
function withStep(): Doc {
  return reducer(
    utils.createDocument(),
    addStep({
      id: "step-cut-1",
      kind: "CUT_OFF",
      label: "First cut-off",
      at: "2027-03-15T11:00:00.000Z",
      timeZone: "Europe/Brussels",
      source: "Call text",
      checkedAt: "2026-11-03T08:00:00.000Z",
    }),
  );
}
function withSubmission(): Doc {
  return reducer(withStep(), markSubmission(SENT));
}

describe("submissions", () => {
  it("marks a submission, with no outcome yet", () => {
    const document = withSubmission();

    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.submissions).toStrictEqual([
      { ...SENT, outcome: null },
    ]);
  });

  it("marks a submission that names no step and no place", () => {
    const document = reducer(
      utils.createDocument(),
      markSubmission({
        id: "sub-2",
        submittedAt: SENT.submittedAt,
        submittedBy: MEMBER,
      }),
    );

    expect(document.state.global.submissions).toStrictEqual([
      {
        id: "sub-2",
        stepId: null,
        submittedAt: SENT.submittedAt,
        where: null,
        submittedBy: MEMBER,
        outcome: null,
      },
    ]);
  });

  it("refuses a repeated id and a step that does not exist", () => {
    const repeated = reducer(withSubmission(), markSubmission(SENT));
    const unknown = reducer(utils.createDocument(), markSubmission(SENT));

    expect(lastError(repeated)).toBe("Submission sub-1 already exists");
    expect(repeated.state.global.submissions).toHaveLength(1);
    expect(lastError(unknown)).toBe("Step step-cut-1 not found");
    expect(unknown.state.global.submissions).toStrictEqual([]);
  });

  it("records the outcome once", () => {
    const document = reducer(
      withSubmission(),
      recordSubmissionOutcome(OUTCOME),
    );

    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.submissions[0]).toStrictEqual({
      ...SENT,
      outcome: {
        result: "AWARDED",
        amount: 180000,
        currency: "EUR",
        text: "Awarded with two conditions",
        receivedAt: "2027-06-01T09:00:00.000Z",
      },
    });
  });

  it("records an outcome with only a result and a date", () => {
    const document = reducer(
      withSubmission(),
      recordSubmissionOutcome({
        id: "sub-1",
        result: "PASSED",
        receivedAt: OUTCOME.receivedAt,
      }),
    );

    expect(document.state.global.submissions[0].outcome).toStrictEqual({
      result: "PASSED",
      amount: null,
      currency: null,
      text: null,
      receivedAt: OUTCOME.receivedAt,
    });
  });

  it("refuses a second outcome and keeps the first", () => {
    const first = reducer(withSubmission(), recordSubmissionOutcome(OUTCOME));
    const second = reducer(
      first,
      recordSubmissionOutcome({ ...OUTCOME, result: "UNSUCCESSFUL" }),
    );

    expect(lastError(second)).toBe(
      "The outcome of submission sub-1 is already recorded",
    );
    expect(second.state.global.submissions).toStrictEqual(
      first.state.global.submissions,
    );
  });

  it("refuses an outcome for an unknown submission, and an amount without a currency", () => {
    const unknown = reducer(
      withSubmission(),
      recordSubmissionOutcome({ ...OUTCOME, id: "nope" }),
    );
    const noCurrency = reducer(
      withSubmission(),
      recordSubmissionOutcome({ ...OUTCOME, currency: undefined }),
    );

    expect(lastError(unknown)).toBe("Submission nope not found");
    expect(lastError(noCurrency)).toBe("An amount needs a currency");
    expect(noCurrency.state.global.submissions[0].outcome).toBeNull();
  });

  it("refuses to remove a step that a submission names", () => {
    const before = withSubmission();
    const after = reducer(before, removeStep({ id: "step-cut-1" }));

    expect(lastError(after)).toBe(
      "Step step-cut-1 is named by a submission and cannot be removed",
    );
    expect(after.state.global.steps).toStrictEqual(before.state.global.steps);
  });
});
