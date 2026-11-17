import type { MessageChannel } from "document-models/lead";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import {
  type OnErrors,
  type Option,
} from "../../components/shared/relationship/common.js";

export type MessageView = {
  id: string;
  channel: string;
  recipient?: { contactId: string; personId: string } | null;
  subject?: string | null;
  body: string;
  angleId?: string | null;
  status: string;
  draftedBy: string;
  approvedBy?: string | null;
  sentBy?: string | null;
  sentAt?: string | null;
};

export type MessageCallbacks = {
  onDraft: (
    m: {
      id: string;
      channel: MessageChannel;
      recipient?: { contactId: string; personId: string };
      subject?: string;
      body: string;
      angleId?: string;
    },
    onErrors: OnErrors,
  ) => void;
  onUpdate: (
    m: { id: string; subject: string; body: string },
    onErrors: OnErrors,
  ) => void;
  onApprove: (id: string, onErrors: OnErrors) => void;
  onReopen: (id: string, onErrors: OnErrors) => void;
  onMarkSent: (id: string, onErrors: OnErrors) => void;
  onDiscard: (id: string, onErrors: OnErrors) => void;
};

export const CHANNELS: Option[] = [
  { value: "EMAIL", label: "Email" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "OTHER", label: "Other" },
];

export const term = (v: string) =>
  VOCABULARY.messageStatus.find((t) => t.value === v) ?? {
    label: v,
    tone: "default",
  };
