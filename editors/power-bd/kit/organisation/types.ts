import type { InvestorListState } from "document-models/investor-list";
import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";

export type Rec<S> = { id: string; state: S };

export type OrganisationInput = {
  /** The contact (organisation or individual) the view is for. */
  contactId: string;
  leads: Rec<LeadState>[];
  opportunities: Rec<OpportunityState>[];
  investorLists: Rec<InvestorListState>[];
  proposals: Rec<ProposalState>[];
};

/** How a record names the contact. */
export type Via =
  | "ORGANISATION"
  | "FUNDER"
  | "COORDINATOR"
  | "PARTNER"
  | "CONTACT_LINK"
  | "INTERACTION"
  | "MESSAGE"
  | "RECIPIENT"
  | "LEAD";

export type Found = { id: string; name: string; via: Via[] };
export type FoundRow = {
  listId: string;
  rowId: string;
  name: string;
  state: string;
};
export type ResearchRef = { documentId: string; title: string; kind: string };

export type OrganisationView = {
  leads: Found[];
  opportunities: Found[];
  investorRows: FoundRow[];
  proposals: Found[];
  /** Research, notes, sources and comparables of all those records, once each. */
  research: ResearchRef[];
};
