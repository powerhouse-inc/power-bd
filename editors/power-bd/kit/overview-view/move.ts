import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { OPPORTUNITY_STATUSES, allowedMoves } from "../funding/index.js";
import { leadStage, opportunityStage } from "../overview/board.js";
import type { CommonStage, OverviewInput } from "../overview/index.js";
import { cardKey } from "./cards.js";

type LeadStatus = LeadState["status"];
type OpportunityStatus = OpportunityState["status"];

/** What the rules of a move read from a card's record. */
export type MoveCard =
  | {
      kind: "lead";
      status: LeadStatus;
      leadKind: LeadState["kind"];
      owner: string | null;
      organisationId: string | null;
      /** The status a parked lead returns to. */
      parkedFrom: LeadStatus | null;
    }
  | {
      kind: "opportunity";
      status: OpportunityStatus;
      owner: string | null;
      /** True when a submission has no outcome yet, which "submitted" needs. */
      openSubmission: boolean;
    }
  | { kind: "investor-row" };

type OptionBase = {
  /** The status' name, as the team says it. */
  label: string;
  /** True when the move is refused without a reason. */
  reason: boolean;
  /** True when the move closes the record for good. */
  final: boolean;
  /** The question that asks for the reason. */
  ask?: string;
};

/** One status a move can end in, and the action that reaches it. */
export type MoveOption = OptionBase &
  (
    | { act: "LEAD_STATUS"; status: LeadStatus }
    | { act: "PARK_LEAD"; status: "PARKED" }
    | { act: "UNPARK_LEAD"; status: LeadStatus }
    | { act: "OPPORTUNITY_STATUS"; status: OpportunityStatus }
  );

/**
 * What happens when a card is put on a stage: nothing (it is there already and
 * has no other status to take), the one status is set, one of several is
 * picked, a reason is asked for, a final status without a reason is confirmed,
 * the go-or-no-go decision is opened instead, or the stage refuses the card
 * and says why.
 */
export type MoveOutcome =
  | { kind: "stay" }
  | { kind: "set"; option: MoveOption }
  | { kind: "choose"; options: MoveOption[]; note?: string }
  | { kind: "reason"; option: MoveOption; note?: string }
  | { kind: "confirm"; option: MoveOption }
  | { kind: "decision"; why: string }
  | { kind: "refused"; why: string };

/** A column a card can be put on (a stage on the Overview, a status on the Leads board) and what a drop there does. */
export type ColumnTarget<K extends string> = {
  stage: K;
  outcome: MoveOutcome;
  /** True when the column takes the card: anything but "stay" and "refused". */
  accepts: boolean;
};

export type MoveTarget = ColumnTarget<CommonStage>;

const STAGES: CommonStage[] = ["NEW", "ACTIVE", "PARKED", "CLOSED"];
/** The lead statuses in the order the Leads board shows them. */
export const LEAD_STATUSES: LeadStatus[] = [
  "TO_CONTACT",
  "IN_TOUCH",
  "MEETING_SET",
  "MET",
  "PROPOSAL",
  "WON",
  "LOST",
  "PARKED",
];
const LEAD_ACTIVE: LeadStatus[] = [
  "IN_TOUCH",
  "MEETING_SET",
  "MET",
  "PROPOSAL",
];
const ASK: Partial<Record<string, string>> = {
  PARKED: "Why is it parked?",
  LOST: "Why was it lost?",
  REJECTED: "Why was it rejected?",
  WITHDRAWN: "Why was it withdrawn?",
};
const INVESTOR_LIMIT = "An investor lead goes no further than met";

const label = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((t) => t.value === v)?.label ?? "";
const stageLabel = (stage: CommonStage) => label(VOCABULARY.commonStage, stage);
const refused = (why: string): MoveOutcome => ({ kind: "refused", why });

function base(
  list: readonly { value: string; label: string }[],
  status: string,
  final: boolean,
): OptionBase {
  const ask = ASK[status];
  return {
    label: label(list, status),
    reason: ask !== undefined,
    final,
    ...(ask ? { ask } : {}),
  };
}

const leadOption = (status: LeadStatus): MoveOption => ({
  act: "LEAD_STATUS",
  status,
  ...base(VOCABULARY.leadStatus, status, status === "WON" || status === "LOST"),
});

const parkOption = (): MoveOption => ({
  act: "PARK_LEAD",
  status: "PARKED",
  ...base(VOCABULARY.leadStatus, "PARKED", false),
});

const unparkOption = (back: LeadStatus): MoveOption => ({
  act: "UNPARK_LEAD",
  status: back,
  ...base(VOCABULARY.leadStatus, back, false),
});

type LeadCard = Extract<MoveCard, { kind: "lead" }>;

/** What a lead needs before it goes past "to contact", or null when it has it. */
function leadMissing(card: LeadCard): string | null {
  if (card.owner && card.organisationId) return null;
  return card.owner
    ? "Link the lead to an organisation first"
    : card.organisationId
      ? "Give the lead an owner first"
      : "Give the lead an owner and an organisation first";
}

/** One option is set or asked about; several are picked from. Inside its own stage a card is never moved without a pick. */
function offer(
  options: MoveOption[],
  sameStage: boolean,
  note?: string,
): MoveOutcome {
  const extra = note ? { note } : {};
  const only = options.length === 1 && !sameStage ? options[0] : undefined;
  if (!only) return { kind: "choose", options, ...extra };
  return only.reason
    ? { kind: "reason", option: only, ...extra }
    : { kind: "set", option: only };
}

function leadMove(card: LeadCard, stage: CommonStage): MoveOutcome {
  const from = leadStage(card.status);
  if (card.status === "WON" || card.status === "LOST")
    return stage === from
      ? { kind: "stay" }
      : refused("A won or lost lead is final");
  if (card.status === "PARKED") {
    if (stage === "PARKED") return { kind: "stay" };
    const back = card.parkedFrom;
    if (!back) return refused("Open the lead to take it off hold");
    return leadStage(back) === stage
      ? { kind: "set", option: unparkOption(back) }
      : refused(
          `Take it off hold first: it returns to ${label(VOCABULARY.leadStatus, back)}, in ${stageLabel(leadStage(back))}`,
        );
  }
  if (stage === "NEW")
    return card.status === "TO_CONTACT"
      ? { kind: "stay" }
      : { kind: "set", option: leadOption("TO_CONTACT") };
  // Past "to contact" a lead needs an owner and an organisation.
  const missing = leadMissing(card);
  if (missing) return refused(missing);
  const investor = card.leadKind === "INVESTOR";
  const note = investor ? INVESTOR_LIMIT : undefined;
  if (stage === "PARKED") return { kind: "reason", option: parkOption() };
  const to: LeadStatus[] =
    stage === "ACTIVE"
      ? LEAD_ACTIVE.filter((s) => s !== card.status)
      : ["WON", "LOST"];
  return offer(
    to
      .filter((s) => !investor || (s !== "PROPOSAL" && s !== "WON"))
      .map(leadOption),
    stage === from,
    note,
  );
}

/**
 * What putting a lead on one status column does, by the same rules as the
 * lead page: a won or lost lead stays, a parked lead only returns to where it
 * came from, past "to contact" it needs an owner and an organisation, an
 * investor lead stops at met, parking and losing ask why, and winning, final
 * without a reason, asks to confirm.
 */
export function leadStatusMove(card: LeadCard, to: LeadStatus): MoveOutcome {
  if (to === card.status) return { kind: "stay" };
  if (card.status === "WON" || card.status === "LOST")
    return refused("A won or lost lead is final");
  if (card.status === "PARKED") {
    const back = card.parkedFrom;
    if (!back) return refused("Open the lead to take it off hold");
    return to === back
      ? { kind: "set", option: unparkOption(back) }
      : refused(
          `Take it off hold first: it returns to ${label(VOCABULARY.leadStatus, back)}`,
        );
  }
  if (to === "TO_CONTACT")
    return { kind: "set", option: leadOption("TO_CONTACT") };
  const missing = leadMissing(card);
  if (missing) return refused(missing);
  if (to === "PARKED") return { kind: "reason", option: parkOption() };
  if (card.leadKind === "INVESTOR" && (to === "PROPOSAL" || to === "WON"))
    return refused(INVESTOR_LIMIT);
  const option = leadOption(to);
  if (option.reason) return { kind: "reason", option };
  return option.final ? { kind: "confirm", option } : { kind: "set", option };
}

/** The Leads board's columns with what each does to the lead. */
export function leadStatusTargets(card: LeadCard): ColumnTarget<LeadStatus>[] {
  return LEAD_STATUSES.map((stage) => {
    const outcome = leadStatusMove(card, stage);
    return {
      stage,
      outcome,
      accepts: outcome.kind !== "stay" && outcome.kind !== "refused",
    };
  });
}

const DECIDED = new Set<OpportunityStatus>([
  "PREPARING",
  "SUBMITTED",
  "NEXT_STAGE",
]);

function opportunityMove(
  card: Extract<MoveCard, { kind: "opportunity" }>,
  stage: CommonStage,
): MoveOutcome {
  const from = opportunityStage(card.status);
  const moves = allowedMoves(card.status);
  const to = OPPORTUNITY_STATUSES.filter(
    (s) => moves.includes(s) && opportunityStage(s) === stage,
  );
  if (to.length === 0) {
    if (stage === from) return { kind: "stay" };
    if (moves.length === 0)
      return refused("A closed funding opportunity is final");
    if (card.status === "WATCHING")
      return refused(
        "Move it to New first: a watched opportunity is evaluated before anything else",
      );
    if (DECIDED.has(card.status))
      return refused(
        stage === "NEW"
          ? "After the go decision a funding opportunity does not go back to New"
          : "After the go decision a funding opportunity moves on or closes; it is not parked",
      );
    // To evaluate or deciding, put on Active or Closed: only the decision goes there.
    return {
      kind: "decision",
      why: "Go or no-go is the team lead's decision, taken by a person on the opportunity's page",
    };
  }
  const blocker = (s: OpportunityStatus) =>
    s !== "WATCHING" && s !== "TO_EVALUATE" && !card.owner
      ? "Give it an owner first"
      : s === "SUBMITTED" && card.status === "PREPARING" && !card.openSubmission
        ? "Mark a submission on its page first"
        : null;
  const open = to.filter((s) => blocker(s) === null);
  if (open.length === 0) return refused(blocker(to[0]) ?? "");
  return offer(
    open.map((status) => ({
      act: "OPPORTUNITY_STATUS",
      status,
      ...base(
        VOCABULARY.opportunityStatus,
        status,
        opportunityStage(status) === "CLOSED",
      ),
    })),
    stage === from,
  );
}

/** What putting the card on the stage does, by the rules its record keeps. */
export function cardMove(card: MoveCard, stage: CommonStage): MoveOutcome {
  if (card.kind === "lead") return leadMove(card, stage);
  if (card.kind === "opportunity") return opportunityMove(card, stage);
  return stage === "NEW"
    ? { kind: "stay" }
    : refused("Start a relationship from the investor's row first");
}

/** The four stages with what each does to the card. */
export function moveTargets(card: MoveCard): MoveTarget[] {
  return STAGES.map((stage) => {
    const outcome = cardMove(card, stage);
    return {
      stage,
      outcome,
      accepts: outcome.kind !== "stay" && outcome.kind !== "refused",
    };
  });
}

/** True when some stage takes the card, so it is worth picking up. */
export const canMove = (card: MoveCard): boolean =>
  moveTargets(card).some((t) => t.accepts);

const orList = (labels: string[]) =>
  labels.length > 1
    ? `${labels.slice(0, -1).join(", ")} or ${labels.at(-1)}`
    : labels.join("");

/** One short line for a stage: what a drop there does, or why it is refused. */
export function moveHint(outcome: MoveOutcome): string {
  switch (outcome.kind) {
    case "stay":
      return "";
    case "set":
      return outcome.option.act === "UNPARK_LEAD"
        ? `Comes off hold · returns to ${outcome.option.label}`
        : `Becomes ${outcome.option.label}`;
    case "choose":
      return `Pick: ${orList(outcome.options.map((o) => o.label))}`;
    case "reason":
      return `Becomes ${outcome.option.label} · asks why`;
    case "confirm":
      return `Becomes ${outcome.option.label} · asks to confirm`;
    case "decision":
      return "Go or no-go is decided on its page";
    case "refused":
      return outcome.why;
  }
}

/** The line that answers the fear of a risky move: closing or parking. */
export function moveReassurance(outcome: MoveOutcome): string | null {
  const options =
    outcome.kind === "choose"
      ? outcome.options
      : outcome.kind === "reason" || outcome.kind === "confirm"
        ? [outcome.option]
        : [];
  const final = options.find((o) => o.final);
  if (final)
    return `Nothing is deleted: a closed ${final.act === "LEAD_STATUS" ? "lead" : "funding opportunity"} keeps its history. Closing is final.`;
  return options.some((o) => o.act === "PARK_LEAD")
    ? "Nothing is lost: taken off hold, it returns to where it was."
    : null;
}

/** What the rules of a move read from a lead. */
export const leadMoveCard = (s: LeadState): LeadCard => ({
  kind: "lead",
  status: s.status,
  leadKind: s.kind ?? null,
  owner: s.owner ?? null,
  organisationId: s.organisationId ?? null,
  parkedFrom: s.parkedFrom ?? null,
});

/** The move facts of every card on the board, by `cardKey`. */
export function moveCards(
  input: Pick<OverviewInput, "leads" | "opportunities" | "investorLists">,
): Map<string, MoveCard> {
  const cards = new Map<string, MoveCard>();
  for (const { id, state: s } of input.leads)
    cards.set(cardKey({ kind: "lead", id }), leadMoveCard(s));
  for (const { id, state: s } of input.opportunities)
    cards.set(cardKey({ kind: "opportunity", id }), {
      kind: "opportunity",
      status: s.status,
      owner: s.owner || null,
      openSubmission: s.submissions.some((x) => !x.outcome),
    });
  for (const { id, state } of input.investorLists)
    for (const row of state.rows)
      if (row.state === "SHORTLISTED")
        cards.set(cardKey({ kind: "investor-row", id, rowId: row.id }), {
          kind: "investor-row",
        });
  return cards;
}
