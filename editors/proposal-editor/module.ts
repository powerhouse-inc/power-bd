/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type {
  ProposalAction,
  ProposalDocument,
} from "document-models/proposal";
import { lazy } from "react";

/** Document editor module for the "powerbd/proposal" document type */
export const ProposalEditor: EditorModule<ProposalDocument, ProposalAction> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/proposal"],
  config: {
    id: "proposal-editor",
    name: "Proposal Editor",
  },
};
