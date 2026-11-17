import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";

export type Rec<S> = { id: string; state: S };

export type RetentionInput = {
  /** The current instant, UTC ISO string. */
  now: string;
  /** The retention period in months (settings). */
  retentionMonths: number;
  leads: Rec<LeadState>[];
  opportunities: Rec<OpportunityState>[];
  proposals: Rec<ProposalState>[];
};

export type HeldFile = "SENT_COPY" | "SIGNED_COPY" | "FIGURE";

export type PersonDue = {
  contactId: string;
  personId: string;
  /** Every lead and opportunity that links the person, all closed badly. */
  relationships: {
    kind: "lead" | "opportunity";
    id: string;
    closedAt: string;
  }[];
  /** When the last of them closed plus the period: the day it fell due. */
  dueSince: string;
  /** Proposals for this person (as recipient or on their leads) that hold a file. */
  proposals: { id: string; title: string; files: HeldFile[] }[];
};
