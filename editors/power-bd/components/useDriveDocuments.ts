import { isBdSettingsDocument } from "document-models/bd-settings";
import { isContactDocument } from "document-models/contact";
import { isDecisionDocument } from "document-models/decision";
import { isInvestorListDocument } from "document-models/investor-list";
import { isLeadDocument } from "document-models/lead";
import { isMarketDocument } from "document-models/market";
import { isOpportunityDocument } from "document-models/opportunity";
import { isPlaybookDocument } from "document-models/playbook";
import { isProposalDocument } from "document-models/proposal";
import { useDriveDocuments } from "./data/driveData.js";

/**
 * The open drive's records: from its server for a shared drive, from Connect
 * for one kept only in this browser (see data/driveData). Suspends while they
 * first load; a record the server refuses or no longer has is left out.
 */
export { useDriveDocuments };

// The generated hooks of the same names, on the records above.
export const useBdSettingsDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isBdSettingsDocument);
export const useContactDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isContactDocument);
export const useDecisionDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isDecisionDocument);
export const useInvestorListDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isInvestorListDocument);
export const useLeadDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isLeadDocument);
export const useMarketDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isMarketDocument);
export const useOpportunityDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isOpportunityDocument);
export const usePlaybookDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isPlaybookDocument);
export const useProposalDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isProposalDocument);
