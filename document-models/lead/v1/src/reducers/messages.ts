import type { LeadMessagesOperations } from "document-models/lead/v1";
import {
  AngleNotFoundError,
  DuplicateMessageIdError,
  MessageFinalError,
  MessageNotApprovedError,
  MessageNotDraftError,
  MessageNotFoundError,
} from "../../gen/messages/error.js";

export const leadMessagesOperations: LeadMessagesOperations = {
  draftMessageOperation(state, action) {
    const {
      id,
      channel,
      recipient,
      subject,
      body,
      angleId,
      draftedBy,
      draftedAt,
    } = action.input;
    if (state.messages.some((message) => message.id === id))
      throw new DuplicateMessageIdError(`Message ${id} already exists`);
    if (angleId != null && !state.angles.some((angle) => angle.id === angleId))
      throw new AngleNotFoundError(`Angle ${angleId} not found`);
    state.messages.push({
      id,
      channel,
      recipient: recipient
        ? { contactId: recipient.contactId, personId: recipient.personId }
        : null,
      subject: subject ?? null,
      body,
      angleId: angleId ?? null,
      status: "DRAFT",
      draftedBy,
      draftedAt,
      approvedBy: null,
      approvedAt: null,
      sentBy: null,
      sentAt: null,
    });
  },
  updateMessageOperation(state, action) {
    const { id, channel, recipient, subject, body, angleId } = action.input;
    const message = state.messages.find((m) => m.id === id);
    if (!message) throw new MessageNotFoundError(`Message ${id} not found`);
    if (message.status !== "DRAFT")
      throw new MessageNotDraftError("Only a draft can be updated or approved");
    if (angleId != null && !state.angles.some((angle) => angle.id === angleId))
      throw new AngleNotFoundError(`Angle ${angleId} not found`);
    if (channel != null) message.channel = channel;
    if (recipient !== undefined)
      message.recipient = recipient
        ? { contactId: recipient.contactId, personId: recipient.personId }
        : null;
    if (subject !== undefined) message.subject = subject;
    if (body != null) message.body = body;
    if (angleId !== undefined) message.angleId = angleId;
  },
  approveMessageOperation(state, action) {
    const { id, approvedBy, approvedAt } = action.input;
    const message = state.messages.find((m) => m.id === id);
    if (!message) throw new MessageNotFoundError(`Message ${id} not found`);
    if (message.status !== "DRAFT")
      throw new MessageNotDraftError("Only a draft can be updated or approved");
    message.status = "APPROVED";
    message.approvedBy = approvedBy;
    message.approvedAt = approvedAt;
  },
  reopenMessageOperation(state, action) {
    const { id } = action.input;
    const message = state.messages.find((m) => m.id === id);
    if (!message) throw new MessageNotFoundError(`Message ${id} not found`);
    if (message.status !== "APPROVED")
      throw new MessageNotApprovedError(
        "Only an approved message can be reopened or marked sent",
      );
    message.status = "DRAFT";
    message.approvedBy = null;
    message.approvedAt = null;
  },
  markMessageSentOperation(state, action) {
    const { id, sentBy, sentAt } = action.input;
    const message = state.messages.find((m) => m.id === id);
    if (!message) throw new MessageNotFoundError(`Message ${id} not found`);
    if (message.status !== "APPROVED")
      throw new MessageNotApprovedError(
        "Only an approved message can be reopened or marked sent",
      );
    message.status = "SENT";
    message.sentBy = sentBy;
    message.sentAt = sentAt;
  },
  discardMessageOperation(state, action) {
    const { id } = action.input;
    const message = state.messages.find((m) => m.id === id);
    if (!message) throw new MessageNotFoundError(`Message ${id} not found`);
    if (message.status === "SENT" || message.status === "DISCARDED")
      throw new MessageFinalError("A sent or discarded message is final");
    message.status = "DISCARDED";
  },
};
