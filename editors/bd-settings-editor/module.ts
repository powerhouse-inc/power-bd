/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type {
  BdSettingsAction,
  BdSettingsDocument,
} from "document-models/bd-settings";
import { lazy } from "react";

/** Document editor module for the "powerbd/settings" document type */
export const BdSettingsEditor: EditorModule<
  BdSettingsDocument,
  BdSettingsAction
> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/settings"],
  config: {
    id: "bd-settings-editor",
    name: "BD Settings Editor",
  },
};
