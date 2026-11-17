import {
  useDocuments,
  useGetDocument,
  useNodesInSelectedDrive,
} from "@powerhousedao/reactor-browser";
import { isBdSettingsDocument } from "document-models/bd-settings";
import { isContactDocument } from "document-models/contact";
import { isDecisionDocument } from "document-models/decision";
import { isInvestorListDocument } from "document-models/investor-list";
import { isLeadDocument } from "document-models/lead";
import { isOpportunityDocument } from "document-models/opportunity";
import { isPlaybookDocument } from "document-models/playbook";
import { isProposalDocument } from "document-models/proposal";
import { use, useMemo } from "react";
import { createLoadableChecks } from "../kit/drive/loadable.js";

// Each left-out record is named once per session, however many views ask.
const named = new Set<string>();
const check = createLoadableChecks({
  onRefused: (ids) => {
    const fresh = ids.filter((id) => !named.has(id));
    if (fresh.length === 0) return;
    fresh.forEach((id) => named.add(id));
    console.warn(
      `Power BD: left out ${fresh.length} record(s) this server refuses or no longer has: ${fresh.join(", ")}. A stale copy of the drive in this browser is the usual cause.`,
    );
  },
});

/**
 * The open drive's records, as the stack's `useDocumentsInSelectedDrive`
 * returns them, except that a record the server refuses is left out instead
 * of failing every view. It still suspends while records load, and stays live.
 */
export function useDriveDocuments() {
  const nodes = useNodesInSelectedDrive();
  const fetchRecord = useGetDocument();
  const ids = useMemo(
    () => nodes?.filter((node) => node.kind === "file").map((node) => node.id),
    [nodes],
  );
  const loadable = ids?.length ? use(check(fetchRecord, ids)) : undefined;
  const documents = useDocuments(loadable?.ok as string[] | undefined);
  return ids === undefined ? undefined : documents;
}

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
export const useOpportunityDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isOpportunityDocument);
export const usePlaybookDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isPlaybookDocument);
export const useProposalDocumentsInSelectedDrive = () =>
  useDriveDocuments()?.filter(isProposalDocument);
