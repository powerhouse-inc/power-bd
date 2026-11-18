import type { LeadState } from "document-models/lead";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";

/** A person of an organisation, as the brief names them. */
export type BriefPerson = { id: string; name: string; role?: string | null };

/** An organisation as the brief reads it. */
export type BriefOrganisation = {
  id: string;
  name?: string | null;
  website?: string | null;
  notes?: string | null;
  country?: string | null;
  tags: readonly string[];
  people: readonly BriefPerson[];
};

/** The proposal facts the brief shows: the rows the Proposals place already computes. */
export type BriefProposal = {
  title: string;
  status: string;
  statusLabel: string;
  value: string;
  validUntilLabel: string | null;
  waitLabel: string;
};

export type BriefInput = {
  lead: Pick<
    LeadState,
    | "name"
    | "kind"
    | "status"
    | "organisationId"
    | "owner"
    | "angles"
    | "interactions"
    | "nextSteps"
    | "contactLinks"
    | "references"
    | "confidentialItems"
  >;
  /** Every organisation of the drive: the lead's own, and those its people come from. */
  organisations: readonly BriefOrganisation[];
  proposals: readonly BriefProposal[];
  neverClaims: readonly { claim: string; reason?: string | null }[];
  positioning: readonly { id: string; title: string }[];
  /** A team member's name for an address. */
  ownerName: (address: string) => string;
  /** Our calendar day, `YYYY-MM-DD`: what is late is said so. */
  today: string;
  /** Formats an instant in its own time zone ("Thu 19 Nov, 10:00 Europe/Ljubljana"). */
  when: (instant: string, timeZone?: string | null) => string;
};

/** One line of a section; `late` marks an overdue step. */
export type BriefLine = { text: string; detail?: string; late?: boolean };

export type BriefSection = {
  id:
    | "meeting"
    | "organisation"
    | "people"
    | "angles"
    | "history"
    | "steps"
    | "proposal"
    | "references"
    | "never"
    | "internal";
  heading: string;
  lines: BriefLine[];
  /** What the section says when it has nothing. */
  empty: string;
  /** Confidential: shown to the team, never copied for others or handed to the agent. */
  internal?: true;
};

export type Brief = {
  title: string;
  /** "Met · Sales lead · Mara Lind owns it · Kelvar Institute". */
  summary: string;
  sections: BriefSection[];
};

const label = (list: readonly { value: string; label: string }[], value: string | null | undefined) =>
  list.find((t) => t.value === value)?.label ?? "";
const FIT_ORDER = ["BEST", "GOOD", "LATER", "UNLIKELY"];
/** The references worth reading before a meeting, named as the references section names them. */
const REFERENCE_KINDS = [
  { value: "RESEARCH", label: "Research" },
  { value: "NOTE", label: "Note" },
  { value: "SOURCE", label: "Source" },
  { value: "COMPARABLE", label: "Comparable" },
];
const LIVE = new Set(["DRAFT", "APPROVED", "SENT"]);

/** The first paragraph of a note, at most 400 characters: a brief, not the record. */
function firstParagraph(text: string | null | undefined): string {
  const first = (text ?? "").trim().split(/\n\s*\n|\n/)[0]?.trim() ?? "";
  return first.length > 400 ? `${first.slice(0, 399).trimEnd()}…` : first;
}

/**
 * The brief for a meeting with a lead, assembled from the records alone: who
 * they are and who is who, why we talk to them, what happened, what is open,
 * where the proposal stands, what to read, what never to claim, and the
 * confidential items, marked internal. With `meetingId` it opens with that
 * meeting. Pure: the same records give the same brief.
 */
export function buildBrief(input: BriefInput, options: { meetingId?: string } = {}): Brief {
  const { lead, organisations } = input;
  const org = organisations.find((o) => o.id === lead.organisationId);
  const orgName = org?.name?.trim() || "No organisation linked";
  const personName = (contactId: string, personId: string | null | undefined) => {
    const o = organisations.find((x) => x.id === contactId);
    const p = personId ? o?.people.find((x) => x.id === personId) : undefined;
    return p?.name ?? o?.name ?? "Someone";
  };
  const meeting = options.meetingId ? lead.interactions.find((i) => i.id === options.meetingId) : undefined;
  const kindOf = (k: string) => label(VOCABULARY.interactionKind, k);

  const sections: BriefSection[] = [];
  if (meeting)
    sections.push({
      id: "meeting",
      heading: "The meeting",
      empty: "",
      lines: [
        {
          text: `${kindOf(meeting.kind)}${meeting.summary ? `: ${meeting.summary}` : ""}`,
          detail: [
            meeting.at ? input.when(meeting.at, meeting.timeZone) : "No time set",
            meeting.people.length > 0 ? `with ${meeting.people.map((p) => personName(p.contactId, p.personId)).join(", ")}` : "",
            meeting.teamMembers.length > 0 ? `for us: ${meeting.teamMembers.map(input.ownerName).join(", ")}` : "",
          ]
            .filter(Boolean)
            .join(" · "),
        },
      ],
    });

  const orgLines: BriefLine[] = [];
  if (org) {
    const facts = [org.website, org.country, org.tags.length > 0 ? org.tags.join(", ") : ""].filter(Boolean).join(" · ");
    orgLines.push({ text: org.name?.trim() || "Unnamed organisation", ...(facts ? { detail: facts } : {}) });
    const note = firstParagraph(org.notes);
    if (note) orgLines.push({ text: note });
  }
  sections.push({ id: "organisation", heading: "Who they are", lines: orgLines, empty: "No organisation is linked to this lead." });

  const linkRole = new Map(lead.contactLinks.map((c) => [`${c.contactId}:${c.personId ?? ""}`, c.role ?? ""]));
  const people: BriefLine[] = [];
  for (const p of org?.people ?? []) {
    const onLead = linkRole.get(`${org?.id}:${p.id}`);
    people.push({ text: p.name, detail: [p.role, onLead ? `on this lead: ${onLead}` : ""].filter(Boolean).join(" · ") || undefined });
  }
  for (const c of lead.contactLinks)
    if (c.contactId !== org?.id)
      people.push({ text: personName(c.contactId, c.personId), detail: [c.role, organisations.find((o) => o.id === c.contactId)?.name].filter(Boolean).join(" · ") || undefined });
  sections.push({ id: "people", heading: "Who is who", lines: people.map((l) => (l.detail ? l : { text: l.text })), empty: "No people are recorded yet." });

  const angles = [...lead.angles].sort((a, b) => FIT_ORDER.indexOf(a.fit) - FIT_ORDER.indexOf(b.fit));
  sections.push({
    id: "angles",
    heading: "Why we talk to them",
    empty: "No angle is written yet.",
    lines: angles.map((a) => {
      const stands = a.positioningId ? input.positioning.find((p) => p.id === a.positioningId)?.title : undefined;
      return { text: a.summary, detail: [`${label(VOCABULARY.fit, a.fit)} fit`, stands ? `stands for: ${stands}` : ""].filter(Boolean).join(" · ") };
    }),
  });

  const history = lead.interactions
    .filter((i) => i.id !== meeting?.id)
    .sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
  sections.push({
    id: "history",
    heading: "What happened",
    empty: "Nothing in the history yet.",
    lines: history.map((i) => ({
      text: `${kindOf(i.kind)}${i.summary ? `: ${i.summary}` : ""}`,
      detail: [label(VOCABULARY.interactionStatus, i.status), i.at ? input.when(i.at, i.timeZone) : "No time set"].join(" · "),
    })),
  });

  const steps = lead.nextSteps
    .filter((n) => !n.doneAt)
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
  sections.push({
    id: "steps",
    heading: "Open next steps",
    empty: "No open next step.",
    lines: steps.map((n) => {
      const day = n.dueDate?.slice(0, 10);
      const late = !!day && day < input.today;
      return {
        text: n.text,
        detail: [day ? `${late ? "was due" : "due"} ${day}` : "no date", n.owner ? input.ownerName(n.owner) : "no owner"].join(" · "),
        ...(late ? { late: true } : {}),
      };
    }),
  });

  sections.push({
    id: "proposal",
    heading: "Where the proposal stands",
    empty: "No live proposal.",
    lines: input.proposals
      .filter((p) => LIVE.has(p.status))
      .map((p) => ({
        text: `${p.title}: ${p.statusLabel}`,
        detail: [p.value, p.validUntilLabel ? `valid until ${p.validUntilLabel}` : "", p.waitLabel].filter(Boolean).join(" · "),
      })),
  });

  sections.push({
    id: "references",
    heading: "Read first",
    empty: "No vault note or comparable is linked.",
    lines: lead.references
      .filter((r) => REFERENCE_KINDS.some((k) => k.value === r.kind))
      .map((r) => ({ text: r.title, detail: label(REFERENCE_KINDS, r.kind) })),
  });

  sections.push({
    id: "never",
    heading: "Never claim",
    empty: "The Playbook has no never-claims.",
    lines: input.neverClaims.map((n) => (n.reason ? { text: n.claim, detail: n.reason } : { text: n.claim })),
  });

  sections.push({
    id: "internal",
    heading: "Internal only",
    internal: true,
    empty: "Nothing confidential on this lead.",
    lines: lead.confidentialItems.map((c) => ({ text: c.text })),
  });

  const summary = [
    label(VOCABULARY.leadStatus, lead.status),
    label(VOCABULARY.relationshipKind, lead.kind),
    lead.owner ? `${input.ownerName(lead.owner)} owns it` : "No owner",
    orgName,
  ]
    .filter(Boolean)
    .join(" · ");
  const name = lead.name?.trim() || "Untitled lead";
  return { title: meeting ? `Brief: ${kindOf(meeting.kind).toLowerCase()} with ${orgName}` : `Brief: ${name}`, summary, sections };
}

/** The brief as markdown; the internal section only when asked for, and marked so. */
export function briefMarkdown(brief: Brief, options: { internal: boolean }): string {
  const out = [`# ${brief.title}`, "", `_${brief.summary}_`];
  for (const s of brief.sections) {
    if (s.internal && !options.internal) continue;
    out.push("", `## ${s.internal ? `${s.heading} (confidential: do not share)` : s.heading}`, "");
    if (s.lines.length === 0) out.push(`_${s.empty}_`);
    for (const l of s.lines) out.push(`- ${l.late ? "**Late:** " : ""}${l.text}${l.detail ? ` (${l.detail})` : ""}`);
  }
  return out.join("\n");
}

/**
 * What the agent is asked, with the brief as its material. The confidential
 * items never go: the chat promises they stay out of it.
 */
export function agentPrompt(brief: Brief): string {
  return [
    "Prepare me for this meeting. Using the brief below, and what you can read in this space and the vault, write a short briefing: who they are, what they want, where we stand and what to aim for in this meeting. Then list five questions to ask. Suggest nothing on the never-claim list.",
    "",
    briefMarkdown(brief, { internal: false }),
  ].join("\n");
}
