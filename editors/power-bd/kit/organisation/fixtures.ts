import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";

export const lead = (over: Partial<LeadState> = {}): LeadState =>
  ({
    name: "Acme Corp",
    status: "IN_TOUCH",
    messages: [],
    interactions: [],
    contactLinks: [],
    references: [],
    ...over,
  }) as unknown as LeadState;

export const opportunity = (
  over: Partial<OpportunityState> = {},
): OpportunityState =>
  ({
    name: "Fund X",
    status: "PREPARING",
    partners: [],
    interactions: [],
    contactLinks: [],
    references: [],
    conditions: [],
    ...over,
  }) as unknown as OpportunityState;

export const proposal = (over: Partial<ProposalState> = {}): ProposalState =>
  ({
    title: "Scope A",
    status: "DRAFT",
    references: [],
    figures: [],
    ...over,
  }) as unknown as ProposalState;
