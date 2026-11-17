import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";

export type Rec<S> = { id: string; state: S };

export type DecisionImpactInput = {
  decisionId: string;
  leads: Rec<LeadState>[];
  opportunities: Rec<OpportunityState>[];
  proposals: Rec<ProposalState>[];
};

export type Impacted = { id: string; name: string; closed: boolean };
export type GatedCondition = Impacted & {
  conditionId: string;
  text: string;
};

export type DecisionImpact = {
  /** Opportunity conditions waiting on the decision. */
  conditions: GatedCondition[];
  /** Opportunities blocked on the decision. */
  blocked: Impacted[];
  /** Leads whose references include the decision (these gate the lead). */
  leads: Impacted[];
  /** Opportunities whose references include the decision. */
  opportunities: Impacted[];
  /** Proposals whose references include the decision. */
  proposals: Impacted[];
};
