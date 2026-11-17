import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import type { IconName } from "../../../../design-system/icons.js";
import { enumValue } from "../../kit/enums.js";
import { formatMoneyCompact } from "../../kit/format/index.js";
import {
  SLIPPING_REASONS,
  type CommonStage,
  type ItemKind,
  type ItemRef,
  type LeadValue,
  type SlippingSince,
} from "../../kit/overview/index.js";
import type { CardMark } from "../../kit/overview-view/index.js";

/** The words and icons the Overview uses for kinds, due items and stages. */
export const KIND_ICON = {
  lead: "leads",
  opportunity: "funding",
  "investor-row": "investors",
  decision: "decisions",
} as const;
export const KIND_LABEL: Record<ItemKind, string> = {
  lead: "Leads",
  opportunity: "Funding",
  "investor-row": "Investors",
  decision: "Decisions",
};
export const KIND_VALUES = [
  "lead",
  "opportunity",
  "investor-row",
  "decision",
] as const satisfies readonly ItemKind[];
export const DUE_ICON = {
  NEXT_STEP: "checklist",
  MEETING: "meeting",
  OPPORTUNITY_STEP: "funding",
  DECIDE_BY: "hourglass",
  EXPECTED_OPENING: "calendar",
  PROPOSAL_VALID_UNTIL: "send",
} as const;
/** The mark that names a card's kind: a lead by its type, funding, or a shortlisted investor. */
export const MARK: Record<CardMark, { label: string; icon: IconName }> = {
  SALES: { label: "Sales lead", icon: "sales" },
  PARTNERSHIP: { label: "Partnership lead", icon: "partnership" },
  EXCHANGE: { label: "Exchange lead", icon: "exchange" },
  INVESTOR: { label: "Investor lead", icon: "investors" },
  LEAD: { label: "Lead", icon: "leads" },
  FUNDING: { label: "Funding opportunity", icon: "funding" },
  SHORTLISTED: { label: "Shortlisted investor", icon: "investors" },
};
export const STAGES: CommonStage[] = ["NEW", "ACTIVE", "PARKED", "CLOSED"];

export const key = (r: Pick<ItemRef, "kind" | "id">) => `${r.kind}:${r.id}`;

/** "N days" after a reason's name, from the kit's `since`; nothing before a whole day has passed. */
export const sinceText = (since?: SlippingSince): string =>
  since && since.days > 0
    ? ` · ${since.days} ${since.days === 1 ? "day" : "days"}`
    : "";

/** How long the reason a term names has been slipping, in words. */
export function sinceFor(
  since: Partial<Record<string, SlippingSince>> | undefined,
  reason: string,
): string {
  const r = enumValue(SLIPPING_REASONS, reason);
  return r ? sinceText(since?.[r]) : "";
}

/** A lead's value from its live proposals: "€12k", or "€8k to €20k" for a range, one per currency. */
export function valueText(values: LeadValue[] | undefined): string {
  return (values ?? [])
    .map((v) =>
      v.upper === undefined
        ? formatMoneyCompact(v.amount, v.currency)
        : `${formatMoneyCompact(v.amount, v.currency)} to ${formatMoneyCompact(v.upper, v.currency)}`,
    )
    .join(" · ");
}

/** The label and tone of an item's status, by the kind of record it is. */
export function statusTerm(kind: ItemKind, status: string) {
  const list =
    kind === "lead"
      ? VOCABULARY.leadStatus
      : kind === "opportunity"
        ? VOCABULARY.opportunityStatus
        : VOCABULARY.decisionStatus;
  return list.find((t) => t.value === status);
}

/** A stored day (`YYYY-MM-DD`) as the instant the date formatters take. */
export const dayInstant = (day: string) => `${day}T00:00:00.000Z`;

/** Every status of every kind, once each, for the status filter. */
export const ALL_STATUSES = (() => {
  const seen = new Map<string, string>();
  for (const t of [
    ...VOCABULARY.leadStatus,
    ...VOCABULARY.opportunityStatus,
    ...VOCABULARY.decisionStatus,
  ])
    if (!seen.has(t.value)) seen.set(t.value, t.label);
  return [...seen.entries()];
})();
