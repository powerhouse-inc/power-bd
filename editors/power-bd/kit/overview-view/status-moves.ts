import type { InvestorListState } from "document-models/investor-list";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { OPPORTUNITY_STATUSES, allowedMoves } from "../funding/index.js";
import {
  GO_NO_GO,
  base,
  columnTargets,
  label,
  refused,
  type ColumnTarget,
  type MoveCard,
  type MoveOption,
  type MoveOutcome,
} from "./move.js";

/*
 * What putting a card on one status column does, for the boards whose columns
 * are statuses: Funding, Investors and Proposals. Each follows its record
 * page's rules and its reducer: a drop never takes a step the page keeps for a
 * person, and asks for whatever the reducer needs (a reason, an option).
 */

type OpportunityStatus = OpportunityState["status"];
type ProposalStatus = ProposalState["status"];
type InvestorRowState = InvestorListState["rows"][number]["state"];
type OppCard = Extract<MoveCard, { kind: "opportunity" }>;

const offer = (option: MoveOption): MoveOutcome =>
  option.reason
    ? { kind: "reason", option }
    : option.final
      ? { kind: "confirm", option }
      : { kind: "set", option };

// ---- Funding -----------------------------------------------------------------

/** The opportunity statuses in the order the Funding board shows them. */
export const FUNDING_STATUSES: readonly OpportunityStatus[] =
  OPPORTUNITY_STATUSES;
const CLOSED_OPPORTUNITY = new Set<OpportunityStatus>([
  "AWARDED",
  "REJECTED",
  "WITHDRAWN",
  "NO_GO",
]);
const oppLabel = (s: OpportunityStatus) =>
  label(VOCABULARY.opportunityStatus, s);

/** Why a status cannot be reached from where the opportunity is, said as what to do first. */
function opportunityNotAllowed(
  from: OpportunityStatus,
  to: OpportunityStatus,
): string {
  if (from === "WATCHING")
    return "Move it to To evaluate first: a watched opportunity is evaluated before anything else";
  if (from === "TO_EVALUATE" || from === "DECIDING")
    return "Go or no-go comes first: it is decided on the opportunity's page";
  if (["WATCHING", "TO_EVALUATE", "DECIDING", "NO_GO"].includes(to))
    return "After the go decision a funding opportunity moves on or closes";
  if (from === "PREPARING") return "Mark it submitted first";
  if (from === "NEXT_STAGE" && to === "SUBMITTED")
    return "Move it to Preparing first: the next stage is prepared, then submitted";
  return `It does not go from ${oppLabel(from)} back to ${oppLabel(to)}`;
}

/**
 * What putting a funding opportunity on one status column does: a closed one
 * stays, go or no-go opens the opportunity's page, only the moves a person may
 * make by hand are offered, past "to evaluate" it needs an owner, "submitted"
 * needs a submission with no outcome, rejected and withdrawn ask why, and
 * awarded, final without a reason, asks to confirm.
 */
export function opportunityStatusMove(
  card: OppCard,
  to: OpportunityStatus,
): MoveOutcome {
  const from = card.status;
  if (to === from) return { kind: "stay" };
  if (CLOSED_OPPORTUNITY.has(from))
    return refused("A closed funding opportunity is final");
  if (
    (from === "TO_EVALUATE" || from === "DECIDING") &&
    (to === "PREPARING" || to === "NO_GO")
  )
    return GO_NO_GO;
  if (!allowedMoves(from).includes(to))
    return refused(opportunityNotAllowed(from, to));
  if (to !== "WATCHING" && to !== "TO_EVALUATE" && !card.owner)
    return refused("Give it an owner first");
  if (from === "PREPARING" && to === "SUBMITTED" && !card.openSubmission)
    return refused("Mark a submission on its page first");
  return offer({
    act: "OPPORTUNITY_STATUS",
    status: to,
    ...base(VOCABULARY.opportunityStatus, to, CLOSED_OPPORTUNITY.has(to)),
  });
}

/** The Funding board's columns with what each does to the opportunity. */
export const opportunityStatusTargets = (
  card: OppCard,
): ColumnTarget<OpportunityStatus>[] =>
  columnTargets(FUNDING_STATUSES, (to) => opportunityStatusMove(card, to));

// ---- Investors ---------------------------------------------------------------

/** The investor row states in the order the Investors board shows them. */
export const INVESTOR_ROW_STATES: readonly InvestorRowState[] = [
  "LISTED",
  "SHORTLISTED",
  "EXCLUDED",
  "ENGAGED",
];

/** What the rules of a move read from an investor row. */
export type InvestorRowCard = { state: InvestorRowState };

/** Engaging is never done by a drop: it creates the organisation and the investor lead, in its own panel. */
export const START_RELATIONSHIP: MoveOutcome = {
  kind: "decision",
  why: "Starting a relationship creates the organisation and its investor lead, so it is started from its own panel",
  hint: "Starts a relationship · opens its panel",
  open: "Start relationship",
  people: false,
};

/**
 * What putting an investor row on one state column does: an engaged row is a
 * relationship now and stays, shortlisting and putting back on the list are
 * done at once, excluding asks why, and engaging opens "Start relationship",
 * offered from the shortlist only, as on the list.
 */
export function investorRowMove(
  card: InvestorRowCard,
  to: InvestorRowState,
): MoveOutcome {
  if (to === card.state) return { kind: "stay" };
  if (card.state === "ENGAGED")
    return refused("An engaged investor is a relationship now: open its lead");
  if (to === "ENGAGED")
    return card.state === "SHORTLISTED"
      ? START_RELATIONSHIP
      : refused("Shortlist it first: a relationship starts from the shortlist");
  const terms = VOCABULARY.investorRow;
  if (to === "SHORTLISTED")
    return offer({
      act: "SHORTLIST_ROW",
      status: "SHORTLISTED",
      ...base(terms, "SHORTLISTED", false),
    });
  if (to === "LISTED")
    return offer({
      act: "RELIST_ROW",
      status: "LISTED",
      ...base(terms, "LISTED", false),
    });
  return offer({
    act: "EXCLUDE_ROW",
    status: "EXCLUDED",
    ...base(terms, "EXCLUDED", false),
  });
}

/** The Investors board's columns with what each does to the row. */
export const investorRowTargets = (
  card: InvestorRowCard,
): ColumnTarget<InvestorRowState>[] =>
  columnTargets(INVESTOR_ROW_STATES, (to) => investorRowMove(card, to));

// ---- Proposals ---------------------------------------------------------------

/** The proposal statuses in the order the Proposals board shows them. */
export const PROPOSAL_STATUSES: readonly ProposalStatus[] = [
  "DRAFT",
  "APPROVED",
  "SENT",
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
  "SUPERSEDED",
];

/** What the rules of a move read from a proposal: its status and the options a client can accept. */
export type ProposalCard = {
  status: ProposalStatus;
  options: { id: string; label: string }[];
};

const ENDED = new Set<ProposalStatus>([
  "ACCEPTED",
  "DECLINED",
  "WITHDRAWN",
  "SUPERSEDED",
]);
const SUPERSEDED_WHY =
  "A proposal is superseded when the revision that replaces it is marked sent";

/** Approving is a person's step, after the proposal's checks. */
export const APPROVE_ON_PAGE: MoveOutcome = {
  kind: "decision",
  why: "Approval is given by a person on the proposal's page, after its checks",
  hint: "Approved by a person on its page",
  open: "Open to approve",
  people: true,
};

/** Marking sent is a person's step: nothing is sent from Power BD. */
export const MARK_SENT_ON_PAGE: MoveOutcome = {
  kind: "decision",
  why: "Nothing is sent from Power BD: a person sends it, then marks it sent on the proposal's page",
  hint: "Marked sent by a person on its page",
  open: "Open to mark sent",
  people: true,
};

/** Of the proposal facts the board reads, from its record. */
export const proposalMoveCard = (s: ProposalState): ProposalCard => ({
  status: s.status,
  options: s.options.map((o) => ({ id: o.id, label: o.label })),
});

/**
 * What putting a proposal on one status column does: approving and marking
 * sent open the proposal's page (both are a person's steps), reopening an
 * approved draft asks to confirm, withdrawing and declining ask why,
 * accepting asks which option the client chose, superseding happens only when
 * a revision is marked sent, and an answered, withdrawn or superseded
 * proposal stays.
 */
export function proposalStatusMove(
  card: ProposalCard,
  to: ProposalStatus,
): MoveOutcome {
  const from = card.status;
  const terms = VOCABULARY.proposalStatus;
  if (to === from) return { kind: "stay" };
  if (ENDED.has(from))
    return refused(
      from === "DECLINED" && to === "SUPERSEDED"
        ? SUPERSEDED_WHY
        : "An answered, withdrawn or superseded proposal is final",
    );
  if (to === "SUPERSEDED")
    return refused(
      from === "SENT"
        ? SUPERSEDED_WHY
        : "Only a sent or declined proposal is superseded",
    );
  if (to === "WITHDRAWN")
    return offer({
      act: "WITHDRAW_PROPOSAL",
      status: "WITHDRAWN",
      ...base(terms, "WITHDRAWN", true),
    });
  if (from === "DRAFT")
    return to === "APPROVED"
      ? APPROVE_ON_PAGE
      : refused(
          to === "SENT"
            ? "Approve it first: a draft is approved before it is sent"
            : "Send it first: the client answers a sent proposal",
        );
  if (from === "APPROVED") {
    if (to === "SENT") return MARK_SENT_ON_PAGE;
    if (to === "DRAFT")
      return {
        kind: "confirm",
        option: {
          act: "REOPEN_PROPOSAL",
          status: "DRAFT",
          ...base(terms, "DRAFT", false),
          verb: "Reopen to edit",
        },
      };
    return refused("Mark it sent first: the client answers a sent proposal");
  }
  // Sent: the client's answer, or nothing.
  if (to === "DECLINED")
    return offer({
      act: "DECLINE_PROPOSAL",
      status: "DECLINED",
      ...base(terms, "DECLINED", true),
    });
  if (to === "ACCEPTED") {
    if (card.options.length === 0)
      return refused(
        "Add an option on its page first: an acceptance names the option chosen",
      );
    const options: MoveOption[] = card.options.map((o) => ({
      act: "ACCEPT_PROPOSAL",
      status: "ACCEPTED",
      optionId: o.id,
      ...base(terms, "ACCEPTED", true),
      label: o.label || "Untitled option",
      verb: `The client accepted “${o.label || "Untitled option"}”`,
    }));
    return options.length === 1
      ? { kind: "confirm", option: { ...options[0], label: "Accepted" } }
      : {
          kind: "choose",
          options,
          note: "Pick the option the client chose",
        };
  }
  return refused(
    "A sent proposal is not reopened: withdraw it, or revise it into a new one",
  );
}

/** The Proposals board's columns with what each does to the proposal. */
export const proposalStatusTargets = (
  card: ProposalCard,
): ColumnTarget<ProposalStatus>[] =>
  columnTargets(PROPOSAL_STATUSES, (to) => proposalStatusMove(card, to));
