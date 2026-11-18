import {
  addTeamMember,
  deactivateTeamMember,
  reactivateTeamMember,
  reducer,
  updateTeamMember,
  utils,
} from "document-models/bd-settings/v1";
import { describe, expect, it } from "vitest";

const JONAS = "0x1111111111111111111111111111111111111aaa";
const JONAS_UPPER = "0x1111111111111111111111111111111111111AAA";
const INES = "0x2222222222222222222222222222222222222bbb";
const MIRA = "0x3333333333333333333333333333333333333ccc";

/** Jonas (m1) and Ines (m2), as the first two operations. */
function teamOfTwo() {
  const document = reducer(
    utils.createDocument(),
    addTeamMember({ id: "m1", name: "Jonas Brandt", address: JONAS }),
  );
  return reducer(
    document,
    addTeamMember({ id: "m2", name: "Ines Varga", address: INES }),
  );
}

describe("the team list", () => {
  it("adds a member, active from the start", () => {
    const document = reducer(
      utils.createDocument(),
      addTeamMember({ id: "m1", name: "Jonas Brandt", address: JONAS }),
    );

    expect(document.operations.global[0].error).toBeUndefined();
    expect(document.state.global.teamMembers).toStrictEqual([
      { id: "m1", name: "Jonas Brandt", address: JONAS, active: true, email: null },
    ]);
  });

  it("refuses a second member with the same id, the same address or no name", () => {
    let document = reducer(
      utils.createDocument(),
      addTeamMember({ id: "m1", name: "Jonas Brandt", address: JONAS }),
    );
    document = reducer(
      document,
      addTeamMember({ id: "m1", name: "Ines Varga", address: INES }),
    );
    document = reducer(
      document,
      // The same address in another letter case is still the same address.
      addTeamMember({ id: "m2", name: "Ines Varga", address: JONAS_UPPER }),
    );
    document = reducer(
      document,
      addTeamMember({ id: "m3", name: "   ", address: INES }),
    );

    expect(
      document.operations.global.map((operation) => operation.error),
    ).toStrictEqual([
      undefined,
      "Team member m1 already exists",
      `Another team member already has the address ${JONAS_UPPER}`,
      "A team member needs a name",
    ]);
    expect(document.state.global.teamMembers).toHaveLength(1);
  });

  it("changes a member's name or address, one field at a time", () => {
    let document = teamOfTwo();
    document = reducer(
      document,
      updateTeamMember({ id: "m1", name: "Jonas B." }),
    );
    document = reducer(document, updateTeamMember({ id: "m1", address: MIRA }));

    expect(
      document.operations.global.slice(2).map((operation) => operation.error),
    ).toStrictEqual([undefined, undefined]);
    expect(document.state.global.teamMembers[0]).toStrictEqual({
      id: "m1",
      name: "Jonas B.",
      address: MIRA,
      active: true,
      email: null,
    });
  });

  it("refuses to update an unknown member, to take another member's address or to blank a name", () => {
    let document = teamOfTwo();
    document = reducer(
      document,
      updateTeamMember({ id: "m9", name: "Nobody" }),
    );
    document = reducer(document, updateTeamMember({ id: "m1", address: INES }));
    document = reducer(document, updateTeamMember({ id: "m1", name: "" }));
    // A member may keep their own address.
    document = reducer(
      document,
      updateTeamMember({ id: "m1", address: JONAS_UPPER }),
    );

    expect(
      document.operations.global.slice(2).map((operation) => operation.error),
    ).toStrictEqual([
      "Team member m9 not found",
      `Another team member already has the address ${INES}`,
      "A team member needs a name",
      undefined,
    ]);
    expect(document.state.global.teamMembers[0].name).toBe("Jonas Brandt");
    expect(document.state.global.teamMembers[0].address).toBe(JONAS_UPPER);
  });

  it("deactivates a member without removing them, and brings them back", () => {
    let document = teamOfTwo();
    document = reducer(document, deactivateTeamMember({ id: "m1" }));

    expect(document.state.global.teamMembers).toHaveLength(2);
    expect(document.state.global.teamMembers[0]).toMatchObject({
      name: "Jonas Brandt",
      active: false,
    });

    document = reducer(document, reactivateTeamMember({ id: "m1" }));

    expect(document.state.global.teamMembers[0].active).toBe(true);
    expect(
      document.operations.global.slice(2).map((operation) => operation.error),
    ).toStrictEqual([undefined, undefined]);
  });

  it("refuses to deactivate or reactivate an unknown member", () => {
    let document = teamOfTwo();
    document = reducer(document, deactivateTeamMember({ id: "m9" }));
    document = reducer(document, reactivateTeamMember({ id: "m9" }));

    expect(
      document.operations.global.slice(2).map((operation) => operation.error),
    ).toStrictEqual(["Team member m9 not found", "Team member m9 not found"]);
  });
});

describe("a member's email, for the daily digest", () => {
  const ADA = "0x1111111111111111111111111111111111111111";
  it("keeps the email given when adding, changes it, keeps it when left out, and clears it", () => {
    let doc = reducer(utils.createDocument(), addTeamMember({ id: "m1", name: "Ada", address: ADA, email: "ada@example.org" }));
    expect(doc.state.global.teamMembers[0].email).toBe("ada@example.org");
    doc = reducer(doc, updateTeamMember({ id: "m1", email: "ada@powerhouse.example" }));
    expect(doc.state.global.teamMembers[0].email).toBe("ada@powerhouse.example");
    doc = reducer(doc, updateTeamMember({ id: "m1", name: "Ada L." }));
    expect(doc.state.global.teamMembers[0].email).toBe("ada@powerhouse.example");
    doc = reducer(doc, updateTeamMember({ id: "m1", email: null }));
    expect(doc.state.global.teamMembers[0].email).toBeNull();
    doc = reducer(doc, addTeamMember({ id: "m2", name: "Bo", address: "0x2222222222222222222222222222222222222222" }));
    expect(doc.state.global.teamMembers[1].email).toBeNull();
  });
});
