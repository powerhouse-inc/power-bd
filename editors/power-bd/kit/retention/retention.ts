import { isClosedOpportunity } from "../overview/status.js";
import type { HeldFile, PersonDue, RetentionInput } from "./types.js";

type PersonRef = { contactId: string; personId: string };
type Link = PersonDue["relationships"][number] & { ends: boolean };

const key = (p: PersonRef) => `${p.contactId}/${p.personId}`;

/** People due for deletion: only on closed-badly relationships, the last closed past the period. */
export function peopleDue(input: RetentionInput): PersonDue[] {
  const now = Date.parse(input.now);
  const people = new Map<string, { ref: PersonRef; links: Link[] }>();
  const leadPeople = new Map<string, Set<string>>();

  const add = (p: PersonRef | null | undefined, link: Link) => {
    if (!p) return;
    const e = people.get(key(p)) ?? { ref: p, links: [] };
    if (!e.links.some((l) => l.kind === link.kind && l.id === link.id))
      e.links.push(link);
    people.set(key(p), e);
    if (link.kind === "lead") {
      const s = leadPeople.get(link.id) ?? new Set<string>();
      s.add(key(p));
      leadPeople.set(link.id, s);
    }
  };
  const peopleOf = (s: {
    contactLinks: { contactId: string; personId?: string | null }[];
    interactions: { people: PersonRef[] }[];
  }): PersonRef[] => [
    ...s.contactLinks.flatMap((k) =>
      k.personId ? [{ contactId: k.contactId, personId: k.personId }] : [],
    ),
    ...s.interactions.flatMap((i) => i.people),
  ];
  // A link ends "badly" when it is lost, no-go, rejected or withdrawn; any other status keeps the person.
  const mk = (
    kind: Link["kind"],
    id: string,
    bad: boolean,
    closedAt: string | null | undefined,
  ): Link => ({ kind, id, closedAt: closedAt ?? "", ends: bad && !!closedAt });

  const leadLinks = new Map<string, Link>();
  for (const { id, state: s } of input.leads) {
    const link = mk("lead", id, s.status === "LOST", s.closedAt);
    leadLinks.set(id, link);
    for (const p of [
      ...peopleOf(s),
      ...s.messages.flatMap((m) => (m.recipient ? [m.recipient] : [])),
    ])
      add(p, link);
  }
  // A proposal's recipient is linked through its lead: the lead's status and close decide.
  for (const { state: s } of input.proposals) {
    const link = s.leadId ? leadLinks.get(s.leadId) : undefined;
    if (link && s.recipient?.contactId && s.recipient.personId)
      add(
        { contactId: s.recipient.contactId, personId: s.recipient.personId },
        link,
      );
  }
  for (const { id, state: s } of input.opportunities) {
    const bad = isClosedOpportunity(s.status) && s.status !== "AWARDED";
    const link = mk("opportunity", id, bad, s.closedAt);
    for (const p of peopleOf(s)) add(p, link);
  }

  const due: PersonDue[] = [];
  for (const { ref, links } of people.values()) {
    if (!links.every((l) => l.ends)) continue;
    const last = Math.max(...links.map((l) => Date.parse(l.closedAt)));
    const dueAt = new Date(last);
    dueAt.setUTCMonth(dueAt.getUTCMonth() + input.retentionMonths);
    if (dueAt.getTime() >= now) continue;
    due.push({
      contactId: ref.contactId,
      personId: ref.personId,
      relationships: links.map(({ kind, id, closedAt }) => ({
        kind,
        id,
        closedAt,
      })),
      dueSince: dueAt.toISOString(),
      proposals: input.proposals.flatMap(({ id, state: s }) => {
        const mine =
          (s.recipient?.contactId === ref.contactId &&
            s.recipient.personId === ref.personId) ||
          (!!s.leadId && !!leadPeople.get(s.leadId)?.has(key(ref)));
        const files: HeldFile[] = [];
        if (s.sentCopy) files.push("SENT_COPY");
        if (s.signedCopy) files.push("SIGNED_COPY");
        if (s.figures.length) files.push("FIGURE");
        return mine && files.length
          ? [{ id, title: s.title ?? "", files }]
          : [];
      }),
    });
  }
  return due;
}
