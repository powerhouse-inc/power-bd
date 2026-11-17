import type { LeadKind, LeadStatus } from "document-models/lead";

const OPEN: LeadStatus[] = [
  "TO_CONTACT",
  "IN_TOUCH",
  "MEETING_SET",
  "MET",
  "PROPOSAL",
];

export type PathStep = {
  value: LeadStatus;
  state: "done" | "current" | "todo";
};

/**
 * The steps a lead moves along. An investor lead never reaches proposal or
 * won. A parked lead sits at the step it was parked from; a lost lead's path
 * ends in lost.
 */
export function statusPath(
  status: LeadStatus,
  kind: LeadKind | null | undefined,
  parkedFrom: LeadStatus | null | undefined,
): PathStep[] {
  const investor = kind === "INVESTOR";
  const steps: LeadStatus[] = investor
    ? OPEN.filter((s) => s !== "PROPOSAL")
    : [...OPEN, "WON"];
  if (status === "LOST") steps.push("LOST");
  const at = status === "PARKED" ? (parkedFrom ?? "TO_CONTACT") : status;
  const index = steps.indexOf(at);
  return steps.map((value, i) => ({
    value,
    state: i < index ? "done" : i === index ? "current" : "todo",
  }));
}

export type NextAction =
  | { kind: "owner" }
  | {
      kind: "step";
      id: string;
      text: string;
      dueDate: string | null;
      overdue: boolean;
    }
  | { kind: "message"; id: string; status: "DRAFT" | "APPROVED" }
  | { kind: "add-step" }
  | { kind: "none" };

type StepLike = {
  id: string;
  text: string;
  dueDate?: string | null;
  doneAt?: string | null;
};
type MessageLike = { id: string; status: string };

/**
 * The one thing to do now: an owner, else the earliest open next step, else
 * an approved message waiting to be sent by a person, else a draft to review,
 * else a new next step. `today` is a `YYYY-MM-DD` day.
 */
export function nextAction(
  lead: {
    owner?: string | null;
    status: LeadStatus;
    nextSteps: readonly StepLike[];
    messages: readonly MessageLike[];
  },
  today: string,
): NextAction {
  if (lead.status === "WON" || lead.status === "LOST") return { kind: "none" };
  if (!lead.owner) return { kind: "owner" };
  const open = lead.nextSteps
    .filter((s) => !s.doneAt)
    .sort((a, b) =>
      (a.dueDate ?? "9999")
        .slice(0, 10)
        .localeCompare((b.dueDate ?? "9999").slice(0, 10)),
    );
  if (open.length > 0) {
    const s = open[0];
    const due = s.dueDate ? s.dueDate.slice(0, 10) : null;
    return {
      kind: "step",
      id: s.id,
      text: s.text,
      dueDate: due,
      overdue: due !== null && due < today.slice(0, 10),
    };
  }
  const approved = lead.messages.find((m) => m.status === "APPROVED");
  if (approved) return { kind: "message", id: approved.id, status: "APPROVED" };
  const draft = lead.messages.find((m) => m.status === "DRAFT");
  if (draft) return { kind: "message", id: draft.id, status: "DRAFT" };
  return { kind: "add-step" };
}
