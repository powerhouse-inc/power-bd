/**
 * Proposals as the lists show them: what each waits on, its value, its row in
 * the Proposals place, the next action it gives its lead, and the badge a lead
 * carries. Pure: today's day is an input.
 */
import type { DecisionStatus } from "document-models/decision";
import type { LeadState } from "document-models/lead";
import type { PlaybookState } from "document-models/playbook";
import type { ProposalState } from "document-models/proposal";
import { formatMoney, formatMoneyCompact } from "../format/index.js";
import { isLiveProposal, valueOf } from "../overview/proposals.js";
import type { Record_ } from "../overview/types.js";
import { checkProposal } from "../proposal-check/proposal-check.js";
import {
  PROPOSAL_STATUS,
  checkInput,
  type ProposalStatus,
} from "../proposal-view/index.js";

/** "Fri 4 Dec" for a `YYYY-MM-DD` day. */
const dayText = (day: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00.000Z`));

const plural = (n: number) => `${n} ${n === 1 ? "finding" : "findings"}`;

/** What has to happen before a proposal moves on, and whose move it is. */
export type Wait =
  | { kind: "writing" }
  | { kind: "findings"; count: number }
  | { kind: "approval" }
  | { kind: "sending" }
  | { kind: "answer"; until: string | null; overdue: boolean }
  | { kind: "nothing" };

/** A proposal that holds nothing yet: it is still to be written. */
export function isBlank(p: ProposalState): boolean {
  return (
    p.packages.length === 0 &&
    p.deliverables.length === 0 &&
    p.options.length === 0 &&
    p.sections.length === 0 &&
    p.useCases.length === 0
  );
}

/**
 * Writing, findings to fix, approval, sending, the client's answer (until the
 * valid-until day, overdue after it), or nothing. `today` is `YYYY-MM-DD`.
 */
export function waitsOn(input: {
  status: ProposalStatus;
  findings: number;
  blank: boolean;
  validUntil: string | null | undefined;
  today: string;
}): Wait {
  switch (input.status) {
    case "DRAFT":
      if (input.blank) return { kind: "writing" };
      return input.findings > 0
        ? { kind: "findings", count: input.findings }
        : { kind: "approval" };
    case "APPROVED":
      return { kind: "sending" };
    case "SENT": {
      const until = input.validUntil ? input.validUntil.slice(0, 10) : null;
      return {
        kind: "answer",
        until,
        overdue: until !== null && until < input.today,
      };
    }
    default:
      return { kind: "nothing" };
  }
}

/** The wait as the "Waits on" column words it. */
export function waitLabel(wait: Wait): string {
  switch (wait.kind) {
    case "writing":
      return "Writing";
    case "findings":
      return `${plural(wait.count)} to fix`;
    case "approval":
      return "Approval";
    case "sending":
      return "Sending";
    case "answer":
      if (!wait.until) return "The client's answer";
      return wait.overdue
        ? `The client's answer, due since ${dayText(wait.until)}`
        : `The client's answer, until ${dayText(wait.until)}`;
    default:
      return "Nothing";
  }
}

export type Next = { what: string; why: string };

/** The one thing to do about a proposal now; null when it waits on nothing. */
export function proposalNext(wait: Wait): Next | null {
  switch (wait.kind) {
    case "writing":
      return { what: "Write the proposal", why: "It holds nothing yet" };
    case "findings":
      return {
        what: `Fix ${plural(wait.count)}`,
        why: "Approval opens when nothing is left to fix",
      };
    case "approval":
      return {
        what: "Approve the proposal",
        why: "Nothing is left to fix; only a person approves",
      };
    case "sending":
      return {
        what: "Send the proposal",
        why: "Send it yourself, then mark it sent: nothing is sent from Power BD",
      };
    case "answer":
      if (wait.until && wait.overdue)
        return {
          what: "Record the client's answer",
          why: `It was valid until ${dayText(wait.until)}, and no answer is recorded`,
        };
      return {
        what: wait.until
          ? `Waiting for an answer until ${dayText(wait.until)}`
          : "Waiting for an answer",
        why: "Record the client's answer when it comes",
      };
    default:
      return null;
  }
}

const OPEN: readonly ProposalStatus[] = ["DRAFT", "APPROVED", "SENT"];

/** Proposals not yet answered, withdrawn or superseded: the sidebar's count. */
export function openProposalCount(statuses: readonly ProposalStatus[]): number {
  return statuses.filter((s) => OPEN.includes(s)).length;
}

/** "€8,000.00", or "€8,000.00 to €20,000.00" for a range; null without a price. */
function valueText(p: ProposalState, compact: boolean): string | null {
  const v = valueOf(p);
  if (!v) return null;
  const currency = p.currency;
  const money = (amount: number) =>
    compact && currency
      ? formatMoneyCompact(amount, currency)
      : formatMoney(amount, currency);
  return v.low === v.high
    ? money(v.low)
    : `${money(v.low)} to ${money(v.high)}`;
}

/** Whether a value is a draft's: shown, and counted nowhere. */
const isDraftValue = (status: ProposalStatus) =>
  status === "DRAFT" || status === "APPROVED";

export type ProposalRow = {
  id: string;
  title: string;
  leadId: string | null;
  /** The lead's name; null when the proposal names no lead the drive holds. */
  leadName: string | null;
  organisation: string | null;
  status: ProposalStatus;
  statusLabel: string;
  tone: string;
  /** The chosen option's total when accepted, else the range across options, in the proposal's currency. */
  value: string;
  /** False while no option has a price. */
  priced: boolean;
  /** "draft" beside a value that is not counted yet; null otherwise. */
  valueNote: "draft" | null;
  /** `YYYY-MM-DD`. */
  validUntil: string | null;
  validUntilLabel: string | null;
  wait: Wait;
  waitLabel: string;
  next: Next | null;
};

export type ProposalRowsInput = {
  proposals: readonly Record_<ProposalState>[];
  leads: readonly Record_<
    Pick<LeadState, "name" | "organisationId" | "confidentialItems">
  >[];
  /** Organisation names by id. */
  organisations: Partial<Record<string, string>>;
  playbook: Pick<PlaybookState, "positioning" | "neverClaims"> | undefined;
  decisions: readonly { id: string; status: DecisionStatus }[];
  /** `YYYY-MM-DD`. */
  today: string;
};

/** Ours to move first, then the client's, then those that wait on nothing. */
const rank = (w: Wait) =>
  w.kind === "nothing" ? 2 : w.kind === "answer" && !w.overdue ? 1 : 0;

/** Every proposal as a row: what waits on the team first, then on the client by valid-until day, then the rest. */
export function proposalRows(input: ProposalRowsInput): ProposalRow[] {
  const rows = input.proposals.map(({ id, state: p }): ProposalRow => {
    const lead = input.leads.find((l) => l.id === p.leadId)?.state;
    const findings =
      p.status === "DRAFT"
        ? checkProposal(
            checkInput({
              proposal: p,
              playbook: input.playbook,
              confidentialItems: lead?.confidentialItems,
              decisions: input.decisions,
              today: input.today,
            }),
          ).length
        : 0;
    const wait = waitsOn({
      status: p.status,
      findings,
      blank: isBlank(p),
      validUntil: p.validUntil,
      today: input.today,
    });
    const value = valueText(p, false);
    const validUntil = p.validUntil ? p.validUntil.slice(0, 10) : null;
    const organisation = lead?.organisationId
      ? input.organisations[lead.organisationId]?.trim()
      : undefined;
    return {
      id,
      title: p.title?.trim() || "Untitled proposal",
      leadId: p.leadId ?? null,
      leadName: lead ? lead.name?.trim() || "Untitled lead" : null,
      organisation: organisation || null,
      status: p.status,
      statusLabel: PROPOSAL_STATUS[p.status].label,
      tone: PROPOSAL_STATUS[p.status].tone,
      value: value ?? "No price yet",
      priced: value !== null,
      valueNote: value && isDraftValue(p.status) ? "draft" : null,
      validUntil,
      validUntilLabel: validUntil ? dayText(validUntil) : null,
      wait,
      waitLabel: waitLabel(wait),
      next: proposalNext(wait),
    };
  });
  const day = (r: ProposalRow) => r.validUntil ?? "9999";
  return rows
    .map((row, i) => ({ row, i }))
    .sort(
      (a, b) =>
        rank(a.row.wait) - rank(b.row.wait) ||
        day(a.row).localeCompare(day(b.row)) ||
        a.i - b.i,
    )
    .map(({ row }) => row);
}

/** How many open proposals wait on the team, and how many on the client. */
export function waitSummary(rows: readonly ProposalRow[]): {
  us: number;
  client: number;
} {
  return {
    us: rows.filter((r) => rank(r.wait) === 0).length,
    client: rows.filter((r) => rank(r.wait) === 1).length,
  };
}

export type LeadProposalNext = Next & {
  /** The button's label. */
  button: string;
  /** The proposal to open; null when one is to be started. */
  proposalId: string | null;
};

/** What the team can do now comes before waiting. */
const URGENCY: Record<Wait["kind"], number> = {
  sending: 0,
  approval: 1,
  findings: 2,
  writing: 3,
  answer: 4,
  nothing: 5,
};

/**
 * The next action a lead takes from its proposals while it is at "proposal":
 * the open proposal's, or starting one when none is open. Null when the lead
 * is elsewhere, is an investor lead (which has no proposals), or a proposal
 * was accepted (the lead's own next action then applies).
 */
export function leadProposalNext(input: {
  status: string;
  kind: string | null | undefined;
  /** The lead's own proposals. */
  rows: readonly Pick<ProposalRow, "id" | "status" | "wait">[];
}): LeadProposalNext | null {
  if (input.status !== "PROPOSAL" || input.kind === "INVESTOR") return null;
  const open = input.rows
    .filter((r) => r.wait.kind !== "nothing")
    .sort((a, b) => URGENCY[a.wait.kind] - URGENCY[b.wait.kind])
    .at(0);
  const next = open ? proposalNext(open.wait) : null;
  if (open && next)
    return { ...next, button: "Open the proposal", proposalId: open.id };
  if (input.rows.some((r) => r.status === "ACCEPTED")) return null;
  return {
    what: "Write the proposal",
    why:
      input.rows.length === 0
        ? "This lead is at proposal and has none yet"
        : "No proposal on this lead is open",
    button: "Start a proposal",
    proposalId: null,
  };
}

export type ProposalBadge = {
  status: ProposalStatus;
  label: string;
  tone: string;
  /** A draft's or an approved proposal's value: shown as a draft, counted nowhere. */
  draftValue: string | null;
  /** How many other proposals the lead has. */
  more: number;
};

/** The proposal a lead's badge shows: the furthest along first. */
const LEADING: readonly ProposalStatus[] = [
  "ACCEPTED",
  "SENT",
  "APPROVED",
  "DRAFT",
  "DECLINED",
  "WITHDRAWN",
  "SUPERSEDED",
];

/** Per lead id: the badge that says it has a proposal, and where that proposal stands. */
export function proposalBadges(
  proposals: readonly Record_<ProposalState>[],
): Partial<Record<string, ProposalBadge>> {
  const byLead = new Map<string, ProposalState[]>();
  for (const { state: p } of proposals)
    if (p.leadId) byLead.set(p.leadId, [...(byLead.get(p.leadId) ?? []), p]);
  const badges: Partial<Record<string, ProposalBadge>> = {};
  for (const [leadId, list] of byLead) {
    const [first] = [...list].sort(
      (a, b) => LEADING.indexOf(a.status) - LEADING.indexOf(b.status),
    );
    badges[leadId] = {
      status: first.status,
      label: PROPOSAL_STATUS[first.status].label,
      tone: PROPOSAL_STATUS[first.status].tone,
      draftValue:
        isDraftValue(first.status) && !isLiveProposal(first)
          ? valueText(first, true)
          : null,
      more: list.length - 1,
    };
  }
  return badges;
}
