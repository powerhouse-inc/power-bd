/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type { LeadAction, LeadDocument } from "document-models/lead";
import { lazy } from "react";

/** Document editor module for the "powerbd/lead" document type */
export const LeadEditor: EditorModule<LeadDocument, LeadAction> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/lead"],
  config: {
    id: "lead-editor",
    name: "Lead Editor",
  },
};
