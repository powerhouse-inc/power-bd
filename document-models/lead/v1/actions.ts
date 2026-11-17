/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  leadAnglesActions,
  leadDetailsActions,
  leadMessagesActions,
  leadRelationshipActions,
  leadStatusActions,
} from "./gen/creators.js";

/** Actions for the Lead document model */

export const actions = {
  ...baseActions,
  ...leadDetailsActions,
  ...leadStatusActions,
  ...leadAnglesActions,
  ...leadMessagesActions,
  ...leadRelationshipActions,
};
