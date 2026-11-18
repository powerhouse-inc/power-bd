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
import type { MarketAction, MarketDocument } from "document-models/market/v1";
import {
  assertIsMarketDocument,
  isMarketDocument,
} from "./gen/document-schema.js";

/** Hook to get a Market document by its id */
export function useMarketDocumentById(
  documentId: string | null | undefined,
): [MarketDocument, DocumentDispatch<MarketAction>] | [undefined, undefined] {
  const [document, dispatch] = useDocumentById(documentId);
  if (!isMarketDocument(document)) return [undefined, undefined];
  return [document, dispatch];
}

/** Hook to get the selected Market document */
export function useSelectedMarketDocument(): [
  MarketDocument,
  DocumentDispatch<MarketAction>,
] {
  const [document, dispatch] = useSelectedDocument();

  assertIsMarketDocument(document);
  return [document, dispatch] as const;
}

/** Hook to get all Market documents in the selected drive */
export function useMarketDocumentsInSelectedDrive() {
  const documentsInSelectedDrive = useDocumentsInSelectedDrive();
  return documentsInSelectedDrive?.filter(isMarketDocument);
}

/** Hook to get all Market documents in the selected folder */
export function useMarketDocumentsInSelectedFolder() {
  const documentsInSelectedFolder = useDocumentsInSelectedFolder();
  return documentsInSelectedFolder?.filter(isMarketDocument);
}
