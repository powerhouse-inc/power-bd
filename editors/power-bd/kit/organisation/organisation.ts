import type {
  Found,
  OrganisationInput,
  OrganisationView,
  ResearchRef,
  Via,
} from "./types.js";

const RESEARCH_KINDS = ["RESEARCH", "NOTE", "SOURCE", "COMPARABLE"];

type Shared = {
  contactLinks: { contactId: string }[];
  interactions: { people: { contactId: string }[] }[];
  references: { kind: string; documentId: string; title: string }[];
};

/** Every record that names a contact, and the research gathered from them. */
export function organisationView(input: OrganisationInput): OrganisationView {
  const c = input.contactId;
  const research = new Map<string, ResearchRef>();
  const gather = (refs: Shared["references"]) => {
    for (const r of refs)
      if (RESEARCH_KINDS.includes(r.kind) && !research.has(r.documentId))
        research.set(r.documentId, {
          documentId: r.documentId,
          title: r.title,
          kind: r.kind,
        });
  };
  const sharedVia = (s: Shared): Via[] => {
    const v: Via[] = [];
    if (s.contactLinks.some((k) => k.contactId === c)) v.push("CONTACT_LINK");
    if (s.interactions.some((i) => i.people.some((p) => p.contactId === c)))
      v.push("INTERACTION");
    return v;
  };
  const found = (
    out: Found[],
    id: string,
    name: string | null | undefined,
    via: Via[],
    s: Shared,
  ) => {
    if (!via.length) return;
    out.push({ id, name: name ?? "", via });
    gather(s.references);
  };

  const leads: Found[] = [];
  const leadIds = new Set<string>();
  for (const { id, state: s } of input.leads) {
    const via: Via[] = [];
    if (s.organisationId === c) via.push("ORGANISATION");
    via.push(...sharedVia(s));
    if (s.messages.some((m) => m.recipient?.contactId === c))
      via.push("MESSAGE");
    found(leads, id, s.name, via, s);
    if (via.length) leadIds.add(id);
  }

  const opportunities: Found[] = [];
  for (const { id, state: s } of input.opportunities) {
    const via: Via[] = [];
    if (s.funderId === c) via.push("FUNDER");
    if (s.coordinatorId === c) via.push("COORDINATOR");
    if (s.partners.some((p) => p.organisationId === c)) via.push("PARTNER");
    via.push(...sharedVia(s));
    found(opportunities, id, s.name, via, s);
  }

  const investorRows = input.investorLists.flatMap(({ id, state }) =>
    state.rows
      .filter((r) => r.organisationId === c)
      .map((r) => ({ listId: id, rowId: r.id, name: r.name, state: r.state })),
  );

  const proposals: Found[] = [];
  for (const { id, state: s } of input.proposals) {
    const via: Via[] = [];
    if (s.recipient?.contactId === c) via.push("RECIPIENT");
    if (s.leadId && leadIds.has(s.leadId)) via.push("LEAD");
    found(proposals, id, s.title, via, {
      contactLinks: [],
      interactions: [],
      references: s.references,
    });
  }

  return {
    leads,
    opportunities,
    investorRows,
    proposals,
    research: [...research.values()],
  };
}
