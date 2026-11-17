import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { BdSettingsPHState } from "document-models/bd-settings/v1";
import type {
  SetDueWindowAction,
  SetRetentionAction,
  SetTimeZoneAction,
  SetVaultDriveAction,
} from "./preferences/actions.js";
import type {
  AddTeamMemberAction,
  DeactivateTeamMemberAction,
  ReactivateTeamMemberAction,
  UpdateTeamMemberAction,
} from "./team/actions.js";

import { bdSettingsPreferencesOperations } from "../src/reducers/preferences.js";
import { bdSettingsTeamOperations } from "../src/reducers/team.js";

import {
  AddTeamMemberInputSchema,
  DeactivateTeamMemberInputSchema,
  ReactivateTeamMemberInputSchema,
  SetDueWindowInputSchema,
  SetRetentionInputSchema,
  SetTimeZoneInputSchema,
  SetVaultDriveInputSchema,
  UpdateTeamMemberInputSchema,
} from "./schema/zod.js";

const schemaMemo = new Map<() => unknown, unknown>();

function memoizedSchema<T>(makeSchema: () => T): T {
  let schema = schemaMemo.get(makeSchema) as T | undefined;
  if (schema === undefined) {
    schema = makeSchema();
    schemaMemo.set(makeSchema, schema);
  }
  return schema;
}

const stateReducer: StateReducer<BdSettingsPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "ADD_TEAM_MEMBER": {
      memoizedSchema(AddTeamMemberInputSchema).parse(action.input);

      bdSettingsTeamOperations.addTeamMemberOperation(
        state.global,
        action as AddTeamMemberAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_TEAM_MEMBER": {
      memoizedSchema(UpdateTeamMemberInputSchema).parse(action.input);

      bdSettingsTeamOperations.updateTeamMemberOperation(
        state.global,
        action as UpdateTeamMemberAction,
        dispatch,
      );

      break;
    }

    case "DEACTIVATE_TEAM_MEMBER": {
      memoizedSchema(DeactivateTeamMemberInputSchema).parse(action.input);

      bdSettingsTeamOperations.deactivateTeamMemberOperation(
        state.global,
        action as DeactivateTeamMemberAction,
        dispatch,
      );

      break;
    }

    case "REACTIVATE_TEAM_MEMBER": {
      memoizedSchema(ReactivateTeamMemberInputSchema).parse(action.input);

      bdSettingsTeamOperations.reactivateTeamMemberOperation(
        state.global,
        action as ReactivateTeamMemberAction,
        dispatch,
      );

      break;
    }

    case "SET_TIME_ZONE": {
      memoizedSchema(SetTimeZoneInputSchema).parse(action.input);

      bdSettingsPreferencesOperations.setTimeZoneOperation(
        state.global,
        action as SetTimeZoneAction,
        dispatch,
      );

      break;
    }

    case "SET_DUE_WINDOW": {
      memoizedSchema(SetDueWindowInputSchema).parse(action.input);

      bdSettingsPreferencesOperations.setDueWindowOperation(
        state.global,
        action as SetDueWindowAction,
        dispatch,
      );

      break;
    }

    case "SET_VAULT_DRIVE": {
      memoizedSchema(SetVaultDriveInputSchema).parse(action.input);

      bdSettingsPreferencesOperations.setVaultDriveOperation(
        state.global,
        action as SetVaultDriveAction,
        dispatch,
      );

      break;
    }

    case "SET_RETENTION": {
      memoizedSchema(SetRetentionInputSchema).parse(action.input);

      bdSettingsPreferencesOperations.setRetentionOperation(
        state.global,
        action as SetRetentionAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<BdSettingsPHState> = createReducer(stateReducer);
