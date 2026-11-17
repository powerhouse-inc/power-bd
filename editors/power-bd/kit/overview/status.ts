import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";

export const isClosedLead = (s: LeadState["status"]) =>
  s === "WON" || s === "LOST";
export const isClosedOpportunity = (s: OpportunityState["status"]) =>
  s === "AWARDED" || s === "REJECTED" || s === "WITHDRAWN" || s === "NO_GO";
