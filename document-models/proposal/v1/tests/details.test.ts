import {
  reducer,
  setProposalDetails,
  setProposalParties,
  utils,
} from "document-models/proposal/v1";
import { describe, expect, it } from "vitest";
import { approved, errors, lastError, readyDraft, sent } from "./fixtures.js";

describe("a proposal's details", () => {
  it("starts as an empty draft", () => {
    expect(utils.createDocument().state.global).toStrictEqual({
      title: null,
      code: null,
      leadId: null,
      recipient: null,
      contractingEntity: null,
      currency: null,
      validUntil: null,
      revisesProposalId: null,
      bindingOnSignature: false,
      processesPersonalData: false,
      status: "DRAFT",
      approvedBy: null,
      approvedAt: null,
      sentBy: null,
      sentAt: null,
      sentCopy: null,
      chosenOptionId: null,
      answeredAt: null,
      reason: null,
      signedCopy: null,
      supersededByProposalId: null,
      references: [],
      packages: [],
      deliverables: [],
      options: [],
      paymentSteps: [],
      actors: [],
      useCases: [],
      boundaries: [],
      sections: [],
      clauses: [],
      annexes: [],
      figures: [],
    });
  });

  it("sets the title, the code, the currency, the valid-until date, the two flags and the proposal it revises", () => {
    const document = reducer(
      utils.createDocument(),
      setProposalDetails({
        title: "Brisa Labs · e-signature rollout",
        code: "BLE",
        currency: "EUR",
        validUntil: "2026-12-31T00:00:00.000Z",
        bindingOnSignature: true,
        processesPersonalData: true,
        revisesProposalId: "proposal-brisa-1",
      }),
    );

    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global).toMatchObject({
      title: "Brisa Labs · e-signature rollout",
      code: "BLE",
      currency: "EUR",
      validUntil: "2026-12-31T00:00:00.000Z",
      bindingOnSignature: true,
      processesPersonalData: true,
      revisesProposalId: "proposal-brisa-1",
      status: "DRAFT",
    });
  });

  it("leaves a field out unchanged, and clears one set to null", () => {
    let document = readyDraft();
    document = reducer(document, setProposalDetails({ title: "New title" }));
    expect(document.state.global).toMatchObject({
      title: "New title",
      code: "BRI",
      currency: "EUR",
      bindingOnSignature: false,
    });

    document = reducer(
      document,
      setProposalDetails({
        code: null,
        validUntil: null,
        currency: null,
        revisesProposalId: null,
        title: null,
        bindingOnSignature: null,
        processesPersonalData: null,
      }),
    );
    expect(document.state.global).toMatchObject({
      title: null,
      code: null,
      currency: null,
      validUntil: null,
      revisesProposalId: null,
      bindingOnSignature: false,
      processesPersonalData: false,
    });
  });

  it("sets the flags to false again", () => {
    let document = reducer(
      utils.createDocument(),
      setProposalDetails({ bindingOnSignature: true }),
    );
    document = reducer(
      document,
      setProposalDetails({ bindingOnSignature: false }),
    );
    expect(document.state.global.bindingOnSignature).toBe(false);
  });

  it("refuses to edit the details once the proposal is approved or sent", () => {
    for (const make of [approved, sent]) {
      const before = make();
      const after = reducer(before, setProposalDetails({ title: "Changed" }));
      expect(lastError(after)).toBe("Only a draft proposal can be edited");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });
});

describe("a proposal's parties", () => {
  it("sets the lead, the recipient and the contracting entity", () => {
    const document = reducer(
      utils.createDocument(),
      setProposalParties({
        leadId: "lead-brisa",
        recipient: { contactId: "contact-brisa", personId: "person-ines" },
        contractingEntity: { id: "note-halloway", title: "Halloway Fund AG" },
      }),
    );
    expect(errors(document)).toStrictEqual([undefined]);
    expect(document.state.global).toMatchObject({
      leadId: "lead-brisa",
      recipient: { contactId: "contact-brisa", personId: "person-ines" },
      contractingEntity: { id: "note-halloway", title: "Halloway Fund AG" },
    });
  });

  it("keeps a part left out, replaces one that is given, and clears one set to null", () => {
    let document = readyDraft();
    document = reducer(
      document,
      setProposalParties({ recipient: { contactId: "contact-kelvar" } }),
    );
    expect(document.state.global).toMatchObject({
      leadId: "lead-brisa",
      recipient: { contactId: "contact-kelvar", personId: null },
      contractingEntity: { id: "note-halloway", title: "Halloway Fund AG" },
    });

    document = reducer(
      document,
      setProposalParties({
        leadId: null,
        recipient: null,
        contractingEntity: null,
      }),
    );
    expect(document.state.global).toMatchObject({
      leadId: null,
      recipient: null,
      contractingEntity: null,
    });
  });

  it("refuses to change the parties once the proposal is approved or sent", () => {
    for (const make of [approved, sent]) {
      const before = make();
      const after = reducer(
        before,
        setProposalParties({ leadId: "lead-other" }),
      );
      expect(lastError(after)).toBe("Only a draft proposal can be edited");
      expect(after.state.global).toStrictEqual(before.state.global);
    }
  });
});
