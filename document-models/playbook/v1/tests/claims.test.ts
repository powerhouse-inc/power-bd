import {
  addNeverClaim,
  reducer,
  removeNeverClaim,
  updateNeverClaim,
  utils,
} from "document-models/playbook/v1";
import { describe, expect, it } from "vitest";

const AUDITED = {
  id: "n1",
  claim: "Our books are audited",
  reason: "No audit has taken place",
  phrases: ["independently audited", "fully audited"],
};
const GUARANTEED = {
  id: "n2",
  claim: "Funding is guaranteed",
  reason: null,
  phrases: ["guaranteed funding"],
};

/** The error of each operation, in the order they were dispatched. */
function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

/** The audited claim (n1) and the guaranteed claim (n2), as the first two operations. */
function twoClaims() {
  const document = reducer(utils.createDocument(), addNeverClaim(AUDITED));
  return reducer(document, addNeverClaim(GUARANTEED));
}

describe("the never-claim list", () => {
  it("adds a claim we must never make, with the reason and the phrases that would make it", () => {
    const document = reducer(
      utils.createDocument(),
      addNeverClaim({
        id: "n1",
        claim: "Our books are audited",
        reason: "No audit has taken place",
        phrases: ["independently audited", "fully audited"],
      }),
    );

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global.neverClaims).toStrictEqual([
      {
        id: "n1",
        claim: "Our books are audited",
        reason: "No audit has taken place",
        phrases: ["independently audited", "fully audited"],
      },
    ]);
  });

  it("adds a claim whose reason is not written yet", () => {
    const document = reducer(
      utils.createDocument(),
      addNeverClaim({ id: "n1", claim: "Funding is guaranteed", phrases: [] }),
    );

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global.neverClaims).toStrictEqual([
      { id: "n1", claim: "Funding is guaranteed", reason: null, phrases: [] },
    ]);
  });

  it("refuses a claim whose id is already on the list", () => {
    let document = reducer(
      utils.createDocument(),
      addNeverClaim({
        id: "n1",
        claim: "Our books are audited",
        phrases: ["fully audited"],
      }),
    );
    document = reducer(
      document,
      addNeverClaim({
        id: "n1",
        claim: "Funding is guaranteed",
        phrases: ["guaranteed funding"],
      }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      "Never-claim item n1 already exists",
    ]);
    expect(document.state.global.neverClaims).toStrictEqual([
      {
        id: "n1",
        claim: "Our books are audited",
        reason: null,
        phrases: ["fully audited"],
      },
    ]);
  });

  it("changes the claim, the reason or the phrases, one field at a time", () => {
    let document = twoClaims();
    document = reducer(
      document,
      updateNeverClaim({ id: "n1", claim: "Our accounts are audited" }),
    );
    document = reducer(
      document,
      updateNeverClaim({ id: "n1", reason: "The first audit is next year" }),
    );
    document = reducer(
      document,
      updateNeverClaim({ id: "n1", phrases: ["audited accounts"] }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.neverClaims).toStrictEqual([
      {
        id: "n1",
        claim: "Our accounts are audited",
        reason: "The first audit is next year",
        phrases: ["audited accounts"],
      },
      GUARANTEED,
    ]);
  });

  it("clears the reason with null, and keeps a claim and phrases sent as null", () => {
    let document = twoClaims();
    document = reducer(
      document,
      updateNeverClaim({ id: "n1", claim: null, reason: null, phrases: null }),
    );

    expect(errors(document).slice(2)).toStrictEqual([undefined]);
    expect(document.state.global.neverClaims[0]).toStrictEqual({
      id: "n1",
      claim: "Our books are audited",
      reason: null,
      phrases: ["independently audited", "fully audited"],
    });
  });

  it("refuses to update a claim that is not on the list", () => {
    let document = twoClaims();
    document = reducer(
      document,
      updateNeverClaim({ id: "n9", claim: "We never miss a deadline" }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      "Never-claim item n9 not found",
    ]);
    expect(document.state.global.neverClaims).toStrictEqual([
      AUDITED,
      GUARANTEED,
    ]);
  });

  it("takes a claim off the list", () => {
    let document = twoClaims();
    document = reducer(document, removeNeverClaim({ id: "n1" }));

    expect(errors(document).slice(2)).toStrictEqual([undefined]);
    expect(document.state.global.neverClaims).toStrictEqual([GUARANTEED]);
  });

  it("refuses to remove a claim that is not on the list", () => {
    let document = twoClaims();
    document = reducer(document, removeNeverClaim({ id: "n9" }));

    expect(errors(document).slice(2)).toStrictEqual([
      "Never-claim item n9 not found",
    ]);
    expect(document.state.global.neverClaims).toStrictEqual([
      AUDITED,
      GUARANTEED,
    ]);
  });
});
