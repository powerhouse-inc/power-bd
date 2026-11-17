import {
  answerDecision,
  reducer,
  reopenDecision,
  setDecisionOwner,
  setQuestion,
  utils,
  withdrawDecision,
} from "document-models/decision/v1";
import { describe, expect, it } from "vitest";

/** Jonas Brandt and Ines Varga, two members of the team. */
const JONAS = "0x1111111111111111111111111111111111111aaa";
const INES = "0x2222222222222222222222222222222222222bbb";

/** An open decision with its question, owned by Jonas. */
function openDecision() {
  const document = reducer(
    utils.createDocument(),
    setQuestion({
      question: "Which entity applies to the Kelvar Institute programme?",
      context: "The programme takes one application per legal entity.",
    }),
  );
  return reducer(document, setDecisionOwner({ owner: JONAS }));
}

describe("answering, reopening and withdrawing a decision", () => {
  it("records the answer, who gave it and when", () => {
    const document = reducer(
      openDecision(),
      answerDecision({
        answer: "The foundation applies, not the operating company.",
        answeredBy: INES,
        answeredAt: "2026-11-18T09:30:00.000Z",
      }),
    );

    expect(document.operations.global[2].error).toBeUndefined();
    expect(document.state.global).toStrictEqual({
      question: "Which entity applies to the Kelvar Institute programme?",
      context: "The programme takes one application per legal entity.",
      owner: "0x1111111111111111111111111111111111111aaa",
      decideBy: null,
      status: "ANSWERED",
      answer: "The foundation applies, not the operating company.",
      answeredBy: "0x2222222222222222222222222222222222222bbb",
      answeredAt: "2026-11-18T09:30:00.000Z",
      reason: null,
      references: [],
    });
  });

  it("refuses an answer that has no text", () => {
    let document = openDecision();
    for (const answer of ["", "   "]) {
      document = reducer(
        document,
        answerDecision({
          answer,
          answeredBy: INES,
          answeredAt: "2026-11-18T09:30:00.000Z",
        }),
      );
    }

    expect(
      document.operations.global.slice(2).map((operation) => operation.error),
    ).toStrictEqual(["The answer needs text", "The answer needs text"]);
    expect(document.state.global).toMatchObject({
      status: "OPEN",
      answer: null,
      answeredBy: null,
      answeredAt: null,
    });
  });

  it("refuses a second answer while the first one stands", () => {
    let document = reducer(
      openDecision(),
      answerDecision({
        answer: "The foundation applies, not the operating company.",
        answeredBy: INES,
        answeredAt: "2026-11-18T09:30:00.000Z",
      }),
    );
    document = reducer(
      document,
      answerDecision({
        answer: "The operating company applies.",
        answeredBy: JONAS,
        answeredAt: "2026-11-19T14:00:00.000Z",
      }),
    );

    expect(document.operations.global[3].error).toBe(
      "Only an open decision can be answered",
    );
    expect(document.state.global).toMatchObject({
      status: "ANSWERED",
      answer: "The foundation applies, not the operating company.",
      answeredBy: "0x2222222222222222222222222222222222222bbb",
      answeredAt: "2026-11-18T09:30:00.000Z",
    });
  });
});

/** An answered decision: operations 0 and 1 set it up, 2 answers it. */
function answeredDecision() {
  return reducer(
    openDecision(),
    answerDecision({
      answer: "The foundation applies, not the operating company.",
      answeredBy: INES,
      answeredAt: "2026-11-18T09:30:00.000Z",
    }),
  );
}

describe("reopening a decision", () => {
  it("clears the answer and keeps the reason", () => {
    const document = reducer(
      answeredDecision(),
      reopenDecision({ reason: "The programme changed its rules." }),
    );

    expect(document.operations.global[3].error).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: "OPEN",
      answer: null,
      answeredBy: null,
      answeredAt: null,
      reason: "The programme changed its rules.",
    });
  });

  it("reopens without a reason, and can be answered again", () => {
    let document = reducer(answeredDecision(), reopenDecision({}));
    document = reducer(
      document,
      answerDecision({
        answer: "The operating company applies.",
        answeredBy: JONAS,
        answeredAt: "2026-11-19T14:00:00.000Z",
      }),
    );

    expect(document.operations.global[3].error).toBeUndefined();
    expect(document.operations.global[4].error).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: "ANSWERED",
      answer: "The operating company applies.",
      reason: null,
    });
  });

  it("refuses to reopen a decision that is open or withdrawn", () => {
    let document = reducer(openDecision(), reopenDecision({ reason: "x" }));
    document = reducer(document, withdrawDecision({}));
    document = reducer(document, reopenDecision({}));

    expect(
      document.operations.global.slice(2).map((operation) => operation.error),
    ).toStrictEqual([
      "Only an answered decision can be reopened",
      undefined,
      "Only an answered decision can be reopened",
    ]);
    expect(document.state.global.status).toBe("WITHDRAWN");
    expect(document.state.global.reason).toBeNull();
  });
});

describe("withdrawing a decision", () => {
  it("withdraws an open decision with its reason", () => {
    const document = reducer(
      openDecision(),
      withdrawDecision({ reason: "The programme closed." }),
    );

    expect(document.operations.global[2].error).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: "WITHDRAWN",
      reason: "The programme closed.",
    });
  });

  it("is final: nothing answers or withdraws it again", () => {
    let document = reducer(openDecision(), withdrawDecision({}));
    document = reducer(
      document,
      answerDecision({
        answer: "Too late.",
        answeredBy: INES,
        answeredAt: "2026-11-18T09:30:00.000Z",
      }),
    );
    document = reducer(document, withdrawDecision({ reason: "again" }));

    expect(
      document.operations.global.slice(2).map((operation) => operation.error),
    ).toStrictEqual([
      undefined,
      "Only an open decision can be answered",
      "Only an open decision can be withdrawn",
    ]);
    expect(document.state.global).toMatchObject({
      status: "WITHDRAWN",
      answer: null,
      reason: null,
    });
  });

  it("refuses to withdraw an answered decision", () => {
    const document = reducer(answeredDecision(), withdrawDecision({}));

    expect(document.operations.global[3].error).toBe(
      "Only an open decision can be withdrawn",
    );
    expect(document.state.global.status).toBe("ANSWERED");
  });
});
