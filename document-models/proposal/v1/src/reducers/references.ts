import type { ProposalReferencesOperations } from "document-models/proposal/v1";
import {
  DuplicateReferenceError,
  DuplicateReferenceIdError,
  ProposalNotDraftError,
  ReferenceNotFoundError,
} from "../../gen/references/error.js";

export const proposalReferencesOperations: ProposalReferencesOperations = {
  addReferenceOperation(state, action) {
    const { id, kind, documentId, title } = action.input;
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
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
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
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
