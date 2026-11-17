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
import type { LeadAction, LeadDocument } from "document-models/lead/v1";
import { assertIsLeadDocument, isLeadDocument } from "./gen/document-schema.js";

/** Hook to get a Lead document by its id */
export function useLeadDocumentById(
  documentId: string | null | undefined,
): [LeadDocument, DocumentDispatch<LeadAction>] | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isLeadDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected Lead document */
export function useSelectedLeadDocument(): [
  LeadDocument,
  DocumentDispatch<LeadAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsLeadDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all Lead documents in the selected drive */
export function useLeadDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isLeadDocument);
}

/** Hook to get all Lead documents in the selected folder */
export function useLeadDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isLeadDocument);
}
