import {
  reducer,
  setDecideBy,
  setDecisionOwner,
  setQuestion,
  utils,
} from "document-models/decision/v1";
import { describe, expect, it } from "vitest";

/** Jonas Brandt and Ines Varga, two members of the team. */
const JONAS = "0x1111111111111111111111111111111111111aaa";
const INES = "0x2222222222222222222222222222222222222bbb";

const QUESTION = "Which entity applies to the Kelvar Institute programme?";
const CONTEXT = "The programme takes one application per legal entity.";

describe("a decision's details", () => {
  it("starts open, with no question, owner, decide-by day, answer or references", () => {
    expect(utils.createDocument().state.global).toStrictEqual({
      question: null,
      context: null,
      owner: null,
      decideBy: null,
      status: "OPEN",
      answer: null,
      answeredBy: null,
      answeredAt: null,
      reason: null,
      references: [],
    });
  });

  it("records the question with its context", () => {
    const document = reducer(
      utils.createDocument(),
      setQuestion({ question: QUESTION, context: CONTEXT }),
    );

    expect(document.operations.global[0].error).toBeUndefined();
    expect(document.state.global.question).toBe(
      "Which entity applies to the Kelvar Institute programme?",
    );
    expect(document.state.global.context).toBe(
      "The programme takes one application per legal entity.",
    );
  });

  it("rewords the question and leaves the context alone when none is given", () => {
    let document = reducer(
      utils.createDocument(),
      setQuestion({ question: QUESTION, context: CONTEXT }),
    );
    document = reducer(
      document,
      setQuestion({ question: "Which legal entity applies?" }),
    );

    expect(document.operations.global[1].error).toBeUndefined();
    expect(document.state.global.question).toBe("Which legal entity applies?");
    expect(document.state.global.context).toBe(
      "The programme takes one application per legal entity.",
    );
  });

  it("clears the context when it is given as null", () => {
    let document = reducer(
      utils.createDocument(),
      setQuestion({ question: QUESTION, context: CONTEXT }),
    );
    document = reducer(
      document,
      setQuestion({ question: QUESTION, context: null }),
    );

    expect(document.operations.global[1].error).toBeUndefined();
    expect(document.state.global.question).toBe(
      "Which entity applies to the Kelvar Institute programme?",
    );
    expect(document.state.global.context).toBeNull();
  });

  it("gives the decision to a team member, and passes it on to another", () => {
    let document = reducer(
      utils.createDocument(),
      setDecisionOwner({ owner: JONAS }),
    );

    expect(document.state.global.owner).toBe(
      "0x1111111111111111111111111111111111111aaa",
    );

    document = reducer(document, setDecisionOwner({ owner: INES }));

    expect(document.state.global.owner).toBe(
      "0x2222222222222222222222222222222222222bbb",
    );
    expect(
      document.operations.global.map((operation) => operation.error),
    ).toStrictEqual([undefined, undefined]);
  });

  it("keeps the owner when none is named, and leaves the decision without one when it is given as null", () => {
    let document = reducer(
      utils.createDocument(),
      setDecisionOwner({ owner: JONAS }),
    );
    document = reducer(document, setDecisionOwner({}));

    expect(document.state.global.owner).toBe(
      "0x1111111111111111111111111111111111111aaa",
    );

    document = reducer(document, setDecisionOwner({ owner: null }));

    expect(document.state.global.owner).toBeNull();
    expect(
      document.operations.global.map((operation) => operation.error),
    ).toStrictEqual([undefined, undefined, undefined]);
  });

  it("sets the day the decision is needed by, and moves it", () => {
    let document = reducer(
      utils.createDocument(),
      setDecideBy({ decideBy: "2026-11-20T00:00:00.000Z" }),
    );

    expect(document.state.global.decideBy).toBe("2026-11-20T00:00:00.000Z");

    document = reducer(
      document,
      setDecideBy({ decideBy: "2026-12-04T00:00:00.000Z" }),
    );

    expect(document.state.global.decideBy).toBe("2026-12-04T00:00:00.000Z");
    expect(
      document.operations.global.map((operation) => operation.error),
    ).toStrictEqual([undefined, undefined]);
  });

  it("keeps the day when none is named, and removes it when it is given as null", () => {
    let document = reducer(
      utils.createDocument(),
      setDecideBy({ decideBy: "2026-11-20T00:00:00.000Z" }),
    );
    document = reducer(document, setDecideBy({}));

    expect(document.state.global.decideBy).toBe("2026-11-20T00:00:00.000Z");

    document = reducer(document, setDecideBy({ decideBy: null }));

    expect(document.state.global.decideBy).toBeNull();
    expect(
      document.operations.global.map((operation) => operation.error),
    ).toStrictEqual([undefined, undefined, undefined]);
  });
});
