import type { ItemRef, LeadValue, OverviewInput } from "../overview/index.js";
import { proposalBadges, type ProposalBadge } from "../proposal-list/index.js";

/** What kind of relationship a card is: a lead by its type, funding, or a shortlisted investor. */
export type CardMark =
  | "SALES"
  | "PARTNERSHIP"
  | "EXCHANGE"
  | "INVESTOR"
  | "LEAD"
  | "FUNDING"
  | "SHORTLISTED";

/** What a board card shows beyond its name, status and owner (FR-21.1). */
export type CardDetail = {
  mark: CardMark;
  /** The organisation's name; `null` when none is linked or it only repeats the card's name. */
  organisation: string | null;
  /** The open next step that is due first. */
  nextStep: { text: string; day: string | null } | null;
  /** A lead's live-proposal value or an opportunity's amount, per currency, never converted. */
  value: LeadValue[];
  /** A lead's proposal and where it stands; a draft's value sits here, never in `value`. */
  proposal: ProposalBadge | null;
  /** When the record last changed; an investor row takes its list's. */
  changedAt: string | null;
};

export type CardExtras = {
  /** Organisation names by id. */
  organisations: Partial<Record<string, string>>;
  /** When each record last changed, by id. */
  changed: Partial<Record<string, string>>;
  leadValues: Partial<Record<string, LeadValue[]>>;
};

/** A board entry's key; an investor row adds its row id to its list's. */
export const cardKey = (e: Pick<ItemRef, "kind" | "id" | "rowId">) =>
  `${e.kind}:${e.id}${e.rowId ? `:${e.rowId}` : ""}`;

type Step = { text: string; dueDate?: string | null; doneAt?: string | null };

function nextStep(steps: readonly Step[]): CardDetail["nextStep"] {
  const open = steps.filter((s) => !s.doneAt);
  const dated = open
    .filter((s) => s.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));
  const first = dated.at(0) ?? open.at(0);
  return first
    ? { text: first.text, day: first.dueDate?.slice(0, 10) ?? null }
    : null;
}

/** The details of every card the board can show, by `cardKey`. */
export function cardDetails(
  input: OverviewInput,
  extras: CardExtras,
): Map<string, CardDetail> {
  const organisation = (
    id: string | null | undefined,
    name: string | null | undefined,
  ) => {
    const org = id ? extras.organisations[id]?.trim() : undefined;
    return org && org.toLowerCase() !== (name ?? "").trim().toLowerCase()
      ? org
      : null;
  };
  const changed = (id: string) => extras.changed[id] ?? null;
  const cards = new Map<string, CardDetail>();
  const badges = proposalBadges(input.proposals);
  for (const { id, state: s } of input.leads)
    cards.set(cardKey({ kind: "lead", id }), {
      mark: s.kind ?? "LEAD",
      organisation: organisation(s.organisationId, s.name),
      nextStep: nextStep(s.nextSteps),
      value: extras.leadValues[id] ?? [],
      proposal: badges[id] ?? null,
      changedAt: changed(id),
    });
  for (const { id, state: s } of input.opportunities)
    cards.set(cardKey({ kind: "opportunity", id }), {
      mark: "FUNDING",
      organisation: organisation(s.funderId, s.name),
      nextStep: nextStep(s.nextSteps),
      value:
        s.amount != null && s.currency
          ? [{ currency: s.currency, amount: s.amount }]
          : [],
      proposal: null,
      changedAt: changed(id),
    });
  for (const { id, state } of input.investorLists)
    for (const row of state.rows)
      if (row.state === "SHORTLISTED")
        cards.set(cardKey({ kind: "investor-row", id, rowId: row.id }), {
          mark: "SHORTLISTED",
          organisation: organisation(row.organisationId, row.name),
          nextStep: null,
          value: [],
          proposal: null,
          changedAt: changed(id),
        });
  return cards;
}
