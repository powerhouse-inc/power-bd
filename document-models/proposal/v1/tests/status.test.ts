import {
  addOption,
  addPackage,
  approveProposal,
  markProposalSent,
  recordProposalAnswer,
  reducer,
  reopenProposal,
  setProposalDetails,
  setProposalParties,
  setSentCopy,
  setSignedCopy,
  supersedeProposal,
  utils,
  withdrawProposal,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import {
  accepted,
  approved,
  declined,
  errors,
  FILE_A,
  FILE_B,
  INES,
  JONAS,
  lastError,
  readyDraft,
  sent,
  T0,
  T1,
  T2,
} from "./fixtures.js";

const APPROVE = { approvedBy: JONAS, approvedAt: T0 };

describe("approving a proposal", () => {
  it("approves a draft that has a lead, a contracting entity, a currency and a valid-until date", () => {
    const document = reducer(readyDraft(), approveProposal(APPROVE));
    expect(lastError(document)).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: "APPROVED",
      approvedBy: JONAS,
      approvedAt: T0,
    });
  });

  it("refuses a draft that lacks one of the four, naming which", () => {
    const cases: [string, ReturnType<typeof reducer>, string][] = [
      [
        "lead",
        reducer(readyDraft(), setProposalParties({ leadId: null })),
        "Approval needs a lead",
      ],
      [
        "entity",
        reducer(readyDraft(), setProposalParties({ contractingEntity: null })),
        "Approval needs a contracting entity",
      ],
      [
        "currency",
        reducer(readyDraft(), setProposalDetails({ currency: null })),
        "Approval needs a currency",
      ],
      [
        "date",
        reducer(readyDraft(), setProposalDetails({ validUntil: null })),
        "Approval needs a valid-until date",
      ],
    ];
    for (const [, before, message] of cases) {
      const after = reducer(before, approveProposal(APPROVE));
      expect(lastError(after)).toBe(message);
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses to approve a proposal that is not a draft", () => {
    for (const make of [approved, sent, accepted]) {
      const before = make();
      const after = reducer(before, approveProposal(APPROVE));
      expect(lastError(after)).toBe("Only a draft proposal can be approved");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });
});

describe("reopening a proposal", () => {
  it("returns an approved proposal to draft and clears the approval", () => {
    const document = reducer(approved(), reopenProposal({}));
    expect(lastError(document)).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: "DRAFT",
      approvedBy: null,
      approvedAt: null,
    });
  });

  it("lets a reopened proposal be edited again", () => {
    let document = reducer(approved(), reopenProposal({}));
    document = reducer(document, setProposalDetails({ title: "Revised" }));
    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.title).toBe("Revised");
  });

  it("refuses to reopen a draft or a sent proposal", () => {
    for (const make of [readyDraft, sent]) {
      const before = make();
      const after = reducer(before, reopenProposal({}));
      expect(lastError(after)).toBe(
        "Only an approved proposal can be reopened",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });
});

describe("marking a proposal sent", () => {
  it("records who sent it and when, without a copy", () => {
    const document = reducer(
      approved(),
      markProposalSent({ sentBy: INES, sentAt: T1 }),
    );
    expect(lastError(document)).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: "SENT",
      sentBy: INES,
      sentAt: T1,
      sentCopy: null,
    });
  });

  it("keeps the copy that was sent when one is given", () => {
    const document = reducer(
      approved(),
      markProposalSent({
        sentBy: JONAS,
        sentAt: T1,
        copy: { ref: FILE_A, name: "proposal-v1.pdf", type: "application/pdf" },
      }),
    );
    expect(document.state.global.sentCopy).toStrictEqual({
      ref: FILE_A,
      name: "proposal-v1.pdf",
      type: "application/pdf",
    });
  });

  it("refuses a proposal that is not approved", () => {
    for (const make of [readyDraft, sent]) {
      const before = make();
      const after = reducer(
        before,
        markProposalSent({ sentBy: JONAS, sentAt: T1 }),
      );
      expect(lastError(after)).toBe(
        "Only an approved proposal can be marked sent",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses a copy without a name or a type, and stays approved", () => {
    const before = approved();
    const noName = reducer(
      before,
      markProposalSent({
        sentBy: JONAS,
        sentAt: T1,
        copy: { ref: FILE_A, name: "  ", type: "application/pdf" },
      }),
    );
    const noType = reducer(
      before,
      markProposalSent({
        sentBy: JONAS,
        sentAt: T1,
        copy: { ref: FILE_A, name: "proposal.pdf", type: "" },
      }),
    );
    expect(lastError(noName)).toBe("A file needs a name");
    expect(lastError(noType)).toBe("A file needs a type");
    expect(noName.state.global).toStrictEqual(before.state.global);
    expect(noType.state.global).toStrictEqual(before.state.global);
  });
});

describe("the copy that was sent", () => {
  const PDF = { ref: FILE_A, name: "proposal-v1.pdf", type: "application/pdf" };

  it("is set, replaced and cleared while the proposal is sent, accepted or declined", () => {
    for (const make of [sent, accepted, declined]) {
      let document = reducer(make(), setSentCopy({ file: PDF }));
      expect(lastError(document)).toBeUndefined();
      expect(document.state.global.sentCopy).toStrictEqual(PDF);

      const replacement = {
        ref: FILE_B,
        name: "proposal-v2.pdf",
        type: "application/pdf",
      };
      document = reducer(document, setSentCopy({ file: replacement }));
      expect(document.state.global.sentCopy).toStrictEqual(replacement);

      document = reducer(document, setSentCopy({}));
      expect(document.state.global.sentCopy).toBeNull();
      document = reducer(document, setSentCopy({ file: PDF }));
      document = reducer(document, setSentCopy({ file: null }));
      expect(document.state.global.sentCopy).toBeNull();
      expect(errors(document).filter(Boolean)).toStrictEqual([]);
    }
  });

  it("is refused while the proposal is a draft, approved, withdrawn or superseded", () => {
    const withdrawn = reducer(
      readyDraft(),
      withdrawProposal({ reason: "Out of scope" }),
    );
    const superseded = reducer(
      sent(),
      supersedeProposal({ supersededByProposalId: "proposal-brisa-2" }),
    );
    for (const before of [readyDraft(), approved(), withdrawn, superseded]) {
      const after = reducer(before, setSentCopy({ file: PDF }));
      expect(lastError(after)).toBe(
        "The copy that was sent can change only while the proposal is sent, accepted or declined",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses a file without a name or a type", () => {
    const before = sent();
    const noName = reducer(before, setSentCopy({ file: { ...PDF, name: "" } }));
    const noType = reducer(
      before,
      setSentCopy({ file: { ...PDF, type: " " } }),
    );
    expect(lastError(noName)).toBe("A file needs a name");
    expect(lastError(noType)).toBe("A file needs a type");
    expect(noName.state.global).toStrictEqual(before.state.global);
    expect(noType.state.global).toStrictEqual(before.state.global);
  });
});

describe("the client's answer", () => {
  it("records an acceptance with the option chosen", () => {
    const document = reducer(
      sent(),
      recordProposalAnswer({
        accepted: true,
        chosenOptionId: "option-b",
        answeredAt: T2,
      }),
    );
    expect(lastError(document)).toBeUndefined();
    expect(document.state.global).toMatchObject({
      status: "ACCEPTED",
      chosenOptionId: "option-b",
      answeredAt: T2,
      reason: null,
    });
  });

  it("records a decline with its reason and no option", () => {
    const document = reducer(
      sent(),
      recordProposalAnswer({
        accepted: false,
        chosenOptionId: "option-b",
        reason: "The budget is spent for this year",
        answeredAt: T2,
      }),
    );
    expect(document.state.global).toMatchObject({
      status: "DECLINED",
      chosenOptionId: null,
      answeredAt: T2,
      reason: "The budget is spent for this year",
    });
  });

  it("refuses a decline without a reason", () => {
    for (const reason of [undefined, null, "   "]) {
      const before = sent();
      const after = reducer(
        before,
        recordProposalAnswer({ accepted: false, reason, answeredAt: T2 }),
      );
      expect(lastError(after)).toBe("A declined proposal needs a reason");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("is recorded once", () => {
    for (const make of [accepted, declined]) {
      const before = make();
      const after = reducer(
        before,
        recordProposalAnswer({
          accepted: false,
          reason: "Changed our mind",
          answeredAt: T2,
        }),
      );
      expect(lastError(after)).toBe("The client's answer is recorded once");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("is refused on a proposal that has not been sent", () => {
    for (const make of [readyDraft, approved]) {
      const before = make();
      const after = reducer(
        before,
        recordProposalAnswer({
          accepted: true,
          chosenOptionId: "option-a",
          answeredAt: T2,
        }),
      );
      expect(lastError(after)).toBe("An answer is recorded on a sent proposal");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });
});

describe("the signed copy", () => {
  const SIGNED = { ref: FILE_A, name: "signed.pdf", type: "application/pdf" };

  it("is set, replaced and cleared while the proposal is accepted", () => {
    let document = reducer(accepted(), setSignedCopy({ file: SIGNED }));
    expect(lastError(document)).toBeUndefined();
    expect(document.state.global.signedCopy).toStrictEqual(SIGNED);

    const replacement = {
      ref: FILE_B,
      name: "signed-final.pdf",
      type: "application/pdf",
    };
    document = reducer(document, setSignedCopy({ file: replacement }));
    expect(document.state.global.signedCopy).toStrictEqual(replacement);

    document = reducer(document, setSignedCopy({}));
    expect(document.state.global.signedCopy).toBeNull();
    document = reducer(document, setSignedCopy({ file: SIGNED }));
    document = reducer(document, setSignedCopy({ file: null }));
    expect(document.state.global.signedCopy).toBeNull();
    expect(errors(document).filter(Boolean)).toStrictEqual([]);
  });

  it("is refused unless the proposal is accepted", () => {
    for (const make of [readyDraft, approved, sent, declined]) {
      const before = make();
      const after = reducer(before, setSignedCopy({ file: SIGNED }));
      expect(lastError(after)).toBe(
        "The signed copy can change only while the proposal is accepted",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses a file without a name or a type", () => {
    const before = accepted();
    const noName = reducer(
      before,
      setSignedCopy({ file: { ...SIGNED, name: "" } }),
    );
    const noType = reducer(
      before,
      setSignedCopy({ file: { ...SIGNED, type: "" } }),
    );
    expect(lastError(noName)).toBe("A file needs a name");
    expect(lastError(noType)).toBe("A file needs a type");
    expect(noType.state.global).toStrictEqual(before.state.global);
  });
});

describe("withdrawing a proposal", () => {
  it("withdraws a draft, an approved and a sent proposal, with the reason", () => {
    for (const make of [readyDraft, approved, sent]) {
      const document = reducer(
        make(),
        withdrawProposal({ reason: "The scope changed" }),
      );
      expect(lastError(document)).toBeUndefined();
      expect(document.state.global).toMatchObject({
        status: "WITHDRAWN",
        reason: "The scope changed",
      });
    }
  });

  it("refuses a final proposal", () => {
    const withdrawn = reducer(
      readyDraft(),
      withdrawProposal({ reason: "Out of scope" }),
    );
    const superseded = reducer(
      sent(),
      supersedeProposal({ supersededByProposalId: "proposal-brisa-2" }),
    );
    for (const before of [accepted(), declined(), withdrawn, superseded]) {
      const after = reducer(before, withdrawProposal({ reason: "Too late" }));
      expect(lastError(after)).toBe(
        "An accepted, declined, withdrawn or superseded proposal cannot be withdrawn",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses a withdrawal without a reason", () => {
    const before = sent();
    const after = reducer(before, withdrawProposal({ reason: "  " }));
    expect(lastError(after)).toBe("Withdrawing a proposal needs a reason");
    expect(after.state.global).toStrictEqual(before.state.global);
  });
});

describe("superseding a proposal", () => {
  it("supersedes a sent or declined proposal, naming its replacement", () => {
    for (const make of [sent, declined]) {
      const document = reducer(
        make(),
        supersedeProposal({ supersededByProposalId: "proposal-brisa-2" }),
      );
      expect(lastError(document)).toBeUndefined();
      expect(document.state.global).toMatchObject({
        status: "SUPERSEDED",
        supersededByProposalId: "proposal-brisa-2",
      });
    }
  });

  it("refuses a proposal that is not sent or declined", () => {
    for (const make of [readyDraft, approved, accepted]) {
      const before = make();
      const after = reducer(
        before,
        supersedeProposal({ supersededByProposalId: "proposal-brisa-2" }),
      );
      expect(lastError(after)).toBe(
        "Only a sent or declined proposal can be superseded",
      );
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });

  it("refuses a replacement that is empty", () => {
    const before = sent();
    const after = reducer(
      before,
      supersedeProposal({ supersededByProposalId: " " }),
    );
    expect(lastError(after)).toBe(
      "Superseding a proposal needs the proposal that replaces it",
    );
    expect(after.state.global).toStrictEqual(before.state.global);
  });

  it("freezes a superseded proposal against every edit", () => {
    const document = reducer(
      sent(),
      supersedeProposal({ supersededByProposalId: "proposal-brisa-2" }),
    );
    const after = reducer(document, setProposalDetails({ title: "x" }));
    expect(lastError(after)).toBe("Only a draft proposal can be edited");
  });
});

describe("the whole lifecycle", () => {
  it("runs from a draft to an accepted proposal with its signed copy", () => {
    let document = utils.createDocument();
    document = reducer(
      document,
      setProposalDetails({
        title: "Rollout",
        code: "ROL",
        currency: "CHF",
        validUntil: "2026-12-31T00:00:00.000Z",
      }),
    );
    document = reducer(
      document,
      setProposalParties({
        leadId: "lead-kelvar",
        contractingEntity: { id: "note-halloway", title: "Halloway Fund AG" },
      }),
    );
    document = reducer(
      document,
      addPackage({ id: "p1", code: "ROL-1", name: "Core" }),
    );
    document = reducer(
      document,
      addOption({ id: "option-a", label: "A", packageIds: ["p1"] }),
    );
    document = reducer(document, approveProposal(APPROVE));
    document = reducer(document, reopenProposal({}));
    document = reducer(document, approveProposal(APPROVE));
    document = reducer(
      document,
      markProposalSent({ sentBy: JONAS, sentAt: T1 }),
    );
    document = reducer(
      document,
      recordProposalAnswer({
        accepted: true,
        chosenOptionId: "option-a",
        answeredAt: T2,
      }),
    );
    document = reducer(
      document,
      setSignedCopy({
        file: { ref: FILE_A, name: "signed.pdf", type: "application/pdf" },
      }),
    );
    expect(errors(document).filter(Boolean)).toStrictEqual([]);
    expect(document.state.global.status).toBe("ACCEPTED");
  });
});
