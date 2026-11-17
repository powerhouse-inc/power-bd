/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type {
  DecisionAction,
  DecisionDocument,
} from "document-models/decision";
import { lazy } from "react";

/** Document editor module for the "powerbd/decision" document type */
export const DecisionEditor: EditorModule<DecisionDocument, DecisionAction> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/decision"],
  config: {
    id: "decision-editor",
    name: "Decision Editor",
  },
};
