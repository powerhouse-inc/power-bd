import {
  addTag,
  reducer,
  removeTag,
  setAddress,
  setProfile,
  utils,
} from "document-models/contact/v1";
import { describe, expect, it } from "vitest";

/** The error of each operation, in the order they were dispatched. */
function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

/** Brisa Labs with every profile field filled, as the first operation. */
function brisaLabs() {
  return reducer(
    utils.createDocument(),
    setProfile({
      name: "Brisa Labs",
      kind: "CUSTOMER",
      email: "hello@brisalabs.example",
      phone: "+00 555 0100",
      website: "https://brisalabs.example",
      vatId: "XX 000 000 001",
      registrationNumber: "REG-0001",
      notes: "Asked about an e-signature rollout.",
    }),
  );
}

/** Brisa Labs' office, with every part of the address filled. */
const LISBON_OFFICE = {
  street: "Dock 4, Brisa Works",
  postalCode: "1000-001",
  city: "Lisbon",
  country: "Portugal",
};

describe("a contact's profile", () => {
  it("starts as an active contact of kind OTHER, holding nothing a bookkeeper needs", () => {
    expect(utils.createDocument().state.global).toStrictEqual({
      name: null,
      kind: "OTHER",
      status: "ACTIVE",
      email: null,
      phone: null,
      website: null,
      vatId: null,
      registrationNumber: null,
      address: { street: null, postalCode: null, city: null, country: null },
      tags: [],
      people: [],
      notes: null,
    });
  });

  it("records an organisation's name, kind, contact details and notes", () => {
    const document = brisaLabs();

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global).toStrictEqual({
      name: "Brisa Labs",
      kind: "CUSTOMER",
      status: "ACTIVE",
      email: "hello@brisalabs.example",
      phone: "+00 555 0100",
      website: "https://brisalabs.example",
      vatId: "XX 000 000 001",
      registrationNumber: "REG-0001",
      address: { street: null, postalCode: null, city: null, country: null },
      tags: [],
      people: [],
      notes: "Asked about an e-signature rollout.",
    });
  });

  it("changes only the profile fields that are sent", () => {
    let document = reducer(brisaLabs(), setProfile({ phone: "+00 555 0199" }));

    expect(document.state.global).toMatchObject({
      name: "Brisa Labs",
      kind: "CUSTOMER",
      email: "hello@brisalabs.example",
      phone: "+00 555 0199",
      website: "https://brisalabs.example",
      vatId: "XX 000 000 001",
      registrationNumber: "REG-0001",
      notes: "Asked about an e-signature rollout.",
    });

    document = reducer(
      document,
      setProfile({ notes: "Rollout starts in March." }),
    );

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global).toMatchObject({
      phone: "+00 555 0199",
      notes: "Rollout starts in March.",
    });
  });

  it("clears a profile field sent as null, except the kind, which a contact always has", () => {
    const document = reducer(
      brisaLabs(),
      setProfile({
        name: null,
        kind: null,
        email: null,
        phone: null,
        website: null,
        vatId: null,
        registrationNumber: null,
        notes: null,
      }),
    );

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global).toMatchObject({
      name: null,
      kind: "CUSTOMER",
      email: null,
      phone: null,
      website: null,
      vatId: null,
      registrationNumber: null,
      notes: null,
    });
  });

  it("records where the organisation is", () => {
    const document = reducer(utils.createDocument(), setAddress(LISBON_OFFICE));

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global.address).toStrictEqual({
      street: "Dock 4, Brisa Works",
      postalCode: "1000-001",
      city: "Lisbon",
      country: "Portugal",
    });
  });

  it("replaces the whole address, clearing every part that is not sent", () => {
    let document = reducer(utils.createDocument(), setAddress(LISBON_OFFICE));
    document = reducer(document, setAddress({ country: "Spain" }));

    expect(document.state.global.address).toStrictEqual({
      street: null,
      postalCode: null,
      city: null,
      country: "Spain",
    });

    document = reducer(document, setAddress({}));

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.address).toStrictEqual({
      street: null,
      postalCode: null,
      city: null,
      country: null,
    });
  });

  it("adds tags in the order given, without the spaces around them", () => {
    let document = reducer(
      utils.createDocument(),
      addTag({ tag: "e-signature" }),
    );
    document = reducer(document, addTag({ tag: "  priority " }));

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.tags).toStrictEqual([
      "e-signature",
      "priority",
    ]);
  });

  it("refuses a tag with no text", () => {
    let document = reducer(utils.createDocument(), addTag({ tag: "priority" }));
    document = reducer(document, addTag({ tag: "" }));
    document = reducer(document, addTag({ tag: "   " }));

    expect(errors(document)).toStrictEqual([
      undefined,
      "A tag needs text",
      "A tag needs text",
    ]);
    expect(document.state.global.tags).toStrictEqual(["priority"]);
  });

  it("refuses a tag the contact already has, with or without spaces around it", () => {
    let document = reducer(utils.createDocument(), addTag({ tag: "priority" }));
    document = reducer(document, addTag({ tag: "priority" }));
    document = reducer(document, addTag({ tag: " priority " }));

    expect(errors(document)).toStrictEqual([
      undefined,
      "Tag priority exists",
      "Tag priority exists",
    ]);
    expect(document.state.global.tags).toStrictEqual(["priority"]);
  });

  it("removes a tag and keeps the others in their order", () => {
    let document = utils.createDocument();
    for (const tag of ["e-signature", "priority", "fintech"]) {
      document = reducer(document, addTag({ tag }));
    }
    document = reducer(document, removeTag({ tag: "priority" }));

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.tags).toStrictEqual([
      "e-signature",
      "fintech",
    ]);
  });

  it("refuses to remove a tag the contact does not have", () => {
    let document = reducer(utils.createDocument(), addTag({ tag: "priority" }));
    document = reducer(document, removeTag({ tag: "grants" }));

    expect(errors(document)).toStrictEqual([undefined, "Tag grants not found"]);
    expect(document.state.global.tags).toStrictEqual(["priority"]);
  });
});
