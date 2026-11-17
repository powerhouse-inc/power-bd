/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  decisionDetailsActions,
  decisionReferencesActions,
  decisionStatusActions,
} from "./gen/creators.js";

/** Actions for the Decision document model */

export const actions = {
  ...baseActions,
  ...decisionDetailsActions,
  ...decisionStatusActions,
  ...decisionReferencesActions,
};
