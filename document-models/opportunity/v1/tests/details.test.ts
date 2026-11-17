import {
  reducer,
  setFit,
  setOpportunityDetails,
  setOpportunityStatus,
  setOwner,
  utils,
  type SetOpportunityDetailsInput,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";

/** A new opportunity, as the spec's state list gives it. */
const NEW_OPPORTUNITY = {
  name: null,
  funderId: null,
  programme: null,
  roundLabel: null,
  roundOpenedAt: null,
  instrument: null,
  amount: null,
  currency: null,
  fundingRate: null,
  whereToApply: null,
  rolling: false,
  owner: null,
  fit: null,
  fitReasoning: null,
  status: "TO_EVALUATE",
  statusReason: null,
  closedAt: null,
  expectedOpening: null,
  decideBy: null,
  blocked: null,
  goNoGoDecisions: [],
  steps: [],
  conditions: [],
  attemptLimit: null,
  applyingEntity: null,
  submissions: [],
  coordinatorId: null,
  partners: [],
  nextSteps: [],
  interactions: [],
  contactLinks: [],
  references: [],
  confidentialItems: [],
};

/** Everything SET_OPPORTUNITY_DETAILS records, for an invented call. */
const HALLOWAY_CALL: SetOpportunityDetailsInput = {
  name: "Halloway Fund · 2027 open call",
  funderId: "contact-halloway",
  programme: {
    id: "note-halloway-rules",
    title: "Halloway Fund: open call rules",
  },
  roundLabel: "2027",
  roundOpenedAt: "2026-09-01T07:00:00.000Z",
  instrument: "GRANT",
  amount: 250000,
  currency: "EUR",
  fundingRate: 70,
  whereToApply: "https://apply.halloway.example",
  rolling: true,
};

/** The Halloway call with all its facts, recorded by the first operation. */
function hallowayCall() {
  return reducer(utils.createDocument(), setOpportunityDetails(HALLOWAY_CALL));
}

describe("an opportunity's facts", () => {
  it("starts in to evaluate, not rolling, with nothing else recorded", () => {
    expect(utils.createDocument().state.global).toStrictEqual(NEW_OPPORTUNITY);
  });

  it("records what the funder offers", () => {
    const document = reducer(
      utils.createDocument(),
      setOpportunityDetails(HALLOWAY_CALL),
    );

    expect(document.operations.global[0].error).toBeUndefined();
    expect(document.state.global).toStrictEqual({
      ...NEW_OPPORTUNITY,
      name: "Halloway Fund · 2027 open call",
      funderId: "contact-halloway",
      programme: {
        id: "note-halloway-rules",
        title: "Halloway Fund: open call rules",
      },
      roundLabel: "2027",
      roundOpenedAt: "2026-09-01T07:00:00.000Z",
      instrument: "GRANT",
      amount: 250000,
      currency: "EUR",
      fundingRate: 70,
      whereToApply: "https://apply.halloway.example",
      rolling: true,
    });
  });

  it("changes one fact and leaves the others as they were", () => {
    const document = reducer(
      hallowayCall(),
      setOpportunityDetails({ roundLabel: "2028" }),
    );

    expect(document.operations.global[1].error).toBeUndefined();
    expect(document.state.global).toStrictEqual({
      ...NEW_OPPORTUNITY,
      ...HALLOWAY_CALL,
      roundLabel: "2028",
    });
  });

  it("clears a fact that is set to null, except the rolling flag", () => {
    const document = reducer(
      hallowayCall(),
      setOpportunityDetails({
        name: null,
        funderId: null,
        programme: null,
        roundLabel: null,
        roundOpenedAt: null,
        instrument: null,
        fundingRate: null,
        whereToApply: null,
        rolling: null,
      }),
    );

    expect(document.operations.global[1].error).toBeUndefined();
    expect(document.state.global).toStrictEqual({
      ...NEW_OPPORTUNITY,
      amount: 250000,
      currency: "EUR",
      rolling: true,
    });
  });
});

const OWNER = "0x1111111111111111111111111111111111111111";

describe("what the details refuse", () => {
  it("refuses an amount that has no currency, and keeps the state", () => {
    const before = utils.createDocument();
    const document = reducer(before, setOpportunityDetails({ amount: 1000 }));

    expect(document.operations.global[0].error).toBe(
      "An amount needs a currency",
    );
    expect(document.state.global).toStrictEqual(NEW_OPPORTUNITY);
  });

  it("accepts an amount and its currency set together, and a currency kept from before", () => {
    let document = reducer(
      utils.createDocument(),
      setOpportunityDetails({ amount: 1000, currency: "CHF" }),
    );
    document = reducer(document, setOpportunityDetails({ amount: 2000 }));

    expect(document.operations.global.map((o) => o.error)).toStrictEqual([
      undefined,
      undefined,
    ]);
    expect(document.state.global.amount).toBe(2000);
    expect(document.state.global.currency).toBe("CHF");
  });

  it("refuses a funding rate outside 0 to 100, and accepts the ends", () => {
    let document = utils.createDocument();
    for (const fundingRate of [-1, 101, 0, 100]) {
      document = reducer(document, setOpportunityDetails({ fundingRate }));
    }

    expect(document.operations.global.map((o) => o.error)).toStrictEqual([
      "The funding rate is a percentage between 0 and 100",
      "The funding rate is a percentage between 0 and 100",
      undefined,
      undefined,
    ]);
    expect(document.state.global.fundingRate).toBe(100);
  });

  it("refuses a change that is half wrong without applying the other half", () => {
    const document = reducer(
      utils.createDocument(),
      setOpportunityDetails({ name: "Kelvar call", fundingRate: 120 }),
    );

    expect(document.state.global.name).toBeNull();
  });
});

describe("the owner", () => {
  it("clears the owner when the call leaves it out, while the opportunity is to evaluate", () => {
    let document = reducer(utils.createDocument(), setOwner({ owner: OWNER }));
    document = reducer(document, setOwner({}));

    expect(document.operations.global.map((o) => o.error)).toStrictEqual([
      undefined,
      undefined,
    ]);
    expect(document.state.global.owner).toBeNull();
  });

  it("sets the owner and clears it while the opportunity is to evaluate", () => {
    let document = reducer(utils.createDocument(), setOwner({ owner: OWNER }));
    expect(document.state.global.owner).toBe(OWNER);
    document = reducer(document, setOwner({ owner: null }));

    expect(document.operations.global.map((o) => o.error)).toStrictEqual([
      undefined,
      undefined,
    ]);
    expect(document.state.global.owner).toBeNull();
  });

  it("refuses to clear the owner of an opportunity that is past to evaluate", () => {
    let document = reducer(utils.createDocument(), setOwner({ owner: OWNER }));
    document = reducer(
      document,
      setOpportunityStatus({
        status: "DECIDING",
        changedAt: "2026-11-01T09:00:00.000Z",
      }),
    );
    document = reducer(document, setOwner({ owner: null }));

    expect(document.operations.global[2].error).toBe(
      "An opportunity past to evaluate needs an owner",
    );
    expect(document.state.global.owner).toBe(OWNER);
  });
});

describe("the fit", () => {
  it("records the fit and its reasoning note, and changes one without the other", () => {
    let document = reducer(
      utils.createDocument(),
      setFit({
        fit: "BEST",
        reasoning: { id: "note-fit-halloway", title: "Why Halloway fits" },
      }),
    );
    document = reducer(document, setFit({ fit: "LATER" }));
    document = reducer(
      document,
      setFit({ reasoning: { id: "note-fit-2", title: "A second reading" } }),
    );

    expect(document.state.global.fit).toBe("LATER");
    expect(document.state.global.fitReasoning).toStrictEqual({
      id: "note-fit-2",
      title: "A second reading",
    });
  });

  it("clears the fit and the reasoning with null", () => {
    let document = reducer(
      utils.createDocument(),
      setFit({
        fit: "GOOD",
        reasoning: { id: "note-fit-halloway", title: "Why Halloway fits" },
      }),
    );
    document = reducer(document, setFit({ fit: null, reasoning: null }));

    expect(document.operations.global[1].error).toBeUndefined();
    expect(document.state.global.fit).toBeNull();
    expect(document.state.global.fitReasoning).toBeNull();
  });
});
