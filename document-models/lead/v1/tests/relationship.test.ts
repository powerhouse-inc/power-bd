import {
  addConfidentialItem,
  addInteraction,
  addNextStep,
  addReference,
  completeNextStep,
  linkContact,
  reducer,
  removeConfidentialItem,
  removeInteraction,
  removeNextStep,
  removeReference,
  reopenNextStep,
  unlinkContact,
  updateInteraction,
  updateNextStep,
  utils,
  setInteractionOutcome,
  setContactLinkDealRole,
} from "document-models/lead/v1";
import { describe, expect, it } from "vitest";

type LeadDocument = ReturnType<typeof utils.createDocument>;

const JONAS = "0x1111111111111111111111111111111111111aaa";
const INES = "0x2222222222222222222222222222222222222bbb";

/** The error of each operation, in the order they were dispatched. */
function errors(document: LeadDocument) {
  return document.operations.global.map((operation) => operation.error);
}

function withStep() {
  return reducer(
    utils.createDocument(),
    addNextStep({
      id: "step-1",
      text: "Send the one-page overview",
      owner: JONAS,
      dueDate: "2026-11-20T00:00:00.000Z",
    }),
  );
}

describe("next steps", () => {
  it("adds an open next step, with or without an owner and a due date", () => {
    const document = reducer(
      withStep(),
      addNextStep({ id: "step-2", text: "Ask about their budget cycle" }),
    );

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.nextSteps).toStrictEqual([
      {
        id: "step-1",
        text: "Send the one-page overview",
        owner: JONAS,
        dueDate: "2026-11-20T00:00:00.000Z",
        doneAt: null,
      },
      {
        id: "step-2",
        text: "Ask about their budget cycle",
        owner: null,
        dueDate: null,
        doneAt: null,
      },
    ]);
  });

  it("refuses a next step whose id is used", () => {
    const document = reducer(
      withStep(),
      addNextStep({ id: "step-1", text: "Again" }),
    );

    expect(errors(document)[1]).toBe("NextStep step-1 already exists");
    expect(document.state.global.nextSteps).toHaveLength(1);
  });

  it("updates what is given, keeps the rest, and clears owner and due date with null", () => {
    let document = reducer(
      withStep(),
      updateNextStep({
        id: "step-1",
        text: "Send the two-page overview",
        owner: INES,
      }),
    );
    document = reducer(
      document,
      updateNextStep({ id: "step-1", dueDate: "2026-11-27T00:00:00.000Z" }),
    );

    expect(document.state.global.nextSteps[0]).toMatchObject({
      text: "Send the two-page overview",
      owner: INES,
      dueDate: "2026-11-27T00:00:00.000Z",
    });

    document = reducer(
      document,
      updateNextStep({ id: "step-1", text: null, owner: null, dueDate: null }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.nextSteps[0]).toMatchObject({
      text: "Send the two-page overview",
      owner: null,
      dueDate: null,
    });
  });

  it("completes a next step once, reopens it, and can complete it again", () => {
    let document = reducer(
      withStep(),
      completeNextStep({ id: "step-1", doneAt: "2026-11-18T08:00:00.000Z" }),
    );
    expect(document.state.global.nextSteps[0].doneAt).toBe(
      "2026-11-18T08:00:00.000Z",
    );

    document = reducer(
      document,
      completeNextStep({ id: "step-1", doneAt: "2026-11-19T08:00:00.000Z" }),
    );
    expect(errors(document)[2]).toBe("NextStep step-1 is already done");
    expect(document.state.global.nextSteps[0].doneAt).toBe(
      "2026-11-18T08:00:00.000Z",
    );

    document = reducer(document, reopenNextStep({ id: "step-1" }));
    expect(document.state.global.nextSteps[0].doneAt).toBeNull();

    document = reducer(
      document,
      completeNextStep({ id: "step-1", doneAt: "2026-11-19T08:00:00.000Z" }),
    );
    expect(errors(document).slice(3)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.nextSteps[0].doneAt).toBe(
      "2026-11-19T08:00:00.000Z",
    );
  });

  it("refuses to reopen a next step that is not done", () => {
    const document = reducer(withStep(), reopenNextStep({ id: "step-1" }));

    expect(errors(document)[1]).toBe("NextStep step-1 is not done");
  });

  it("removes a next step", () => {
    const document = reducer(withStep(), removeNextStep({ id: "step-1" }));

    expect(errors(document)[1]).toBeUndefined();
    expect(document.state.global.nextSteps).toStrictEqual([]);
  });

  it("refuses to update, complete, reopen or remove an unknown next step", () => {
    let document = utils.createDocument();
    document = reducer(document, updateNextStep({ id: "step-9", text: "x" }));
    document = reducer(
      document,
      completeNextStep({ id: "step-9", doneAt: "2026-11-18T08:00:00.000Z" }),
    );
    document = reducer(document, reopenNextStep({ id: "step-9" }));
    document = reducer(document, removeNextStep({ id: "step-9" }));

    expect(errors(document)).toStrictEqual(
      Array(4).fill("NextStep step-9 not found"),
    );
  });
});

function withMeeting() {
  return reducer(
    utils.createDocument(),
    addInteraction({
      id: "interaction-1",
      kind: "MEETING",
      status: "SCHEDULED",
      at: "2026-11-24T14:00:00.000Z",
      timeZone: "Europe/Zurich",
      summary: "Intro call with Ines",
      people: [{ contactId: "contact-ines-varga", personId: "person-1" }],
      teamMembers: [JONAS],
      notesSource: { id: "vault-note-1", title: "Call notes" },
    }),
  );
}

describe("interactions", () => {
  it("adds a meeting with its people, team and notes", () => {
    const document = withMeeting();

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global.interactions).toStrictEqual([
      {
        id: "interaction-1",
        kind: "MEETING",
        status: "SCHEDULED",
        at: "2026-11-24T14:00:00.000Z",
        timeZone: "Europe/Zurich",
        summary: "Intro call with Ines",
        people: [{ contactId: "contact-ines-varga", personId: "person-1" }],
        teamMembers: [JONAS],
        notesSource: { id: "vault-note-1", title: "Call notes" },
        outcome: null,
      },
    ]);
  });

  it("adds an email with only a kind and a status", () => {
    const document = reducer(
      utils.createDocument(),
      addInteraction({ id: "interaction-2", kind: "EMAIL", status: "HELD" }),
    );

    expect(document.state.global.interactions[0]).toStrictEqual({
      id: "interaction-2",
      kind: "EMAIL",
      status: "HELD",
      at: null,
      timeZone: null,
      summary: null,
      people: [],
      teamMembers: [],
      notesSource: null,
      outcome: null,
    });
  });

  it("refuses an interaction whose id is used", () => {
    const document = reducer(
      withMeeting(),
      addInteraction({ id: "interaction-1", kind: "CALL", status: "HELD" }),
    );

    expect(errors(document)[1]).toBe(
      "Interaction interaction-1 already exists",
    );
    expect(document.state.global.interactions).toHaveLength(1);
  });

  it("refuses a scheduled or held meeting without an instant or a time zone, and accepts a cancelled one", () => {
    let document = utils.createDocument();
    document = reducer(
      document,
      addInteraction({
        id: "i-1",
        kind: "MEETING",
        status: "SCHEDULED",
        timeZone: "UTC",
      }),
    );
    document = reducer(
      document,
      addInteraction({
        id: "i-2",
        kind: "MEETING",
        status: "HELD",
        at: "2026-11-24T14:00:00.000Z",
      }),
    );
    document = reducer(
      document,
      addInteraction({ id: "i-3", kind: "MEETING", status: "CANCELLED" }),
    );

    expect(errors(document)).toStrictEqual([
      "A scheduled or held meeting needs an instant and a time zone",
      "A scheduled or held meeting needs an instant and a time zone",
      undefined,
    ]);
    expect(document.state.global.interactions.map((i) => i.id)).toStrictEqual([
      "i-3",
    ]);
  });

  it("refuses a time zone that is not a well-formed name, on any kind of interaction", () => {
    let document = utils.createDocument();
    for (const timeZone of ["Zurich", "GMT+1", "Europe/"]) {
      document = reducer(
        document,
        addInteraction({ id: "i-1", kind: "CALL", status: "HELD", timeZone }),
      );
    }
    document = reducer(
      document,
      addInteraction({
        id: "i-2",
        kind: "EMAIL",
        status: "HELD",
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    );

    expect(errors(document)).toStrictEqual([
      '"Zurich" is not a time zone name such as Europe/Zurich',
      '"GMT+1" is not a time zone name such as Europe/Zurich',
      '"Europe/" is not a time zone name such as Europe/Zurich',
      undefined,
    ]);
  });

  it("updates what is given, keeps the rest, and clears with null", () => {
    let document = reducer(
      withMeeting(),
      updateInteraction({
        id: "interaction-1",
        status: "HELD",
        summary: "Intro call went well",
        people: [{ contactId: "contact-jonas-brandt", personId: "person-2" }],
        teamMembers: [JONAS, INES],
        notesSource: { id: "vault-note-2", title: "Better notes" },
      }),
    );

    expect(document.state.global.interactions[0]).toStrictEqual({
      id: "interaction-1",
      kind: "MEETING",
      status: "HELD",
      at: "2026-11-24T14:00:00.000Z",
      timeZone: "Europe/Zurich",
      summary: "Intro call went well",
      people: [{ contactId: "contact-jonas-brandt", personId: "person-2" }],
      teamMembers: [JONAS, INES],
      notesSource: { id: "vault-note-2", title: "Better notes" },
      outcome: null,
    });

    document = reducer(
      document,
      updateInteraction({
        id: "interaction-1",
        kind: "CALL",
        at: null,
        timeZone: null,
        summary: null,
        notesSource: null,
        people: null,
        teamMembers: null,
        status: null,
      }),
    );

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.interactions[0]).toStrictEqual({
      id: "interaction-1",
      kind: "CALL",
      status: "HELD",
      at: null,
      timeZone: null,
      summary: null,
      people: [{ contactId: "contact-jonas-brandt", personId: "person-2" }],
      teamMembers: [JONAS, INES],
      notesSource: null,
      outcome: null,
    });

    document = reducer(
      document,
      updateInteraction({
        id: "interaction-1",
        at: "2026-11-25T10:00:00.000Z",
        timeZone: "UTC",
      }),
    );
    expect(document.state.global.interactions[0]).toMatchObject({
      at: "2026-11-25T10:00:00.000Z",
      timeZone: "UTC",
    });
  });

  it("checks the meeting rule on the interaction as it would be after the update", () => {
    let document = reducer(
      withMeeting(),
      updateInteraction({ id: "interaction-1", at: null }),
    );
    document = reducer(
      document,
      updateInteraction({ id: "interaction-1", timeZone: null }),
    );
    document = reducer(
      document,
      updateInteraction({
        id: "interaction-1",
        status: "CANCELLED",
        at: null,
        timeZone: null,
      }),
    );
    document = reducer(
      document,
      updateInteraction({ id: "interaction-1", status: "HELD" }),
    );
    document = reducer(
      document,
      updateInteraction({ id: "interaction-1", timeZone: "Zurich" }),
    );

    expect(errors(document).slice(1)).toStrictEqual([
      "A scheduled or held meeting needs an instant and a time zone",
      "A scheduled or held meeting needs an instant and a time zone",
      undefined,
      "A scheduled or held meeting needs an instant and a time zone",
      '"Zurich" is not a time zone name such as Europe/Zurich',
    ]);
    expect(document.state.global.interactions[0]).toMatchObject({
      status: "CANCELLED",
      at: null,
      timeZone: null,
    });
  });

  it("refuses to update or remove an unknown interaction, and removes a known one", () => {
    let document = reducer(
      withMeeting(),
      updateInteraction({ id: "interaction-9", summary: "x" }),
    );
    document = reducer(document, removeInteraction({ id: "interaction-9" }));
    document = reducer(document, removeInteraction({ id: "interaction-1" }));

    expect(errors(document).slice(1)).toStrictEqual([
      "Interaction interaction-9 not found",
      "Interaction interaction-9 not found",
      undefined,
    ]);
    expect(document.state.global.interactions).toStrictEqual([]);
  });
});

describe("contact links", () => {
  it("links a person at a contact, or the contact as a whole, and unlinks", () => {
    let document = reducer(
      utils.createDocument(),
      linkContact({
        id: "link-1",
        contactId: "contact-brisa-labs",
        personId: "person-1",
        role: "Sponsor",
      }),
    );
    document = reducer(
      document,
      linkContact({ id: "link-2", contactId: "contact-kelvar-institute" }),
    );

    expect(document.state.global.contactLinks).toStrictEqual([
      {
        id: "link-1",
        contactId: "contact-brisa-labs",
        personId: "person-1",
        role: "Sponsor",
        dealRole: null,
      },
      {
        id: "link-2",
        contactId: "contact-kelvar-institute",
        personId: null,
        role: null,
        dealRole: null,
      },
    ]);

    document = reducer(document, unlinkContact({ id: "link-1" }));

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.contactLinks.map((l) => l.id)).toStrictEqual([
      "link-2",
    ]);
  });

  it("refuses a link id that is used, and unlinking an unknown link", () => {
    let document = reducer(
      utils.createDocument(),
      linkContact({ id: "link-1", contactId: "contact-brisa-labs" }),
    );
    document = reducer(
      document,
      linkContact({ id: "link-1", contactId: "contact-other" }),
    );
    document = reducer(document, unlinkContact({ id: "link-9" }));

    expect(errors(document).slice(1)).toStrictEqual([
      "ContactLink link-1 already exists",
      "ContactLink link-9 not found",
    ]);
    expect(document.state.global.contactLinks).toHaveLength(1);
  });
});

describe("references", () => {
  function withReference() {
    return reducer(
      utils.createDocument(),
      addReference({
        id: "ref-1",
        kind: "RESEARCH",
        documentId: "vault-note-7",
        title: "Brisa Labs market note",
      }),
    );
  }

  it("adds a reference, allows the same document under another kind, and removes one", () => {
    let document = reducer(
      withReference(),
      addReference({
        id: "ref-2",
        kind: "NOTE",
        documentId: "vault-note-7",
        title: "Same note",
      }),
    );

    expect(document.state.global.references).toStrictEqual([
      {
        id: "ref-1",
        kind: "RESEARCH",
        documentId: "vault-note-7",
        title: "Brisa Labs market note",
      },
      {
        id: "ref-2",
        kind: "NOTE",
        documentId: "vault-note-7",
        title: "Same note",
      },
    ]);

    document = reducer(document, removeReference({ id: "ref-1" }));

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.references.map((r) => r.id)).toStrictEqual([
      "ref-2",
    ]);
  });

  it("refuses a reference id that is used, and the same document with the same kind", () => {
    let document = reducer(
      withReference(),
      addReference({
        id: "ref-1",
        kind: "SOURCE",
        documentId: "vault-note-8",
        title: "x",
      }),
    );
    document = reducer(
      document,
      addReference({
        id: "ref-2",
        kind: "RESEARCH",
        documentId: "vault-note-7",
        title: "Again",
      }),
    );

    expect(errors(document).slice(1)).toStrictEqual([
      "Reference ref-1 already exists",
      '"Brisa Labs market note" is already linked.',
    ]);
    expect(document.state.global.references).toHaveLength(1);
  });

  it("refuses to remove an unknown reference", () => {
    const document = reducer(withReference(), removeReference({ id: "ref-9" }));

    expect(errors(document)[1]).toBe("Reference ref-9 not found");
  });
});

describe("confidential items", () => {
  const item = {
    id: "secret-1",
    subjectContactId: "contact-ines-varga",
    text: "Prefers not to be copied on pricing",
    addedBy: JONAS,
    addedAt: "2026-11-16T09:00:00.000Z",
  };

  it("adds an item, with or without a subject, and removes one", () => {
    let document = reducer(utils.createDocument(), addConfidentialItem(item));
    document = reducer(
      document,
      addConfidentialItem({
        id: "secret-2",
        text: "Budget is tight",
        addedBy: INES,
        addedAt: "2026-11-16T10:00:00.000Z",
      }),
    );

    expect(document.state.global.confidentialItems).toStrictEqual([
      item,
      {
        id: "secret-2",
        subjectContactId: null,
        text: "Budget is tight",
        addedBy: INES,
        addedAt: "2026-11-16T10:00:00.000Z",
      },
    ]);

    document = reducer(document, removeConfidentialItem({ id: "secret-1" }));

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(
      document.state.global.confidentialItems.map((i) => i.id),
    ).toStrictEqual(["secret-2"]);
  });

  it("refuses an item id that is used, and removing an unknown item", () => {
    let document = reducer(utils.createDocument(), addConfidentialItem(item));
    document = reducer(document, addConfidentialItem(item));
    document = reducer(document, removeConfidentialItem({ id: "secret-9" }));

    expect(errors(document).slice(1)).toStrictEqual([
      "ConfidentialItem secret-1 already exists",
      "ConfidentialItem secret-9 not found",
    ]);
    expect(document.state.global.confidentialItems).toHaveLength(1);
  });
});

const lastError = (doc: ReturnType<typeof utils.createDocument>) => doc.operations.global.at(-1)?.error;

describe("how an interaction went", () => {
  const held = addInteraction({ id: "i1", kind: "CALL", status: "HELD", at: "2026-11-10T09:00:00.000Z", timeZone: "Europe/Ljubljana" });
  const planned = addInteraction({ id: "i2", kind: "MEETING", status: "SCHEDULED", at: "2026-12-01T09:00:00.000Z", timeZone: "Europe/Ljubljana" });

  it("starts without an outcome, records one for a held interaction, and clears it", () => {
    let doc = reducer(utils.createDocument(), held);
    expect(doc.state.global.interactions[0].outcome).toBeNull();
    doc = reducer(doc, setInteractionOutcome({ id: "i1", outcome: "POSITIVE" }));
    expect(lastError(doc)).toBeUndefined();
    expect(doc.state.global.interactions[0].outcome).toBe("POSITIVE");
    doc = reducer(doc, setInteractionOutcome({ id: "i1", outcome: null }));
    expect(doc.state.global.interactions[0].outcome).toBeNull();
  });

  it("refuses an outcome for an interaction not held yet, but lets one be cleared", () => {
    let doc = reducer(utils.createDocument(), planned);
    doc = reducer(doc, setInteractionOutcome({ id: "i2", outcome: "NEGATIVE" }));
    expect(lastError(doc)).toBe("Only a held interaction has an outcome");
    expect(doc.state.global.interactions[0].outcome).toBeNull();
    doc = reducer(doc, setInteractionOutcome({ id: "i2", outcome: null }));
    expect(lastError(doc)).toBeUndefined();
  });

  it("refuses an interaction that is not there", () => {
    const doc = reducer(utils.createDocument(), setInteractionOutcome({ id: "nope", outcome: "NEUTRAL" }));
    expect(lastError(doc)).toBe("Interaction nope not found");
  });

  it("records an outcome on an interaction stored before outcomes existed", () => {
    const before = reducer(utils.createDocument(), held).state.global;
    const { outcome: _outcome, ...old } = before.interactions[0];
    const doc = reducer(
      utils.createDocument({ global: { ...before, interactions: [old] } as never }),
      setInteractionOutcome({ id: "i1", outcome: "NEUTRAL" }),
    );
    expect(doc.state.global.interactions[0].outcome).toBe("NEUTRAL");
  });
});

describe("roles in the deal", () => {
  it("starts without a role, gives a linked person one, and clears it", () => {
    let doc = reducer(utils.createDocument(), linkContact({ id: "l1", contactId: "c1", personId: "p1" }));
    expect(doc.state.global.contactLinks[0].dealRole).toBeNull();
    doc = reducer(doc, setContactLinkDealRole({ id: "l1", dealRole: "DECISION_MAKER" }));
    expect(lastError(doc)).toBeUndefined();
    expect(doc.state.global.contactLinks[0].dealRole).toBe("DECISION_MAKER");
    doc = reducer(doc, setContactLinkDealRole({ id: "l1", dealRole: null }));
    expect(doc.state.global.contactLinks[0].dealRole).toBeNull();
  });

  it("refuses a link that is not there", () => {
    const doc = reducer(utils.createDocument(), setContactLinkDealRole({ id: "nope", dealRole: "CHAMPION" }));
    expect(lastError(doc)).toBe("ContactLink nope not found");
  });
});
