/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type { MarketAction, MarketDocument } from "document-models/market";
import { lazy } from "react";

/** Document editor module for the "powerbd/market" document type */
export const MarketEditor: EditorModule<MarketDocument, MarketAction> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/market"],
  config: {
    id: "market-editor",
    name: "Market Editor",
  },
};
