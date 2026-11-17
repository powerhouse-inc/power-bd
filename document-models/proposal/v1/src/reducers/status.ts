import type { ProposalStatusOperations } from "document-models/proposal/v1";
import {
  AnswerAlreadyRecordedError,
  ApprovalOptionRequiredError,
  ChosenOptionNotFoundError,
  ContractingEntityRequiredError,
  CurrencyRequiredError,
  DeclineReasonRequiredError,
  FileNameRequiredError,
  FileTypeRequiredError,
  LeadRequiredError,
  ProposalFinalError,
  ProposalNotApprovedError,
  ProposalNotDraftError,
  ProposalNotSentError,
  ProposalNotSupersedableError,
  ReplacementRequiredError,
  SentCopyNotAllowedError,
  SignedCopyNotAllowedError,
  ValidUntilRequiredError,
  WithdrawReasonRequiredError,
} from "../../gen/status/error.js";

type FileInput = {
  ref: `attachment://v${number}:${string}`;
  name: string;
  type: string;
};

/** A file needs a reference (the scalar checks its form), a name and a type. */
function checkedFile(file: FileInput) {
  if (file.name.trim() === "")
    throw new FileNameRequiredError("A file needs a name");
  if (file.type.trim() === "")
    throw new FileTypeRequiredError("A file needs a type");
  return { ref: file.ref, name: file.name, type: file.type };
}

export const proposalStatusOperations: ProposalStatusOperations = {
  approveProposalOperation(state, action) {
    if (state.status !== "DRAFT")
      throw new ProposalNotDraftError("Only a draft proposal can be approved");
    if (state.leadId == null)
      throw new LeadRequiredError("Approval needs a lead");
    if (state.contractingEntity == null)
      throw new ContractingEntityRequiredError(
        "Approval needs a contracting entity",
      );
    if (state.currency == null)
      throw new CurrencyRequiredError("Approval needs a currency");
    if (state.validUntil == null)
      throw new ValidUntilRequiredError("Approval needs a valid-until date");
    if (!state.options.some((option) => option.packageIds.length > 0))
      throw new ApprovalOptionRequiredError(
        "Approval needs an option with at least one package",
      );
    state.status = "APPROVED";
    state.approvedBy = action.input.approvedBy;
    state.approvedAt = action.input.approvedAt;
  },
  reopenProposalOperation(state) {
    if (state.status !== "APPROVED")
      throw new ProposalNotApprovedError(
        "Only an approved proposal can be reopened",
      );
    state.status = "DRAFT";
    state.approvedBy = null;
    state.approvedAt = null;
  },
  markProposalSentOperation(state, action) {
    if (state.status !== "APPROVED")
      throw new ProposalNotApprovedError(
        "Only an approved proposal can be marked sent",
      );
    const copy = action.input.copy ? checkedFile(action.input.copy) : null;
    state.status = "SENT";
    state.sentBy = action.input.sentBy;
    state.sentAt = action.input.sentAt;
    state.sentCopy = copy;
  },
  setSentCopyOperation(state, action) {
    if (!["SENT", "ACCEPTED", "DECLINED"].includes(state.status))
      throw new SentCopyNotAllowedError(
        "The copy that was sent can change only while the proposal is sent, accepted or declined",
      );
    state.sentCopy = action.input.file ? checkedFile(action.input.file) : null;
  },
  recordProposalAnswerOperation(state, action) {
    const { accepted, chosenOptionId, reason, answeredAt } = action.input;
    if (state.status === "ACCEPTED" || state.status === "DECLINED")
      throw new AnswerAlreadyRecordedError(
        "The client's answer is recorded once",
      );
    if (state.status !== "SENT")
      throw new ProposalNotSentError(
        "An answer is recorded on a sent proposal",
      );
    if (!accepted && (reason == null || reason.trim() === ""))
      throw new DeclineReasonRequiredError(
        "A declined proposal needs a reason",
      );
    if (
      accepted &&
      !state.options.some((option) => option.id === chosenOptionId)
    )
      throw new ChosenOptionNotFoundError(
        "An accepted answer needs an option that exists",
      );
    state.status = accepted ? "ACCEPTED" : "DECLINED";
    state.chosenOptionId = accepted ? chosenOptionId! : null;
    state.reason = accepted ? null : reason!;
    state.answeredAt = answeredAt;
  },
  setSignedCopyOperation(state, action) {
    if (state.status !== "ACCEPTED")
      throw new SignedCopyNotAllowedError(
        "The signed copy can change only while the proposal is accepted",
      );
    state.signedCopy = action.input.file
      ? checkedFile(action.input.file)
      : null;
  },
  withdrawProposalOperation(state, action) {
    if (!["DRAFT", "APPROVED", "SENT"].includes(state.status))
      throw new ProposalFinalError(
        "An accepted, declined, withdrawn or superseded proposal cannot be withdrawn",
      );
    if (action.input.reason.trim() === "")
      throw new WithdrawReasonRequiredError(
        "Withdrawing a proposal needs a reason",
      );
    state.status = "WITHDRAWN";
    state.reason = action.input.reason;
  },
  supersedeProposalOperation(state, action) {
    if (state.status !== "SENT" && state.status !== "DECLINED")
      throw new ProposalNotSupersedableError(
        "Only a sent or declined proposal can be superseded",
      );
    if (action.input.supersededByProposalId.trim() === "")
      throw new ReplacementRequiredError(
        "Superseding a proposal needs the proposal that replaces it",
      );
    state.status = "SUPERSEDED";
    state.supersededByProposalId = action.input.supersededByProposalId;
  },
};
