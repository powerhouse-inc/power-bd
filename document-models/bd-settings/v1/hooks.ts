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
  BdSettingsAction,
  BdSettingsDocument,
} from "document-models/bd-settings/v1";
import {
  assertIsBdSettingsDocument,
  isBdSettingsDocument,
} from "./gen/document-schema.js";

/** Hook to get a BdSettings document by its id */
export function useBdSettingsDocumentById(
  documentId: string | null | undefined,
):
  | [BdSettingsDocument, DocumentDispatch<BdSettingsAction>]
  | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isBdSettingsDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected BdSettings document */
export function useSelectedBdSettingsDocument(): [
  BdSettingsDocument,
  DocumentDispatch<BdSettingsAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsBdSettingsDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all BdSettings documents in the selected drive */
export function useBdSettingsDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isBdSettingsDocument);
}

/** Hook to get all BdSettings documents in the selected folder */
export function useBdSettingsDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isBdSettingsDocument);
}
