import {
  addAngle,
  approveMessage,
  discardMessage,
  draftMessage,
  markMessageSent,
  reducer,
  reopenMessage,
  updateMessage,
  utils,
} from "document-models/lead/v1";
import { describe, expect, it } from "vitest";

type LeadDocument = ReturnType<typeof utils.createDocument>;

const JONAS = "0x1111111111111111111111111111111111111aaa";
const INES = "0x2222222222222222222222222222222222222bbb";

/** The error of each operation, in the order they were dispatched. */
function errors(document: LeadDocument) {
  return document.operations.global.map((operation) => operation.error);
}

/** A lead with one angle (operation 0), then message-1 drafted by Jonas (operation 1). */
function drafted() {
  const document = reducer(
    utils.createDocument(),
    addAngle({ id: "angle-1", summary: "E-signature", fit: "BEST" }),
  );
  return reducer(
    document,
    draftMessage({
      id: "message-1",
      channel: "EMAIL",
      recipient: { contactId: "contact-ines-varga", personId: "person-1" },
      subject: "Signing in the vault",
      body: "Hello Ines, a short idea.",
      angleId: "angle-1",
      draftedBy: JONAS,
      draftedAt: "2026-11-16T09:00:00.000Z",
    }),
  );
}

function approved() {
  return reducer(
    drafted(),
    approveMessage({
      id: "message-1",
      approvedBy: INES,
      approvedAt: "2026-11-16T10:00:00.000Z",
    }),
  );
}

function sent() {
  return reducer(
    approved(),
    markMessageSent({
      id: "message-1",
      sentBy: INES,
      sentAt: "2026-11-16T11:00:00.000Z",
    }),
  );
}

describe("drafting a message", () => {
  it("drafts a message with its recipient, angle and author", () => {
    const document = drafted();

    expect(errors(document)).toStrictEqual([undefined, undefined]);
    expect(document.state.global.messages).toStrictEqual([
      {
        id: "message-1",
        channel: "EMAIL",
        recipient: { contactId: "contact-ines-varga", personId: "person-1" },
        subject: "Signing in the vault",
        body: "Hello Ines, a short idea.",
        angleId: "angle-1",
        status: "DRAFT",
        draftedBy: JONAS,
        draftedAt: "2026-11-16T09:00:00.000Z",
        approvedBy: null,
        approvedAt: null,
        sentBy: null,
        sentAt: null,
      },
    ]);
  });

  it("drafts a message with only a channel and a body", () => {
    const document = reducer(
      utils.createDocument(),
      draftMessage({
        id: "message-1",
        channel: "LINKEDIN",
        body: "Hi",
        draftedBy: JONAS,
        draftedAt: "2026-11-16T09:00:00.000Z",
      }),
    );

    expect(document.state.global.messages[0]).toMatchObject({
      recipient: null,
      subject: null,
      angleId: null,
      status: "DRAFT",
    });
  });

  it("refuses a message id that is already used, and an angle that is not the lead's", () => {
    let document = reducer(
      drafted(),
      draftMessage({
        id: "message-1",
        channel: "OTHER",
        body: "Again",
        draftedBy: JONAS,
        draftedAt: "2026-11-16T09:00:00.000Z",
      }),
    );
    document = reducer(
      document,
      draftMessage({
        id: "message-2",
        channel: "OTHER",
        body: "Other angle",
        angleId: "angle-9",
        draftedBy: JONAS,
        draftedAt: "2026-11-16T09:00:00.000Z",
      }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      "Message message-1 already exists",
      "Angle angle-9 not found",
    ]);
    expect(document.state.global.messages).toHaveLength(1);
  });
});

describe("updating a draft", () => {
  it("changes what is given, keeps the rest and clears with null", () => {
    let document = reducer(
      drafted(),
      updateMessage({
        id: "message-1",
        channel: "LINKEDIN",
        body: "A better body",
        recipient: { contactId: "contact-jonas-brandt", personId: "person-2" },
      }),
    );

    expect(document.state.global.messages[0]).toMatchObject({
      channel: "LINKEDIN",
      body: "A better body",
      subject: "Signing in the vault",
      angleId: "angle-1",
      recipient: { contactId: "contact-jonas-brandt", personId: "person-2" },
    });

    document = reducer(
      document,
      updateMessage({
        id: "message-1",
        channel: null,
        body: null,
        recipient: null,
        subject: null,
        angleId: null,
      }),
    );

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.messages[0]).toMatchObject({
      channel: "LINKEDIN",
      body: "A better body",
      recipient: null,
      subject: null,
      angleId: null,
    });

    document = reducer(
      document,
      updateMessage({ id: "message-1", subject: "New", angleId: "angle-1" }),
    );
    expect(document.state.global.messages[0]).toMatchObject({
      subject: "New",
      angleId: "angle-1",
    });
  });

  it("refuses an unknown message, an unknown angle and anything but a draft", () => {
    let document = reducer(
      drafted(),
      updateMessage({ id: "message-9", body: "x" }),
    );
    document = reducer(
      document,
      updateMessage({ id: "message-1", angleId: "angle-9" }),
    );
    const afterApproval = reducer(
      approved(),
      updateMessage({ id: "message-1", body: "Changed" }),
    );

    expect(errors(document).slice(2)).toStrictEqual([
      "Message message-9 not found",
      "Angle angle-9 not found",
    ]);
    expect(errors(afterApproval).at(-1)).toBe(
      "Only a draft can be updated or approved",
    );
    expect(afterApproval.state.global.messages[0].body).toBe(
      "Hello Ines, a short idea.",
    );
  });
});

describe("the life of a message", () => {
  it("is approved by a person, with who and when", () => {
    const document = approved();

    expect(errors(document)).toStrictEqual([undefined, undefined, undefined]);
    expect(document.state.global.messages[0]).toMatchObject({
      status: "APPROVED",
      approvedBy: INES,
      approvedAt: "2026-11-16T10:00:00.000Z",
    });
  });

  it("refuses to approve an unknown message or one that is not a draft", () => {
    const input = {
      approvedBy: INES,
      approvedAt: "2026-11-16T10:00:00.000Z",
    };
    const unknown = reducer(
      drafted(),
      approveMessage({ id: "message-9", ...input }),
    );
    const twice = reducer(
      approved(),
      approveMessage({ id: "message-1", ...input }),
    );

    expect(errors(unknown)[2]).toBe("Message message-9 not found");
    expect(errors(twice)[3]).toBe("Only a draft can be updated or approved");
    expect(unknown.state.global.messages[0].status).toBe("DRAFT");
  });

  it("is reopened to a draft, and the approval is cleared", () => {
    const document = reducer(approved(), reopenMessage({ id: "message-1" }));

    expect(errors(document)[3]).toBeUndefined();
    expect(document.state.global.messages[0]).toMatchObject({
      status: "DRAFT",
      approvedBy: null,
      approvedAt: null,
    });
  });

  it("refuses to reopen an unknown message or one that is not approved", () => {
    const unknown = reducer(approved(), reopenMessage({ id: "message-9" }));
    const draft = reducer(drafted(), reopenMessage({ id: "message-1" }));

    expect(errors(unknown)[3]).toBe("Message message-9 not found");
    expect(errors(draft)[2]).toBe(
      "Only an approved message can be reopened or marked sent",
    );
  });

  it("is marked sent by a person, with who and when", () => {
    const document = sent();

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(document.state.global.messages[0]).toMatchObject({
      status: "SENT",
      approvedBy: INES,
      sentBy: INES,
      sentAt: "2026-11-16T11:00:00.000Z",
    });
  });

  it("refuses to mark sent an unknown message, a draft, or a message already sent", () => {
    const input = { sentBy: INES, sentAt: "2026-11-16T11:00:00.000Z" };
    const unknown = reducer(
      approved(),
      markMessageSent({ id: "message-9", ...input }),
    );
    const draft = reducer(
      drafted(),
      markMessageSent({ id: "message-1", ...input }),
    );
    const twice = reducer(
      sent(),
      markMessageSent({ id: "message-1", ...input }),
    );
    const reopenSent = reducer(sent(), reopenMessage({ id: "message-1" }));

    expect(errors(unknown)[3]).toBe("Message message-9 not found");
    expect(errors(draft)[2]).toBe(
      "Only an approved message can be reopened or marked sent",
    );
    expect(errors(twice)[4]).toBe(
      "Only an approved message can be reopened or marked sent",
    );
    expect(errors(reopenSent)[4]).toBe(
      "Only an approved message can be reopened or marked sent",
    );
    expect(twice.state.global.messages[0].status).toBe("SENT");
  });

  it("discards a draft or an approved message", () => {
    const fromDraft = reducer(drafted(), discardMessage({ id: "message-1" }));
    const fromApproved = reducer(
      approved(),
      discardMessage({ id: "message-1" }),
    );

    expect(errors(fromDraft)[2]).toBeUndefined();
    expect(errors(fromApproved)[3]).toBeUndefined();
    expect(fromDraft.state.global.messages[0].status).toBe("DISCARDED");
    expect(fromApproved.state.global.messages[0].status).toBe("DISCARDED");
  });

  it("refuses to discard an unknown message, or one that is sent or discarded", () => {
    const unknown = reducer(drafted(), discardMessage({ id: "message-9" }));
    const afterSent = reducer(sent(), discardMessage({ id: "message-1" }));
    const twice = reducer(
      reducer(drafted(), discardMessage({ id: "message-1" })),
      discardMessage({ id: "message-1" }),
    );
    const update = reducer(
      reducer(drafted(), discardMessage({ id: "message-1" })),
      updateMessage({ id: "message-1", body: "x" }),
    );

    expect(errors(unknown)[2]).toBe("Message message-9 not found");
    expect(errors(afterSent)[4]).toBe("A sent or discarded message is final");
    expect(errors(twice)[3]).toBe("A sent or discarded message is final");
    expect(errors(update)[3]).toBe("Only a draft can be updated or approved");
    expect(afterSent.state.global.messages[0].status).toBe("SENT");
  });
});
