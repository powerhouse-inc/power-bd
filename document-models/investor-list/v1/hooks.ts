/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  useDocumentById,
  useDocumentsInSelectedDrive,
  useDocumentsInSelectedFolder,
  useSelectedDocument,
} from "@powerhousedao/reactor-browser";
import type {
  InvestorListAction,
  InvestorListDocument,
} from "document-models/investor-list/v1";
import {
  assertIsInvestorListDocument,
  isInvestorListDocument,
} from "./gen/document-schema.js";

/** Hook to get a InvestorList document by its id */
export function useInvestorListDocumentById(
  documentId: string | null | undefined,
):
  | [InvestorListDocument, DocumentDispatch<InvestorListAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isInvestorListDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected InvestorList document */
export function useSelectedInvestorListDocument(): [
  InvestorListDocument,
  DocumentDispatch<InvestorListAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsInvestorListDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all InvestorList documents in the selected drive */
export function useInvestorListDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isInvestorListDocument);
}

/** Hook to get all InvestorList documents in the selected folder */
export function useInvestorListDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isInvestorListDocument);
}
