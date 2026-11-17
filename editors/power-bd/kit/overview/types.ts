import type { BdSettingsState } from "document-models/bd-settings";
import type { DecisionState } from "document-models/decision";
import type { InvestorListState } from "document-models/investor-list";
import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";

/** A document's id with its state: the plain record the kit takes in. */
export type Record_<S> = { id: string; state: S };

export type OverviewInput = {
  /** The current instant, UTC ISO string. */
  now: string;
  leads: Record_<LeadState>[];
  opportunities: Record_<OpportunityState>[];
  investorLists: Record_<InvestorListState>[];
  decisions: Record_<DecisionState>[];
  /** Every proposal; only the live ones of a lead count. */
  proposals: Record_<ProposalState>[];
  settings: Pick<BdSettingsState, "timeZone" | "dueWindowDays">;
};

export type CommonStage = "NEW" | "ACTIVE" | "PARKED" | "CLOSED";
export type ItemKind = "lead" | "opportunity" | "investor-row" | "decision";

export type ItemRef = {
  kind: ItemKind;
  /** Document id; for an investor row, the list's id. */
  id: string;
  /** Investor row id inside its list. */
  rowId?: string;
  name: string;
};

export type BoardEntry = ItemRef & { stage: CommonStage };
export type Board = Record<CommonStage, BoardEntry[]>;

export type DueKind =
  | "NEXT_STEP"
  | "MEETING"
  | "OPPORTUNITY_STEP"
  | "DECIDE_BY"
  | "EXPECTED_OPENING"
  | "PROPOSAL_VALID_UNTIL";

export type DueItem = {
  due: DueKind;
  source: ItemRef;
  label: string;
  /** Our calendar day, `YYYY-MM-DD`. */
  day: string;
  /** Our time `HH:mm`; absent for whole-day dates. */
  ourTime?: string;
  /** The funder's or meeting's local day and time and zone; absent for whole-day dates. */
  theirDay?: string;
  theirTime?: string;
  theirTimeZone?: string;
  /** Team addresses it concerns: the owner, or each attendee. */
  people: string[];
};

export const SLIPPING_REASONS = [
  "NO_OWNER",
  "NO_NEXT_STEP",
  "NEXT_STEP_OVERDUE",
  "FUNDING_DATE_PASSED",
  "DECISION_ANSWERED_REVIEW",
  "CONDITION_RECHECK",
  "MEETING_NOT_RECORDED",
  "DECISION_OVERDUE",
  "PROPOSAL_UNANSWERED",
  "PROPOSAL_ANSWER_NOT_REFLECTED",
] as const;
export type SlippingReason = (typeof SLIPPING_REASONS)[number];

/**
 * When a slipping reason started: the overdue due date (`YYYY-MM-DD`) or the instant
 * (ISO), and the whole days from it to our today.
 */
export type SlippingSince = { from: string; days: number };

export type SlippingItem = {
  source: ItemRef;
  reasons: SlippingReason[];
  /** The start of each reason that has one; "no owner" and "no next step" have none. */
  since: Partial<Record<SlippingReason, SlippingSince>>;
};

/** A lead's value in one currency: the amount, or the range `amount` to `upper`. */
export type LeadValue = { currency: string; amount: number; upper?: number };
export type LiveProposal = { id: string; title: string; status: string };

export type Overview = {
  board: Board;
  due: DueItem[];
  slipping: SlippingItem[];
  /** Per lead id: its value from live proposals, per currency. Leads without one are absent. */
  leadValues: Record<string, LeadValue[]>;
  /** Per lead id: its live (sent or accepted) proposals. */
  liveProposals: Record<string, LiveProposal[]>;
};

export type CurrencyTotal = { currency: string; amount: number; count: number };

/** An item as the lists show it: what the "mine" view and the filters read. */
export type ViewItem = ItemRef & {
  status: string;
  /** Team address, or `null` when nobody owns it. */
  owner: string | null;
};

export type ViewFilter = {
  kind?: ItemKind;
  /** A team address, compared without regard to letter case. */
  owner?: string;
  status?: string;
};

export type OwnerName = { address: string; name: string; active: boolean };
