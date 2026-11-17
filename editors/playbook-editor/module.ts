/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type {
  PlaybookAction,
  PlaybookDocument,
} from "document-models/playbook";
import { lazy } from "react";

/** Document editor module for the "powerbd/playbook" document type */
export const PlaybookEditor: EditorModule<PlaybookDocument, PlaybookAction> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/playbook"],
  config: {
    id: "playbook-editor",
    name: "Playbook Editor",
  },
};
