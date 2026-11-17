import {
  useDocumentCache,
  useDocuments,
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
import { use, useDeferredValue, useMemo } from "react";
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
 * of failing every view. It suspends while the records first load, and stays
 * live. When the drive's records change (one created here, deleted, or synced
 * from a colleague) the views keep showing what they show until the new set
 * has loaded: suspending then would hide the whole app behind Connect's
 * loader, as if it reloaded.
 */
export function useDriveDocuments() {
  const nodes = useNodesInSelectedDrive();
  // The cache every view shares: a view opened later finds the answer already there.
  const cache = useDocumentCache();
  const listed = useMemo(
    () => nodes?.filter((node) => node.kind === "file").map((node) => node.id),
    [nodes],
  );
  const ids = useDeferredValue(listed);
  const loadable = ids?.length && cache ? use(check(cache, ids)) : undefined;
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
