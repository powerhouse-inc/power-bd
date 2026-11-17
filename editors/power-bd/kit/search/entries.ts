/**
 * The search index: one entry per thing the palette can find, built from the
 * space's records. Pure. Each builder names the fields it reads, and a
 * confidential item is never one of them (see `SearchInput`).
 */
import { VOCABULARY, type Term } from "../../../../design-system/vocabulary.js";
import { organisationLabel } from "../organisation-list/index.js";
import { memberName } from "../settings/settings.js";
import type { Entry, Field, SearchInput, Tag } from "./types.js";

/** "ON_HOLD_NOW" as "On hold now": a stored value never shows as it is stored. */
const plainWords = (value: string) => {
  const words = value.replaceAll("_", " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const term = (terms: readonly Term[], value: string): Tag => {
  const found = terms.find((t) => t.value === value);
  return found
    ? { label: found.label, tone: found.tone }
    : { label: plainWords(value), tone: "default" };
};

/** Fields with a text, trimmed; the rest are dropped. */
const fields = (
  ...pairs: readonly (readonly [string, string | null | undefined])[]
): Field[] =>
  pairs.flatMap(([label, text]) => {
    const trimmed = text?.trim();
    return trimmed ? [{ label, text: trimmed }] : [];
  });

const each = (label: string, texts: readonly (string | null | undefined)[]) =>
  texts.map((text) => [label, text] as const);

const joined = (parts: readonly (string | null | undefined)[]) =>
  parts.filter(Boolean).join(" · ") || null;

/** Every entry of the space, in no particular order. */
export function searchEntries(input: SearchInput): Entry[] {
  const contacts = new Map(input.contacts.map((c) => [c.id, c.state]));
  const orgName = (id: string | null | undefined) => {
    const contact = id ? contacts.get(id) : undefined;
    return contact ? organisationLabel(contact.name?.trim()) : null;
  };
  const personName = (contactId: string, personId: string | null | undefined) =>
    contacts.get(contactId)?.people.find((p) => p.id === personId)?.name;
  const owner = (address: string | null | undefined) =>
    memberName(input.members, address);
  const changed = (id: string) => input.changed[id] ?? null;
  const open = (steps: readonly { text: string; doneAt?: string | null }[]) =>
    steps.filter((s) => !s.doneAt).map((s) => s.text);

  const leads = input.leads.map(({ id, state: s }): Entry => {
    const status = term(VOCABULARY.leadStatus, s.status);
    const organisation = orgName(s.organisationId);
    return {
      key: `lead:${id}`,
      group: "lead",
      icon: "leads",
      title: s.name?.trim() || "Untitled lead",
      detail: organisation,
      fields: fields(
        ["Organisation", organisation],
        ["Status", status.label],
        ["Kind", s.kind && term(VOCABULARY.relationshipKind, s.kind).label],
        ["Owner", owner(s.owner)],
        ["Reason", s.statusReason],
        ...each("Next step", open(s.nextSteps)),
        ...each(
          "Person",
          s.contactLinks.map((l) => personName(l.contactId, l.personId)),
        ),
        ...each(
          "History",
          s.interactions.map((i) => i.summary),
        ),
      ),
      tag: status,
      owner: s.owner ?? null,
      target: { type: "record", id },
      changedAt: changed(id),
    };
  });

  const opportunities = input.opportunities.map(({ id, state: s }): Entry => {
    const status = term(VOCABULARY.opportunityStatus, s.status);
    const funder = orgName(s.funderId);
    return {
      key: `opportunity:${id}`,
      group: "opportunity",
      icon: "funding",
      title: s.name?.trim() || "Untitled funding opportunity",
      detail: funder,
      fields: fields(
        ["Funder", funder],
        ["Status", status.label],
        [
          "Instrument",
          s.instrument && term(VOCABULARY.instrument, s.instrument).label,
        ],
        ["Owner", owner(s.owner)],
        ["Reason", s.statusReason],
        ["Round", s.roundLabel],
        ["Programme", s.programme?.title],
        ["Where to apply", s.whereToApply],
        ...each("Next step", open(s.nextSteps)),
        ...each(
          "Partner",
          s.partners.map((p) => orgName(p.organisationId)),
        ),
      ),
      tag: status,
      owner: s.owner ?? null,
      target: { type: "record", id },
      changedAt: changed(id),
    };
  });

  const organisations = input.contacts.flatMap(({ id, state: s }): Entry[] => {
    const name = organisationLabel(s.name?.trim());
    return [
      {
        key: `organisation:${id}`,
        group: "organisation",
        icon: "organisations",
        title: name,
        detail: null,
        fields: fields(
          ["Website", s.website],
          ["Email", s.email],
          ...each("Tag", s.tags),
          ["Notes", s.notes],
        ),
        tag:
          s.status === "ARCHIVED" ? { label: "Archived", tone: "default" } : null,
        target: { type: "record", id },
        changedAt: changed(id),
      },
      ...s.people.map(
        (p): Entry => ({
          key: `person:${id}:${p.id}`,
          group: "person",
          icon: "user",
          title: p.name.trim() || "Unnamed person",
          detail: joined([p.role?.trim(), name]),
          fields: fields(
            ["Organisation", name],
            ["Role", p.role],
            ["Email", p.email],
          ),
          tag: null,
          target: { type: "record", id },
          changedAt: null,
        }),
      ),
    ];
  });

  const investors = input.investorLists.flatMap(({ state }) =>
    state.rows.map(
      (r): Entry => ({
        key: `investor:${r.id}`,
        group: "investor",
        icon: "investors",
        title: r.name.trim() || "Unnamed investor",
        detail: r.sourceList?.trim() || null,
        fields: fields(
          ["Status", term(VOCABULARY.investorRow, r.state).label],
          ["List", r.sourceList],
          ["Website", r.website],
          ["Reason", r.exclusionReason],
          ["Organisation", orgName(r.organisationId)],
        ),
        tag: term(VOCABULARY.investorRow, r.state),
        target: { type: "investor-row", rowId: r.id },
        changedAt: null,
      }),
    ),
  );

  const proposals = input.proposals.map(({ id, state: s }): Entry => {
    const status = term(VOCABULARY.proposalStatus, s.status);
    const lead = input.leads.find((l) => l.id === s.leadId)?.state;
    const leadName = lead ? lead.name?.trim() || "Untitled lead" : null;
    const recipient = s.recipient;
    return {
      key: `proposal:${id}`,
      group: "proposal",
      icon: "proposal",
      title: s.title?.trim() || "Untitled proposal",
      detail: joined([s.code?.trim(), leadName]),
      fields: fields(
        ["Code", s.code],
        ["Lead", leadName],
        ["Organisation", orgName(lead?.organisationId ?? recipient?.contactId)],
        ["Status", status.label],
        ["Owner", owner(lead?.owner)],
        ["Reason", s.reason],
        [
          "Person",
          recipient && personName(recipient.contactId, recipient.personId),
        ],
      ),
      tag: status,
      owner: lead?.owner ?? null,
      target: { type: "record", id },
      changedAt: changed(id),
    };
  });

  const decisions = input.decisions.map(({ id, state: s }): Entry => {
    const status = term(VOCABULARY.decisionStatus, s.status);
    return {
      key: `decision:${id}`,
      group: "decision",
      icon: "decisions",
      title: s.question?.trim() || "Untitled decision",
      detail: null,
      fields: fields(
        ["Status", status.label],
        ["Owner", owner(s.owner)],
        ["Context", s.context],
        ["Answer", s.answer],
        ["Reason", s.reason],
      ),
      tag: status,
      owner: s.owner ?? null,
      target: { type: "record", id },
      changedAt: changed(id),
    };
  });

  const item = (
    id: string,
    title: string,
    detail: string,
    tag: Tag | null,
    found: Field[],
  ): Entry => ({
    key: `playbook:${id}`,
    group: "playbook",
    icon: "playbook",
    title: title.trim() || `Untitled ${detail.toLowerCase()}`,
    detail,
    fields: found,
    tag,
    target: { type: "playbook" },
    changedAt: null,
  });
  const playbook = input.playbooks.flatMap(({ state: s }) => [
    ...s.positioning.map((p) => {
      const status = term(VOCABULARY.positioningStatus, p.status);
      return item(
        p.id,
        p.title,
        "Positioning",
        status,
        fields(["Text", p.text], ["Status", status.label]),
      );
    }),
    ...s.proofCases.map((c) =>
      item(c.id, c.title, "Proof case", null, fields(["Summary", c.summary])),
    ),
    ...s.neverClaims.map((c) =>
      item(
        c.id,
        c.claim,
        "Never claim",
        null,
        fields(...each("Phrase", c.phrases), ["Reason", c.reason]),
      ),
    ),
  ]);

  return [
    ...leads,
    ...opportunities,
    ...proposals,
    ...organisations,
    ...investors,
    ...decisions,
    ...playbook,
  ];
}
