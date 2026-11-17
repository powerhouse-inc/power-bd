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
  OpportunityAction,
  OpportunityDocument,
} from "document-models/opportunity/v1";
import {
  assertIsOpportunityDocument,
  isOpportunityDocument,
} from "./gen/document-schema.js";

/** Hook to get a Opportunity document by its id */
export function useOpportunityDocumentById(
  documentId: string | null | undefined,
):
  | [OpportunityDocument, DocumentDispatch<OpportunityAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isOpportunityDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected Opportunity document */
export function useSelectedOpportunityDocument(): [
  OpportunityDocument,
  DocumentDispatch<OpportunityAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsOpportunityDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all Opportunity documents in the selected drive */
export function useOpportunityDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isOpportunityDocument);
}

/** Hook to get all Opportunity documents in the selected folder */
export function useOpportunityDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isOpportunityDocument);
}
