/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type {
  OpportunityAction,
  OpportunityDocument,
} from "document-models/opportunity";
import { lazy } from "react";

/** Document editor module for the "powerbd/opportunity" document type */
export const OpportunityEditor: EditorModule<
  OpportunityDocument,
  OpportunityAction
> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/opportunity"],
  config: {
    id: "opportunity-editor",
    name: "Opportunity Editor",
  },
};
