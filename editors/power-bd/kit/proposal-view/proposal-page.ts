import type { DecisionStatus } from "document-models/decision";
import type { PlaybookState } from "document-models/playbook";
import type { ProposalState } from "document-models/proposal";
import type {
  CheckFinding,
  CheckInput,
} from "../proposal-check/proposal-check.js";
import type { ConfidentialText } from "../sensitivity/sensitivity.js";
import type { ProposalStatus } from "./proposal-view.js";

/** Which block of the status panel a proposal shows. */
export type StatusPanel = "draft" | "approved" | "sent" | "answered" | "ended";

export type FrozenNotice = {
  tone: "blue" | "neutral";
  title: string;
  text: string;
};

export type StatusRules = {
  editable: boolean;
  panel: StatusPanel;
  /** The notice that says why the text is locked; none on a draft. */
  frozen: FrozenNotice | null;
  canRevise: boolean;
  canWithdraw: boolean;
  showsSentCopy: boolean;
  showsSignedCopy: boolean;
};

const APPROVED_NOTICE: FrozenNotice = {
  tone: "blue",
  title: "Approved, so the text is locked",
  text: "Reopen it to edit. Approval always matches the text that is sent.",
};
const SENT_NOTICE: FrozenNotice = {
  tone: "neutral",
  title: "Sent, so it can't change",
  text: "This is the record of what the client was offered. To change the offer, revise it: that makes a new draft and replaces this one once the new one is sent.",
};
const CLOSED_NOTICE: FrozenNotice = {
  tone: "neutral",
  title: "Closed, so it can't change",
  text: "The answer and the copies can still be recorded below.",
};

/** What the page offers for a status: one place for every "may it do this now" question. */
export function statusRules(status: ProposalStatus): StatusRules {
  const panel: StatusPanel =
    status === "DRAFT"
      ? "draft"
      : status === "APPROVED"
        ? "approved"
        : status === "SENT"
          ? "sent"
          : status === "ACCEPTED" || status === "DECLINED"
            ? "answered"
            : "ended";
  return {
    editable: status === "DRAFT",
    panel,
    frozen:
      status === "DRAFT"
        ? null
        : status === "APPROVED"
          ? APPROVED_NOTICE
          : status === "SENT"
            ? SENT_NOTICE
            : CLOSED_NOTICE,
    canRevise: status === "SENT" || status === "DECLINED",
    canWithdraw:
      status === "DRAFT" || status === "APPROVED" || status === "SENT",
    showsSentCopy:
      status === "SENT" || status === "ACCEPTED" || status === "DECLINED",
    showsSignedCopy: status === "ACCEPTED",
  };
}

/** The line beside the Approve button. */
export function approveNote(input: {
  gateMessage: string | null;
  signedIn: boolean;
  findings: number;
}): string {
  if (input.gateMessage) return `${input.gateMessage}. Only a person approves.`;
  if (!input.signedIn) return "Sign in to approve.";
  if (input.findings > 0)
    return "Approval opens when nothing is left to fix. Only a person approves.";
  return "Only a person approves. Approving locks the text until you reopen it.";
}

/** The recorded answer: "Accepted: Full build, Mon 2 Nov." */
export function answerLine(input: {
  status: "ACCEPTED" | "DECLINED";
  chosen: string | undefined;
  reason: string | null | undefined;
  day: string | null;
}): string {
  const head =
    input.status === "ACCEPTED"
      ? `Accepted${input.chosen ? `: ${input.chosen}` : ""}`
      : `Declined${input.reason ? `: ${input.reason}` : ""}`;
  return `${head}${input.day ? `, ${input.day}` : ""}.`;
}

/** The check's sentences by `list:id`, to show under the item they concern. */
export function findingFlags(
  findings: readonly Pick<CheckFinding, "concerns" | "sentence">[],
): Map<string, string[]> {
  const flags = new Map<string, string[]>();
  for (const f of findings) {
    if (!("list" in f.concerns)) continue;
    const key = `${f.concerns.list}:${f.concerns.id}`;
    flags.set(key, [...(flags.get(key) ?? []), f.sentence]);
  }
  return flags;
}

export type ContactChoice = {
  id: string;
  name: string;
  people: { id: string; name: string }[];
};

/** The names the text and the page use for the client and the recipient. */
export function partyNames(input: {
  contacts: readonly ContactChoice[];
  lead: { name?: string | null; organisationId?: string | null } | undefined;
  recipient: { contactId: string; personId?: string | null } | null | undefined;
}): { client: string; recipient: string } {
  const { contacts, lead, recipient } = input;
  const client =
    contacts.find((c) => c.id === lead?.organisationId)?.name ??
    lead?.name ??
    "the client";
  const contact = contacts.find((c) => c.id === recipient?.contactId);
  return {
    client,
    recipient:
      contact?.people.find((p) => p.id === recipient?.personId)?.name ??
      contact?.name ??
      "the recipient",
  };
}

/** What the check reads: the playbook and the lead's items when loaded, and the decisions the proposal references. */
export function checkInput(input: {
  proposal: ProposalState;
  playbook: Pick<PlaybookState, "positioning" | "neverClaims"> | undefined;
  confidentialItems: readonly ConfidentialText[] | undefined;
  decisions: readonly { id: string; status: DecisionStatus }[];
  today: string;
}): CheckInput {
  const { proposal } = input;
  return {
    proposal,
    playbook: {
      positioning: input.playbook?.positioning ?? [],
      neverClaims: input.playbook?.neverClaims ?? [],
    },
    confidentialItems: input.confidentialItems ?? [],
    decisions: proposal.references
      .filter((r) => r.kind === "DECISION")
      .flatMap((r) => {
        const d = input.decisions.find((x) => x.id === r.documentId);
        return d ? [{ id: r.documentId, status: d.status }] : [];
      }),
    today: input.today,
  };
}
