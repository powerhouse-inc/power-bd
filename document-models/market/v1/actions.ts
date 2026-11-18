/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  marketApprovalActions,
  marketDetailsActions,
  marketFiguresActions,
  marketMapActions,
  marketSegmentsActions,
} from "./gen/creators.js";

/** Actions for the Market document model */

export const actions = {
  ...baseActions,
  ...marketDetailsActions,
  ...marketSegmentsActions,
  ...marketFiguresActions,
  ...marketMapActions,
  ...marketApprovalActions,
};
