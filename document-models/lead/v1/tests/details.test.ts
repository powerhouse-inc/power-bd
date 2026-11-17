import {
  reducer,
  setLeadDetails,
  setOwner,
  utils,
} from "document-models/lead/v1";
import { describe, expect, it } from "vitest";

const JONAS = "0x1111111111111111111111111111111111111aaa";
const INES = "0x2222222222222222222222222222222222222bbb";

/** The error of each operation, in the order they were dispatched. */
function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

describe("a lead's details", () => {
  it("starts as a lead to contact, with nothing else recorded", () => {
    expect(utils.createDocument().state.global).toStrictEqual({
      name: null,
      kind: null,
      organisationId: null,
      owner: null,
      status: "TO_CONTACT",
      parkedFrom: null,
      statusReason: null,
      closedAt: null,
      angles: [],
      messages: [],
      nextSteps: [],
      interactions: [],
      contactLinks: [],
      references: [],
      confidentialItems: [],
    });
  });

  it("records the name, the kind and the organisation", () => {
    const document = reducer(
      utils.createDocument(),
      setLeadDetails({
        name: "Brisa Labs · e-signature rollout",
        kind: "SALES",
        organisationId: "contact-brisa-labs",
      }),
    );

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global).toMatchObject({
      name: "Brisa Labs · e-signature rollout",
      kind: "SALES",
      organisationId: "contact-brisa-labs",
    });
  });

  it("leaves a detail that is not named as it was, and clears one given as null", () => {
    let document = reducer(
      utils.createDocument(),
      setLeadDetails({
        name: "Brisa Labs · e-signature rollout",
        kind: "SALES",
        organisationId: "contact-brisa-labs",
      }),
    );
    document = reducer(document, setLeadDetails({ kind: "PARTNERSHIP" }));

    expect(document.state.global).toMatchObject({
      name: "Brisa Labs · e-signature rollout",
      kind: "PARTNERSHIP",
      organisationId: "contact-brisa-labs",
    });

    document = reducer(
      document,
      setLeadDetails({ name: "Brisa Labs · partner programme" }),
    );
    document = reducer(
      document,
      setLeadDetails({ organisationId: "contact-kelvar-institute" }),
    );

    expect(document.state.global).toMatchObject({
      name: "Brisa Labs · partner programme",
      kind: "PARTNERSHIP",
      organisationId: "contact-kelvar-institute",
    });

    document = reducer(
      document,
      setLeadDetails({ name: null, kind: null, organisationId: null }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global).toMatchObject({
      name: null,
      kind: null,
      organisationId: null,
    });
  });

  it("records the team member who owns the lead, and a change of owner", () => {
    let document = reducer(utils.createDocument(), setOwner({ owner: JONAS }));

    expect(document.state.global.owner).toBe(JONAS);

    document = reducer(document, setOwner({ owner: INES }));

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.owner).toBe(INES);
  });

  it("clears the owner of a lead that is still to contact", () => {
    let document = reducer(utils.createDocument(), setOwner({ owner: JONAS }));
    document = reducer(document, setOwner({ owner: null }));

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.owner).toBeNull();
  });
});
