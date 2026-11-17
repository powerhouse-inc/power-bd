import type { ProposalDetailsOperations } from "document-models/proposal/v1";
import {
  CurrencyLockedError,
  ProposalNotDraftError,
} from "../../gen/details/error.js";
import { hasAmount } from "./shared.js";

export const proposalDetailsOperations: ProposalDetailsOperations = {
  setProposalDetailsOperation(state, action) {
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const input = action.input;
    if (
      input.currency !== undefined &&
      input.currency !== state.currency &&
      hasAmount(state)
    )
      throw new CurrencyLockedError(
        "The currency cannot change while an amount exists",
      );
    if (input.title !== undefined) state.title = input.title;
    if (input.code !== undefined) state.code = input.code;
    if (input.currency !== undefined) state.currency = input.currency;
    if (input.validUntil !== undefined) state.validUntil = input.validUntil;
    if (input.revisesProposalId !== undefined)
      state.revisesProposalId = input.revisesProposalId;
    if (input.bindingOnSignature != null)
      state.bindingOnSignature = input.bindingOnSignature;
    if (input.processesPersonalData != null)
      state.processesPersonalData = input.processesPersonalData;
  },
  setProposalPartiesOperation(state, action) {
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be edited");
    const input = action.input;
    if (input.leadId !== undefined) state.leadId = input.leadId;
    if (input.recipient !== undefined)
      state.recipient = input.recipient && {
        contactId: input.recipient.contactId,
        personId: input.recipient.personId ?? null,
      };
    if (input.contractingEntity !== undefined)
      state.contractingEntity = input.contractingEntity && {
        id: input.contractingEntity.id,
        title: input.contractingEntity.title,
      };
  },
};
