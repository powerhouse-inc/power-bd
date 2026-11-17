/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type { ContactAction, ContactDocument } from "document-models/contact";
import { lazy } from "react";

/** Document editor module for the "powerbd/contact" document type */
export const ContactEditor: EditorModule<ContactDocument, ContactAction> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/contact"],
  config: {
    id: "contact-editor",
    name: "Contact Editor",
  },
};
