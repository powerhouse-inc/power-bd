import type { PlaybookClaimsOperations } from "document-models/playbook/v1";
import {
  DuplicateNeverClaimIdError,
  NeverClaimNotFoundError,
} from "../../gen/claims/error.js";

export const playbookClaimsOperations: PlaybookClaimsOperations = {
  addNeverClaimOperation(state, action) {
    const { id, claim, reason, phrases } = action.input;
    if (state.neverClaims.some((item) => item.id === id))
      throw new DuplicateNeverClaimIdError(
        `Never-claim item ${id} already exists`,
      );
    state.neverClaims.push({ id, claim, reason: reason ?? null, phrases });
  },
  updateNeverClaimOperation(state, action) {
    const { id, claim, reason, phrases } = action.input;
    const item = state.neverClaims.find((candidate) => candidate.id === id);
    if (!item)
      throw new NeverClaimNotFoundError(`Never-claim item ${id} not found`);
    if (claim != null) item.claim = claim;
    if (reason !== undefined) item.reason = reason;
    if (phrases != null) item.phrases = phrases;
  },
  removeNeverClaimOperation(state, action) {
    const { id } = action.input;
    const index = state.neverClaims.findIndex(
      (candidate) => candidate.id === id,
    );
    if (index === -1)
      throw new NeverClaimNotFoundError(`Never-claim item ${id} not found`);
    state.neverClaims.splice(index, 1);
  },
};
