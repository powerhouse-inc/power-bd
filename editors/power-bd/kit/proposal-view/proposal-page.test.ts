import { describe, expect, it } from "vitest";
import type { ProposalState } from "document-models/proposal";
import { emptyProposal } from "../proposal-totals/fixtures.js";
import {
  answerLine,
  approveNote,
  checkInput,
  findingFlags,
  partyNames,
  statusRules,
} from "./proposal-page.js";

describe("statusRules", () => {
  it("lets only a draft be edited, with no notice", () => {
    expect(statusRules("DRAFT")).toEqual({
      editable: true,
      panel: "draft",
      frozen: null,
      canRevise: false,
      canWithdraw: true,
      showsSentCopy: false,
      showsSignedCopy: false,
    });
  });
  it("locks an approved proposal and offers the sent step", () => {
    expect(statusRules("APPROVED")).toEqual({
      editable: false,
      panel: "approved",
      frozen: {
        tone: "blue",
        title: "Approved, so the text is locked",
        text: "Reopen it to edit. Approval always matches the text that is sent.",
      },
      canRevise: false,
      canWithdraw: true,
      showsSentCopy: false,
      showsSignedCopy: false,
    });
  });
  it("freezes a sent proposal and allows a revision", () => {
    const r = statusRules("SENT");
    expect(r.panel).toBe("sent");
    expect(r.frozen).toEqual({
      tone: "neutral",
      title: "Sent, so it can't change",
      text: "This is the record of what the client was offered. To change the offer, revise it: that makes a new draft and replaces this one once the new one is sent.",
    });
    expect([
      r.canRevise,
      r.canWithdraw,
      r.showsSentCopy,
      r.showsSignedCopy,
    ]).toEqual([true, true, true, false]);
  });
  it("shows the signed copy once accepted, and revision once declined", () => {
    const accepted = statusRules("ACCEPTED");
    expect(accepted.panel).toBe("answered");
    expect(accepted.frozen?.title).toBe("Closed, so it can't change");
    expect(accepted.frozen?.text).toBe(
      "The answer and the copies can still be recorded below.",
    );
    expect([
      accepted.canRevise,
      accepted.canWithdraw,
      accepted.showsSentCopy,
      accepted.showsSignedCopy,
    ]).toEqual([false, false, true, true]);
    const declined = statusRules("DECLINED");
    expect([
      declined.panel,
      declined.canRevise,
      declined.showsSignedCopy,
    ]).toEqual(["answered", true, false]);
  });
  it("treats withdrawn and superseded as ended", () => {
    expect(statusRules("WITHDRAWN").panel).toBe("ended");
    expect(statusRules("SUPERSEDED")).toMatchObject({
      panel: "ended",
      editable: false,
      canWithdraw: false,
    });
  });
});

describe("approveNote", () => {
  it("gives the gate's reason first", () => {
    expect(
      approveNote({
        gateMessage: "The lead is not loaded",
        signedIn: true,
        findings: 0,
      }),
    ).toBe("The lead is not loaded. Only a person approves.");
  });
  it("asks to sign in, then to fix findings", () => {
    expect(
      approveNote({ gateMessage: null, signedIn: false, findings: 0 }),
    ).toBe("Sign in to approve.");
    expect(
      approveNote({ gateMessage: null, signedIn: true, findings: 3 }),
    ).toBe(
      "Approval opens when nothing is left to fix. Only a person approves.",
    );
  });
  it("says what approving does when it is open", () => {
    expect(
      approveNote({ gateMessage: null, signedIn: true, findings: 0 }),
    ).toBe(
      "Only a person approves. Approving locks the text until you reopen it.",
    );
  });
});

describe("answerLine", () => {
  it("reads an accepted answer with its option and day", () => {
    expect(
      answerLine({
        status: "ACCEPTED",
        chosen: "Full build",
        reason: null,
        day: "Mon 2 Nov",
      }),
    ).toBe("Accepted: Full build, Mon 2 Nov.");
  });
  it("reads a declined answer with its reason", () => {
    expect(
      answerLine({
        status: "DECLINED",
        chosen: undefined,
        reason: "Too early",
        day: "Mon 2 Nov",
      }),
    ).toBe("Declined: Too early, Mon 2 Nov.");
  });
  it("leaves out what is missing", () => {
    expect(
      answerLine({
        status: "ACCEPTED",
        chosen: undefined,
        reason: null,
        day: null,
      }),
    ).toBe("Accepted.");
    expect(
      answerLine({
        status: "DECLINED",
        chosen: undefined,
        reason: null,
        day: null,
      }),
    ).toBe("Declined.");
  });
});

describe("findingFlags", () => {
  it("groups sentences by list and id, skipping findings about a field", () => {
    const flags = findingFlags([
      { concerns: { list: "packages", id: "p1" }, sentence: "One" },
      { concerns: { field: "title" }, sentence: "Two" },
      {
        concerns: { list: "packages", id: "p1", field: "name" },
        sentence: "Three",
      },
      { concerns: { list: "options", id: "o1" }, sentence: "Four" },
    ]);
    expect([...flags.entries()]).toEqual([
      ["packages:p1", ["One", "Three"]],
      ["options:o1", ["Four"]],
    ]);
  });
});

describe("partyNames", () => {
  const contacts = [
    {
      id: "c1",
      name: "Harbor Works",
      people: [{ id: "a", name: "Ines Roth" }],
    },
  ];
  it("names the client by its organisation, then the lead", () => {
    expect(
      partyNames({
        contacts,
        lead: { name: "Harbor lead", organisationId: "c1" },
        recipient: { contactId: "c1", personId: "a" },
      }),
    ).toEqual({
      client: "Harbor Works",
      recipient: "Ines Roth",
    });
    expect(
      partyNames({
        contacts,
        lead: { name: "Solo lead", organisationId: null },
        recipient: null,
      }),
    ).toEqual({
      client: "Solo lead",
      recipient: "the recipient",
    });
  });
  it("falls back to the organisation when the person is unknown, and to words when nothing is known", () => {
    expect(
      partyNames({
        contacts,
        lead: undefined,
        recipient: { contactId: "c1", personId: "zz" },
      }),
    ).toEqual({
      client: "the client",
      recipient: "Harbor Works",
    });
  });
});

describe("checkInput", () => {
  it("takes the playbook, the lead's confidential items and the referenced decisions", () => {
    const proposal: ProposalState = {
      ...emptyProposal(),
      references: [
        { id: "r1", kind: "DECISION", documentId: "d1", title: "Pricing call" },
        { id: "r2", kind: "DECISION", documentId: "gone", title: "Old call" },
        { id: "r3", kind: "LEAD", documentId: "n1", title: "A lead" },
      ],
    };
    const input = checkInput({
      proposal,
      playbook: undefined,
      confidentialItems: undefined,
      decisions: [{ id: "d1", status: "OPEN" }],
      today: "2026-11-16",
    });
    expect(input).toEqual({
      proposal,
      playbook: { positioning: [], neverClaims: [] },
      confidentialItems: [],
      decisions: [{ id: "d1", status: "OPEN" }],
      today: "2026-11-16",
    });
  });
});
