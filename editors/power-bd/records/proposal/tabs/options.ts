import type {
  AnnexKind,
  BoundaryKind,
  ClauseKind,
  PaymentTrigger,
  Pricing,
  RateUnit,
  RecurringPeriod,
  SectionKind,
} from "document-models/proposal";
import { options } from "./values.js";

export const SECTION_KINDS = options<SectionKind>([
  ["PROSE", "Written section"],
  ["SCOPE", "Scope"],
  ["ASSUMPTIONS", "Assumptions and exclusions"],
  ["DELIVERABLES", "Deliverables"],
  ["PRICING", "Pricing"],
  ["SCHEDULE", "Schedule"],
  ["ACCEPTANCE", "Acceptance"],
  ["TERMS", "Terms"],
  ["ANNEXES", "Annexes"],
]);
export const CLAUSE_KINDS = options<ClauseKind>([
  ["CONTRACTING_PARTY", "Contracting party"],
  ["LIABILITY", "Liability"],
  ["CONFIDENTIALITY", "Confidentiality"],
  ["INTELLECTUAL_PROPERTY", "Intellectual property"],
  ["TERMINATION", "Termination"],
  ["GOVERNING_LAW", "Governing law"],
  ["FINAL_PROVISIONS", "Final provisions"],
  ["OTHER", "Other"],
]);
export const ANNEX_KINDS = options<AnnexKind>([
  ["DATA_PROCESSING", "Data processing"],
  ["FORM", "Form"],
  ["OTHER", "Other"],
]);
export const BOUNDARY_KINDS = options<BoundaryKind>([
  ["ASSUMPTION", "Assumption"],
  ["CLIENT_INPUT", "Client input"],
  ["EXCLUSION", "Exclusion"],
  ["GUARANTEE", "Guarantee"],
]);
export const TRIGGERS = options<PaymentTrigger>([
  ["ON_SIGNATURE", "On signature"],
  ["ON_ACCEPTANCE", "On acceptance"],
  ["ON_DATE", "On a date"],
]);
export const PRICING = options<Pricing>([
  ["FIXED", "Fixed"],
  ["INCLUDED", "Included"],
  ["RECURRING", "Recurring"],
  ["RATE", "Rate"],
]);
export const PERIODS = options<RecurringPeriod>([
  ["MONTH", "Per month"],
  ["QUARTER", "Per quarter"],
  ["YEAR", "Per year"],
]);
export const UNITS = options<RateUnit>([
  ["HOUR", "Per hour"],
  ["DAY", "Per day"],
]);
