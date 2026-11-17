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
  DecisionAction,
  DecisionDocument,
} from "document-models/decision/v1";
import {
  assertIsDecisionDocument,
  isDecisionDocument,
} from "./gen/document-schema.js";

/** Hook to get a Decision document by its id */
export function useDecisionDocumentById(
  documentId: string | null | undefined,
):
  | [DecisionDocument, DocumentDispatch<DecisionAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isDecisionDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected Decision document */
export function useSelectedDecisionDocument(): [
  DecisionDocument,
  DocumentDispatch<DecisionAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsDecisionDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all Decision documents in the selected drive */
export function useDecisionDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isDecisionDocument);
}

/** Hook to get all Decision documents in the selected folder */
export function useDecisionDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isDecisionDocument);
}
