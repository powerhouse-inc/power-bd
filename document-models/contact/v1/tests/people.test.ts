import {
  addPerson,
  reducer,
  removePerson,
  updatePerson,
  utils,
} from "document-models/contact/v1";
import { describe, expect, it } from "vitest";

/** The error of each operation, in the order they were dispatched. */
function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

const DANA = {
  id: "p1",
  name: "Dana Reyes",
  role: "Head of Research Partnerships",
  email: "dana.reyes@kelvar.example",
  phone: "+00 555 0101",
};
const OMAR = {
  id: "p2",
  name: "Omar Feld",
  role: "Grants Officer",
  email: "omar.feld@kelvar.example",
  phone: "+00 555 0102",
};

/** Kelvar Institute's Dana Reyes (p1) and Omar Feld (p2), as the first two operations. */
function twoPeople() {
  return reducer(
    reducer(utils.createDocument(), addPerson(DANA)),
    addPerson(OMAR),
  );
}

describe("the people at a contact", () => {
  it("adds a person with their role, email and phone", () => {
    const document = reducer(
      utils.createDocument(),
      addPerson({
        id: "p1",
        name: "Dana Reyes",
        role: "Head of Research Partnerships",
        email: "dana.reyes@kelvar.example",
        phone: "+00 555 0101",
      }),
    );

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global.people).toStrictEqual([
      {
        id: "p1",
        name: "Dana Reyes",
        role: "Head of Research Partnerships",
        email: "dana.reyes@kelvar.example",
        phone: "+00 555 0101",
      },
    ]);
  });

  it("adds a person known only by name, after the people already there", () => {
    let document = reducer(
      utils.createDocument(),
      addPerson({ id: "p1", name: "Dana Reyes" }),
    );
    document = reducer(document, addPerson({ id: "p2", name: "Omar Feld" }));

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.people).toStrictEqual([
      { id: "p1", name: "Dana Reyes", role: null, email: null, phone: null },
      { id: "p2", name: "Omar Feld", role: null, email: null, phone: null },
    ]);
  });

  it("stores an empty role, email or phone as none", () => {
    const document = reducer(
      utils.createDocument(),
      addPerson({
        id: "p1",
        name: "Dana Reyes",
        role: "",
        email: "",
        phone: "",
      }),
    );

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global.people).toStrictEqual([
      { id: "p1", name: "Dana Reyes", role: null, email: null, phone: null },
    ]);
  });

  it("clears a detail of a person when it is sent empty", () => {
    let document = reducer(
      utils.createDocument(),
      addPerson({
        id: "p1",
        name: "Dana Reyes",
        role: "Head of Research Partnerships",
        email: "dana.reyes@kelvar.example",
        phone: "+00 555 0101",
      }),
    );
    document = reducer(
      document,
      updatePerson({ id: "p1", role: "", email: "", phone: null }),
    );

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.people).toStrictEqual([
      { id: "p1", name: "Dana Reyes", role: null, email: null, phone: null },
    ]);
  });

  it("changes only the details of a person that are sent", () => {
    let document = reducer(
      twoPeople(),
      updatePerson({ id: "p2", role: "Grants Lead" }),
    );

    expect(document.state.global.people).toStrictEqual([
      DANA,
      {
        id: "p2",
        name: "Omar Feld",
        role: "Grants Lead",
        email: "omar.feld@kelvar.example",
        phone: "+00 555 0102",
      },
    ]);

    document = reducer(
      document,
      updatePerson({
        id: "p1",
        name: "Dana M. Reyes",
        email: "d.reyes@kelvar.example",
        phone: "+00 555 0111",
      }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.people[0]).toStrictEqual({
      id: "p1",
      name: "Dana M. Reyes",
      role: "Head of Research Partnerships",
      email: "d.reyes@kelvar.example",
      phone: "+00 555 0111",
    });
  });

  it("clears a role, email or phone sent as null, but keeps the name, which a person always has", () => {
    const document = reducer(
      twoPeople(),
      updatePerson({
        id: "p1",
        name: null,
        role: null,
        email: null,
        phone: null,
      }),
    );

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.people).toStrictEqual([
      { id: "p1", name: "Dana Reyes", role: null, email: null, phone: null },
      OMAR,
    ]);
  });

  it("refuses to update a person the contact does not have", () => {
    const document = reducer(
      twoPeople(),
      updatePerson({ id: "p9", name: "Nobody" }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      "Person p9 not found",
    ]);
    expect(document.state.global.people).toStrictEqual([DANA, OMAR]);
  });

  it("removes a person, and refuses one the contact does not have", () => {
    let document = reducer(twoPeople(), removePerson({ id: "p1" }));
    document = reducer(document, removePerson({ id: "p1" }));

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      "Person p1 not found",
    ]);
    expect(document.state.global.people).toStrictEqual([OMAR]);
  });
});
