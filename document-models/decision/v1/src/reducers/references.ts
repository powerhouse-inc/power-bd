import type { DecisionReferencesOperations } from "document-models/decision/v1";
import {
  DuplicateReferenceError,
  DuplicateReferenceIdError,
  ReferenceNotFoundError,
} from "../../gen/references/error.js";

export const decisionReferencesOperations: DecisionReferencesOperations = {
  addReferenceOperation(state, action) {
    const { id, kind, documentId, title } = action.input;
    if (state.references.some((reference) => reference.id === id))
      throw new DuplicateReferenceIdError(`Reference ${id} already exists`);
    {
      const existing = state.references.find(
        (reference) =>
          reference.documentId === documentId && reference.kind === kind,
      );
      if (existing)
        throw new DuplicateReferenceError(
          `"${existing.title}" is already linked.`,
        );
    }
    state.references.push({ id, kind, documentId, title });
  },
  removeReferenceOperation(state, action) {
    const index = state.references.findIndex(
      (reference) => reference.id === action.input.id,
    );
    if (index === -1)
      throw new ReferenceNotFoundError(
        `Reference ${action.input.id} not found`,
      );
    state.references.splice(index, 1);
  },
};
