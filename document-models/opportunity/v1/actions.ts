/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { baseActions } from "document-model";
import {
  opportunityConditionsActions,
  opportunityConsortiumActions,
  opportunityDatesActions,
  opportunityDetailsActions,
  opportunityLimitsActions,
  opportunityRelationshipActions,
  opportunityStatusActions,
  opportunitySubmissionsActions,
} from "./gen/creators.js";

/** Actions for the Opportunity document model */

export const actions = {
  ...baseActions,
  ...opportunityDetailsActions,
  ...opportunityStatusActions,
  ...opportunityDatesActions,
  ...opportunityConditionsActions,
  ...opportunityLimitsActions,
  ...opportunitySubmissionsActions,
  ...opportunityConsortiumActions,
  ...opportunityRelationshipActions,
};
