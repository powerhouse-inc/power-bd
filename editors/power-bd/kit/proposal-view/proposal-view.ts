import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import type { ProposalState } from "document-models/proposal";

export type ProposalStatus = ProposalState["status"];

/** Labels and tones of the statuses, read from the design system's vocabulary. */
export const PROPOSAL_STATUS = Object.fromEntries(
  VOCABULARY.proposalStatus.map(({ value, label, tone }) => [
    value,
    { label, tone },
  ]),
) as Record<ProposalStatus, { label: string; tone: string }>;

export type PathStep = {
  value: string;
  label: string;
  state: "done" | "current" | "todo";
};

const MAIN: ProposalStatus[] = ["DRAFT", "APPROVED", "SENT"];

/** Draft, approved, sent, then the answer (accepted or declined) or an end state. */
export function proposalPath(status: ProposalStatus): PathStep[] {
  const last: { value: string; label: string } =
    status === "ACCEPTED" ||
    status === "DECLINED" ||
    status === "WITHDRAWN" ||
    status === "SUPERSEDED"
      ? { value: status, label: PROPOSAL_STATUS[status].label }
      : { value: "ANSWER", label: "Answered" };
  const values = [
    ...MAIN.map((s) => ({
      value: s as string,
      label: PROPOSAL_STATUS[s].label,
    })),
    last,
  ];
  const at = MAIN.includes(status) ? MAIN.indexOf(status) : 3;
  return values.map((v, i) => ({
    ...v,
    state: i < at ? "done" : i === at ? "current" : "todo",
  }));
}

/** "Lapsed" is not a status: a sent proposal past its valid-until day (`today` is `YYYY-MM-DD`). */
export function isLapsed(
  status: ProposalStatus,
  validUntil: string | null | undefined,
  today: string,
): boolean {
  return status === "SENT" && !!validUntil && validUntil.slice(0, 10) < today;
}

export type Next = { what: string; why: string };

export function nextStep(input: {
  status: ProposalStatus;
  findings: number;
  lapsed: boolean;
  signedCopy: boolean;
}): Next | null {
  switch (input.status) {
    case "DRAFT":
      return input.findings > 0
        ? {
            what: `Fix ${input.findings} ${input.findings === 1 ? "finding" : "findings"}`,
            why: "Approval opens when nothing is left to fix",
          }
        : {
            what: "Approve the proposal",
            why: "Nothing is left to fix; only a person approves",
          };
    case "APPROVED":
      return {
        what: "Send it yourself, then mark it sent",
        why: "Nothing is sent from Power BD",
      };
    case "SENT":
      return {
        what: "Record the client's answer",
        why: input.lapsed
          ? "Past its valid until day with no answer"
          : "Accepted with the option chosen, or declined with a reason",
      };
    case "ACCEPTED":
      return input.signedCopy
        ? null
        : {
            what: "Attach the signed copy",
            why: "Keeps the contract one click from the lead",
          };
    default:
      return null;
  }
}
