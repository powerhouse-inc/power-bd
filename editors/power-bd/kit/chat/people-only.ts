/**
 * The eight people-only actions (spec, "People-only actions"), in the team's
 * words. In the chat they are ordinary writes: the agent takes one only when
 * the person asks, names it first, and the approval card (or the person's
 * request, under auto-approve) is their approval. Operation permissions on
 * the BD drive still apply, since the agent signs with the person's key.
 */

/** The eight people-only actions. */
export const PEOPLE_ONLY_ACTIONS = [
  "APPROVE_MESSAGE",
  "MARK_MESSAGE_SENT",
  "APPROVE_POSITIONING",
  "ANSWER_DECISION",
  "DECIDE_GO_NO_GO",
  "MARK_SUBMISSION",
  "APPROVE_PROPOSAL",
  "MARK_PROPOSAL_SENT",
] as const;

export type PeopleOnlyAction = (typeof PEOPLE_ONLY_ACTIONS)[number];

/** Each action in the team's words, as the spec lists them. */
export const PEOPLE_ONLY_STEPS: Record<PeopleOnlyAction, string> = {
  APPROVE_MESSAGE: "approving an outreach message",
  MARK_MESSAGE_SENT: "marking an outreach message sent",
  APPROVE_POSITIONING: "approving positioning",
  ANSWER_DECISION: "answering a company decision",
  DECIDE_GO_NO_GO: "deciding go or no-go",
  MARK_SUBMISSION: "marking a submission",
  APPROVE_PROPOSAL: "approving a proposal",
  MARK_PROPOSAL_SENT: "marking a proposal sent",
};
