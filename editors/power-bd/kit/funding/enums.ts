import type {
  ConditionKind,
  ConditionState,
  Instrument,
  OpportunityStatus,
  PartnerStatus,
  StepKind,
  SubmissionResult,
} from "document-models/opportunity";

/**
 * The values a form field may hold for the opportunity model's enums. A select
 * hands back text; `enumValue` (kit/enums.ts) turns it into the enum, so no
 * cast is needed. Each list is checked against its enum's type.
 */
export const OPPORTUNITY_STATUSES = [
  "WATCHING",
  "TO_EVALUATE",
  "DECIDING",
  "PREPARING",
  "SUBMITTED",
  "NEXT_STAGE",
  "AWARDED",
  "REJECTED",
  "WITHDRAWN",
  "NO_GO",
] as const satisfies readonly OpportunityStatus[];

export const INSTRUMENTS = [
  "GRANT",
  "FELLOWSHIP",
  "ACCELERATOR",
  "CONSORTIUM_CALL",
  "EQUITY",
  "IN_KIND",
  "PRIZE",
  "MIXED",
] as const satisfies readonly Instrument[];

export const CONDITION_STATES = [
  "MET",
  "NOT_MET",
  "UNKNOWN",
  "WAITING_ON_DECISION",
] as const satisfies readonly ConditionState[];

export const SUBMISSION_RESULTS = [
  "PASSED",
  "AWARDED",
  "UNSUCCESSFUL",
  "WITHDRAWN",
] as const satisfies readonly SubmissionResult[];

export const PARTNER_STATUSES = [
  "ASKED",
  "INTERESTED",
  "COMMITTED",
  "SIGNED",
] as const satisfies readonly PartnerStatus[];

/** Each condition kind with the label the page shows. */
export const CONDITION_KINDS = [
  ["ELIGIBILITY", "Who may apply"],
  ["COUNTRY", "Country"],
  ["LEGAL_FORM", "Legal form"],
  ["READINESS", "Readiness"],
  ["PURPOSE", "Purpose"],
  ["CO_FUNDING", "Co-funding"],
  ["CONSORTIUM", "Consortium"],
  ["OTHER", "Other"],
] as const satisfies readonly (readonly [ConditionKind, string])[];

/** Each step kind with the label the page shows. */
export const STEP_KINDS = [
  ["LETTER_OF_INTENT", "Letter of intent"],
  ["CUT_OFF", "Cut-off"],
  ["STAGE", "Stage"],
  ["FULL_PROPOSAL", "Full proposal"],
  ["INTERVIEW", "Interview"],
  ["EXPECTED_RESULT", "Expected result"],
  ["OTHER", "Other"],
] as const satisfies readonly (readonly [StepKind, string])[];
