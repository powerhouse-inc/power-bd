/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { EditorModule } from "document-model";
import type {
  InvestorListAction,
  InvestorListDocument,
} from "document-models/investor-list";
import { lazy } from "react";

/** Document editor module for the "powerbd/investor-list" document type */
export const InvestorListEditor: EditorModule<
  InvestorListDocument,
  InvestorListAction
> = {
  Component: lazy(() => import("./editor.js")),
  documentTypes: ["powerbd/investor-list"],
  config: {
    id: "investor-list-editor",
    name: "Investor List Editor",
  },
};
