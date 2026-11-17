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
  PlaybookAction,
  PlaybookDocument,
} from "document-models/playbook/v1";
import {
  assertIsPlaybookDocument,
  isPlaybookDocument,
} from "./gen/document-schema.js";

/** Hook to get a Playbook document by its id */
export function usePlaybookDocumentById(
  documentId: string | null | undefined,
):
  | [PlaybookDocument, DocumentDispatch<PlaybookAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isPlaybookDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected Playbook document */
export function useSelectedPlaybookDocument(): [
  PlaybookDocument,
  DocumentDispatch<PlaybookAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsPlaybookDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all Playbook documents in the selected drive */
export function usePlaybookDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isPlaybookDocument);
}

/** Hook to get all Playbook documents in the selected folder */
export function usePlaybookDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isPlaybookDocument);
}
