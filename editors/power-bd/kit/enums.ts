import type {
  DealRole,
  Fit,
  InteractionKind,
  InteractionOutcome,
  InteractionStatus,
  LeadKind,
  LeadSource,
  LeadStatus,
  MessageChannel,
  ReferenceKind,
} from "document-models/lead";

/**
 * The values a form field may hold for the model's enums. A select hands back
 * text; `enumValue` turns it into the enum or nothing, so no cast is needed.
 * Each list is checked against its enum's type.
 */
export const LEAD_STATUSES = [
  "TO_CONTACT",
  "IN_TOUCH",
  "MEETING_SET",
  "MET",
  "PROPOSAL",
  "WON",
  "LOST",
  "PARKED",
] as const satisfies readonly LeadStatus[];
export const LEAD_KINDS = [
  "SALES",
  "PARTNERSHIP",
  "EXCHANGE",
  "INVESTOR",
] as const satisfies readonly LeadKind[];
export const LEAD_SOURCES = [
  "EVENT",
  "REFERRAL",
  "INBOUND",
  "OUTBOUND",
  "PARTNER",
  "OTHER",
] as const satisfies readonly LeadSource[];
export const DEAL_ROLES = [
  "CHAMPION",
  "DECISION_MAKER",
  "INFLUENCER",
  "BLOCKER",
  "USER",
] as const satisfies readonly DealRole[];
export const INTERACTION_OUTCOMES = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const satisfies readonly InteractionOutcome[];
export const FITS = [
  "BEST",
  "GOOD",
  "LATER",
  "UNLIKELY",
] as const satisfies readonly Fit[];
export const MESSAGE_CHANNELS = [
  "EMAIL",
  "LINKEDIN",
  "OTHER",
] as const satisfies readonly MessageChannel[];
export const INTERACTION_KINDS = [
  "EMAIL",
  "CALL",
  "MEETING",
  "EVENT",
  "MESSAGE",
  "OTHER",
] as const satisfies readonly InteractionKind[];
export const INTERACTION_STATUSES = [
  "SCHEDULED",
  "HELD",
  "CANCELLED",
] as const satisfies readonly InteractionStatus[];
export const REFERENCE_KIND_VALUES = [
  "RESEARCH",
  "NOTE",
  "SOURCE",
  "COMPARABLE",
  "OPPORTUNITY",
  "LEAD",
  "DECISION",
  "OTHER",
] as const satisfies readonly ReferenceKind[];

/** The member of `values` that equals `text`, or undefined. */
export function enumValue<T extends string>(
  values: readonly T[],
  text: string,
): T | undefined {
  return values.find((value) => value === text);
}
