import type { Reducer, StateReducer } from "document-model";
import { createReducer, isDocumentAction } from "document-model";
import type { ContactPHState } from "document-models/contact/v1";
import type { ArchiveContactAction } from "./lifecycle/actions.js";
import type {
  AddPersonAction,
  RemovePersonAction,
  UpdatePersonAction,
} from "./people/actions.js";
import type {
  AddTagAction,
  RemoveTagAction,
  SetAddressAction,
  SetProfileAction,
} from "./profile/actions.js";

import { contactLifecycleOperations } from "../src/reducers/lifecycle.js";
import { contactPeopleOperations } from "../src/reducers/people.js";
import { contactProfileOperations } from "../src/reducers/profile.js";

import {
  AddPersonInputSchema,
  AddTagInputSchema,
  ArchiveContactInputSchema,
  RemovePersonInputSchema,
  RemoveTagInputSchema,
  SetAddressInputSchema,
  SetProfileInputSchema,
  UpdatePersonInputSchema,
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

const stateReducer: StateReducer<ContactPHState> = (
  state,
  action,
  dispatch,
) => {
  if (isDocumentAction(action)) {
    return state;
  }
  switch (action.type) {
    case "SET_PROFILE": {
      memoizedSchema(SetProfileInputSchema).parse(action.input);

      contactProfileOperations.setProfileOperation(
        state.global,
        action as SetProfileAction,
        dispatch,
      );

      break;
    }

    case "SET_ADDRESS": {
      memoizedSchema(SetAddressInputSchema).parse(action.input);

      contactProfileOperations.setAddressOperation(
        state.global,
        action as SetAddressAction,
        dispatch,
      );

      break;
    }

    case "ADD_TAG": {
      memoizedSchema(AddTagInputSchema).parse(action.input);

      contactProfileOperations.addTagOperation(
        state.global,
        action as AddTagAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_TAG": {
      memoizedSchema(RemoveTagInputSchema).parse(action.input);

      contactProfileOperations.removeTagOperation(
        state.global,
        action as RemoveTagAction,
        dispatch,
      );

      break;
    }

    case "ADD_PERSON": {
      memoizedSchema(AddPersonInputSchema).parse(action.input);

      contactPeopleOperations.addPersonOperation(
        state.global,
        action as AddPersonAction,
        dispatch,
      );

      break;
    }

    case "UPDATE_PERSON": {
      memoizedSchema(UpdatePersonInputSchema).parse(action.input);

      contactPeopleOperations.updatePersonOperation(
        state.global,
        action as UpdatePersonAction,
        dispatch,
      );

      break;
    }

    case "REMOVE_PERSON": {
      memoizedSchema(RemovePersonInputSchema).parse(action.input);

      contactPeopleOperations.removePersonOperation(
        state.global,
        action as RemovePersonAction,
        dispatch,
      );

      break;
    }

    case "ARCHIVE_CONTACT": {
      memoizedSchema(ArchiveContactInputSchema).parse(action.input);

      contactLifecycleOperations.archiveContactOperation(
        state.global,
        action as ArchiveContactAction,
        dispatch,
      );

      break;
    }

    default:
      return state;
  }
};

export const reducer: Reducer<ContactPHState> = createReducer(stateReducer);
