import {
  addPartner,
  reducer,
  removePartner,
  setCoordinator,
  updatePartner,
  utils,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";

type Doc = ReturnType<typeof utils.createDocument>;

const KELVAR = {
  id: "partner-kelvar",
  organisationId: "contact-kelvar",
  role: "Research partner",
  country: "Austria",
  status: "INTERESTED" as const,
  leadId: "contact-jonas",
};

function partners(document: Doc) {
  return document.state.global.partners;
}
function lastError(document: Doc) {
  return document.operations.global.at(-1)?.error;
}
function withPartner(): Doc {
  return reducer(utils.createDocument(), addPartner(KELVAR));
}

describe("the consortium", () => {
  it("sets and clears the coordinator", () => {
    let document = reducer(
      utils.createDocument(),
      setCoordinator({ coordinatorId: "contact-brisa" }),
    );
    expect(document.state.global.coordinatorId).toBe("contact-brisa");
    document = reducer(document, setCoordinator({ coordinatorId: null }));

    expect(document.state.global.coordinatorId).toBeNull();
    document = reducer(document, setCoordinator({}));
    expect(document.state.global.coordinatorId).toBeNull();
  });

  it("adds a partner", () => {
    const document = withPartner();

    expect(lastError(document)).toBeUndefined();
    expect(partners(document)).toStrictEqual([KELVAR]);
  });

  it("adds a partner that is only asked, with nothing else known", () => {
    const document = reducer(
      utils.createDocument(),
      addPartner({ id: "partner-x", organisationId: "contact-brisa" }),
    );

    expect(partners(document)).toStrictEqual([
      {
        id: "partner-x",
        organisationId: "contact-brisa",
        role: null,
        country: null,
        status: "ASKED",
        leadId: null,
      },
    ]);
  });

  it("refuses a repeated partner id", () => {
    const after = reducer(withPartner(), addPartner(KELVAR));

    expect(lastError(after)).toBe("Partner partner-kelvar already exists");
    expect(partners(after)).toHaveLength(1);
  });

  it("updates one field and leaves the others", () => {
    const document = reducer(
      withPartner(),
      updatePartner({ id: "partner-kelvar", status: "SIGNED" }),
    );

    expect(lastError(document)).toBeUndefined();
    expect(partners(document)).toStrictEqual([{ ...KELVAR, status: "SIGNED" }]);
  });

  it("updates every field, clears the optional ones with null, and ignores null for the organisation and status", () => {
    let document = reducer(
      withPartner(),
      updatePartner({
        id: "partner-kelvar",
        organisationId: "contact-other",
        role: "Coordinator",
        country: "Germany",
        status: "COMMITTED",
        leadId: "contact-ines",
      }),
    );
    expect(partners(document)[0]).toStrictEqual({
      id: "partner-kelvar",
      organisationId: "contact-other",
      role: "Coordinator",
      country: "Germany",
      status: "COMMITTED",
      leadId: "contact-ines",
    });
    document = reducer(
      document,
      updatePartner({
        id: "partner-kelvar",
        organisationId: null,
        status: null,
        role: null,
        country: null,
        leadId: null,
      }),
    );

    expect(partners(document)[0]).toStrictEqual({
      id: "partner-kelvar",
      organisationId: "contact-other",
      role: null,
      country: null,
      status: "COMMITTED",
      leadId: null,
    });
  });

  it("refuses to update an unknown partner", () => {
    const after = reducer(
      withPartner(),
      updatePartner({ id: "nope", role: "x" }),
    );

    expect(lastError(after)).toBe("Partner nope not found");
  });

  it("removes a partner, and refuses an unknown one", () => {
    const removed = reducer(
      withPartner(),
      removePartner({ id: "partner-kelvar" }),
    );
    const unknown = reducer(withPartner(), removePartner({ id: "nope" }));

    expect(partners(removed)).toStrictEqual([]);
    expect(lastError(unknown)).toBe("Partner nope not found");
    expect(partners(unknown)).toHaveLength(1);
  });
});
