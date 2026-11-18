import { describe, expect, it } from "vitest";
import { agentDeleteRefusal, deleteVerdict, deleteWords, isDeletable, linksTo, placeAfterDelete, type RecordLike } from "./index.js";

const record = (id: string, documentType: string, name: string, global: object = {}): RecordLike => ({
  header: { id, documentType, name },
  state: { global },
});

const ORG = record("org-kelvar-0001", "powerbd/contact", "Kelvar Institute", { name: "Kelvar Institute" });
const LEAD = record("lead-pilot-0001", "powerbd/lead", "Kelvar pilot", { name: "Kelvar pilot", organisationId: "org-kelvar-0001" });
const MARKET = record("market-0001", "powerbd/market", "Finance operations, EU", { name: "Finance operations, EU" });
const LIST = record("list-0001", "powerbd/investor-list", "Investor list", { rows: [{ id: "r1", leadId: "lead-pilot-0001" }] });
const proposal = (status: string, more: object = {}) => record("proposal-0001", "powerbd/proposal", "Pilot proposal", { status, leadId: "lead-pilot-0001", ...more });

describe("which records can be deleted", () => {
  it.each(["powerbd/lead", "powerbd/opportunity", "powerbd/contact", "powerbd/decision", "powerbd/proposal", "powerbd/market"])(
    "deletes a %s",
    (type) => expect(isDeletable(type)).toBe(true),
  );

  it.each(["powerbd/settings", "powerbd/playbook", "powerbd/investor-list", "powerhouse/document-drive"])(
    "never deletes %s, which the space needs",
    (type) => {
      expect(isDeletable(type)).toBe(false);
      expect(deleteVerdict(record("x", type, "X"), [])).toBeNull();
    },
  );

  it("goes back to the record's list after deleting it", () => {
    expect(placeAfterDelete("powerbd/proposal")).toBe("proposals");
    expect(placeAfterDelete("powerbd/contact")).toBe("organisations");
    expect(placeAfterDelete("powerbd/opportunity")).toBe("funding");
    expect(placeAfterDelete("powerbd/settings")).toBe("overview");
  });
});

describe("what links to a record", () => {
  it("finds every record that names it, whatever field holds the link", () => {
    expect(linksTo(ORG, [ORG, LEAD, MARKET])).toEqual([{ id: "lead-pilot-0001", noun: "lead", name: "Kelvar pilot" }]);
  });

  it("names the space's own records by kind alone", () => {
    expect(linksTo(LEAD, [LIST])).toEqual([{ id: "list-0001", noun: "investor list", name: "" }]);
  });

  it("names a linking record by its stored name when it has no title, and an unknown kind as a record", () => {
    const untitled = record("decision-1", "powerbd/decision", "Pick a partner", { references: [{ documentId: "org-kelvar-0001" }] });
    const unknown = record("thing-1", "powerbd/unknown", "Thing", { orgId: "org-kelvar-0001" });
    expect(linksTo(ORG, [untitled, unknown])).toEqual([
      { id: "decision-1", noun: "decision", name: "Pick a partner" },
      { id: "thing-1", noun: "record", name: "Thing" },
    ]);
  });

  it("reads a record with no state as linking to nothing, and as not sent", () => {
    const bare: RecordLike = { header: { id: "proposal-9", documentType: "powerbd/proposal", name: "Bare" }, state: undefined };
    expect(linksTo(ORG, [bare])).toEqual([]);
    expect(deleteVerdict(bare, [])).toEqual({ may: true });
  });

  it("ignores the record itself, documents outside Power BD and ids that only start the same", () => {
    const vaultNote = record("note-1", "bai/knowledge-note", "Note", { refs: ["org-kelvar-0001"] });
    const lookalike = record("lead-2", "powerbd/lead", "Other", { organisationId: "org-kelvar-0001-b" });
    expect(linksTo(ORG, [ORG, vaultNote, lookalike])).toEqual([]);
  });
});

describe("whether a record may be deleted now", () => {
  it("lets a record go when nothing links to it", () => {
    expect(deleteVerdict(MARKET, [ORG, LEAD])).toEqual({ may: true });
  });

  it("keeps an organisation a lead links to", () => {
    expect(deleteVerdict(ORG, [LEAD])).toEqual({
      may: false,
      why: "linked",
      links: [{ id: "lead-pilot-0001", noun: "lead", name: "Kelvar pilot" }],
    });
  });

  it("lets a proposal go while it has never been sent", () => {
    expect(deleteVerdict(proposal("DRAFT"), [LEAD])).toEqual({ may: true });
    expect(deleteVerdict(proposal("APPROVED"), [LEAD])).toEqual({ may: true });
  });

  it("keeps a proposal once it was sent, and says whether it can still be withdrawn", () => {
    const sentAt = "2026-11-02T09:00:00.000Z";
    expect(deleteVerdict(proposal("SENT", { sentAt }), [])).toEqual({ may: false, why: "sent", stillOpen: true });
    expect(deleteVerdict(proposal("ACCEPTED", { sentAt }), [])).toEqual({ may: false, why: "sent", stillOpen: false });
    expect(deleteVerdict(proposal("WITHDRAWN", { sentAt }), [])).toEqual({ may: false, why: "sent", stillOpen: false });
  });

  it("treats a proposal the client answered as sent, even without a sent date", () => {
    expect(deleteVerdict(proposal("DECLINED"), [])).toEqual({ may: false, why: "sent", stillOpen: false });
    expect(deleteVerdict(proposal("SENT"), [])).toEqual({ may: false, why: "sent", stillOpen: true });
  });

  it("lets a draft withdrawn before it was sent go", () => {
    expect(deleteVerdict(proposal("WITHDRAWN"), [LEAD])).toEqual({ may: true });
  });

  it("keeps a draft a newer version revises", () => {
    const newer = record("proposal-0002", "powerbd/proposal", "Pilot proposal v2", { status: "DRAFT", revisesProposalId: "proposal-0001" });
    expect(deleteVerdict(proposal("DRAFT"), [newer])).toMatchObject({ may: false, why: "linked" });
  });
});

describe("what the delete section says", () => {
  it("asks to confirm, says it can't be undone and how to keep the history instead", () => {
    const words = deleteWords("powerbd/lead", { may: true });
    expect(words).toEqual({
      button: "Delete this lead",
      confirm:
        "Deleting removes this lead and its history for everyone in the space. It can't be undone. To keep its history, close it as lost or park it instead.",
      yes: "Yes, delete",
      keep: "Keep it",
      refusal: null,
    });
  });

  it("offers no other way for records that have none", () => {
    expect(deleteWords("powerbd/market", { may: true }).confirm).toBe(
      "Deleting removes this market and its history for everyone in the space. It can't be undone.",
    );
  });

  it("names what links to the record, then how many more", () => {
    const links = ["A", "B", "C", "D", "E"].map((n, i) => ({ id: `l${i}`, noun: "lead", name: n }));
    expect(deleteWords("powerbd/contact", { may: false, why: "linked", links }).refusal).toBe(
      'Other records link to this organisation: the lead "A", the lead "B", the lead "C" and 2 more. Change or delete those first, or archive it instead.',
    );
    expect(deleteWords("powerbd/market", { may: false, why: "linked", links: [{ id: "x", noun: "investor list", name: "" }] }).refusal).toBe(
      "Other records link to this market: the investor list. Change or delete those first.",
    );
  });

  it("names records of one kind and name once, with how many", () => {
    const links = [
      { id: "p1", noun: "proposal", name: "Pilot proposal" },
      { id: "p2", noun: "proposal", name: "Pilot proposal" },
      { id: "o1", noun: "funding opportunity", name: "Harbour call" },
      { id: "o2", noun: "funding opportunity", name: "Harbour call" },
    ];
    expect(deleteWords("powerbd/lead", { may: false, why: "linked", links }).refusal).toBe(
      'Other records link to this lead: 2 proposals "Pilot proposal" and 2 funding opportunities "Harbour call". Change or delete those first, or close it as lost or park it instead.',
    );
  });

  it("says why a sent proposal stays, and offers withdrawing while it is open", () => {
    expect(deleteWords("powerbd/proposal", { may: false, why: "sent", stillOpen: true }).refusal).toBe(
      "A sent proposal stays as the record of what the client received. If it no longer stands, withdraw it.",
    );
    expect(deleteWords("powerbd/proposal", { may: false, why: "sent", stillOpen: false }).refusal).toBe(
      "A sent proposal stays as the record of what the client received.",
    );
  });

  it("falls back to plain words for an unknown kind", () => {
    expect(deleteWords("powerbd/unknown", { may: true }).button).toBe("Delete this record");
  });
});

describe("what the agent may delete", () => {
  const records = [ORG, LEAD, MARKET, LIST, record("settings-1", "powerbd/settings", "Settings")];

  it("deletes what the record page would, found by id or slug", () => {
    expect(agentDeleteRefusal("market-0001", records)).toBeNull();
    const slugged = { ...MARKET, header: { ...MARKET.header, slug: "finance-operations-eu" } };
    expect(agentDeleteRefusal("finance-operations-eu", [slugged])).toBeNull();
  });

  it("refuses what the record page keeps, with the page's reason", () => {
    expect(agentDeleteRefusal("org-kelvar-0001", records)).toBe(
      'Other records link to this organisation: the lead "Kelvar pilot". Change or delete those first, or archive it instead.',
    );
  });

  it("never deletes the space's own records", () => {
    expect(agentDeleteRefusal("settings-1", records)).toBe(
      "The settings, playbook and investor list are the space's own records: they are never deleted.",
    );
  });

  it("deletes nothing outside the space's records, such as the space itself or a vault note", () => {
    expect(agentDeleteRefusal("bd-drive-1", records)).toBe("Only the BD space's records can be deleted from the chat.");
  });

  it("refuses while the records can't be read", () => {
    expect(agentDeleteRefusal("market-0001", undefined)).toMatch(/could not be read/);
  });
});
