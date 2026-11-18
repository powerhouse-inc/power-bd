import { isBdSettingsDocument, type BdSettingsAction } from "document-models/bd-settings";
import { isContactDocument, type ContactAction } from "document-models/contact";
import { isDecisionDocument, type DecisionAction } from "document-models/decision";
import { isInvestorListDocument, type InvestorListAction } from "document-models/investor-list";
import { isLeadDocument, type LeadAction } from "document-models/lead";
import { isOpportunityDocument, type OpportunityAction } from "document-models/opportunity";
import { isPlaybookDocument, type PlaybookAction } from "document-models/playbook";
import { isProposalDocument, type ProposalAction } from "document-models/proposal";
import type { PHDocument } from "document-model";
import BdSettingsEditor from "../../bd-settings-editor/editor.js";
import ContactEditor from "../../contact-editor/editor.js";
import DecisionEditor from "../../decision-editor/editor.js";
import InvestorListEditor from "../../investor-list-editor/editor.js";
import LeadEditor from "../../lead-editor/editor.js";
import OpportunityEditor from "../../opportunity-editor/editor.js";
import PlaybookEditor from "../../playbook-editor/editor.js";
import ProposalEditor from "../../proposal-editor/editor.js";
import { useDriveWrite } from "./data/driveData.js";

/** Whether the app can open this record itself (one of Power BD's record types). */
export function isLiveRecord(document: PHDocument): boolean {
  return (
    isLeadDocument(document) ||
    isOpportunityDocument(document) ||
    isContactDocument(document) ||
    isDecisionDocument(document) ||
    isProposalDocument(document) ||
    isInvestorListDocument(document) ||
    isPlaybookDocument(document) ||
    isBdSettingsDocument(document)
  );
}

/**
 * A shared drive's record, opened from the app's live copy with the same
 * editor Connect would mount, writing to the drive's server. It does not wait
 * for Connect's copy of the drive to hold the record.
 */
export function LiveRecord({ document }: { document: PHDocument }) {
  const write = useDriveWrite();
  const id = document.header.id;
  if (isLeadDocument(document)) return <LeadEditor document={document} dispatch={write.dispatcher<LeadAction>(id)} />;
  if (isOpportunityDocument(document))
    return <OpportunityEditor document={document} dispatch={write.dispatcher<OpportunityAction>(id)} />;
  if (isContactDocument(document)) return <ContactEditor document={document} dispatch={write.dispatcher<ContactAction>(id)} />;
  if (isDecisionDocument(document)) return <DecisionEditor document={document} dispatch={write.dispatcher<DecisionAction>(id)} />;
  if (isProposalDocument(document)) return <ProposalEditor document={document} dispatch={write.dispatcher<ProposalAction>(id)} />;
  if (isInvestorListDocument(document))
    return <InvestorListEditor document={document} dispatch={write.dispatcher<InvestorListAction>(id)} />;
  if (isPlaybookDocument(document)) return <PlaybookEditor document={document} dispatch={write.dispatcher<PlaybookAction>(id)} />;
  if (isBdSettingsDocument(document))
    return <BdSettingsEditor document={document} dispatch={write.dispatcher<BdSettingsAction>(id)} />;
  return null;
}
