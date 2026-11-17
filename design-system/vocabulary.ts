import type { IconName } from "./icons.js";

/** The nine palette tones, plus `default` for neutral tags. */
export type Tone =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

export interface Term {
  value: string;
  label: string;
  tone: Tone;
  icon?: IconName;
  /** For a slipping reason: the fix, as the label of its button. */
  action?: string;
}

/**
 * Every enumerated value the app shows, with its label, tone and icon. Kept
 * here once so the app, the overview and the design system agree. Colour only
 * marks meaning, and every tag also carries its label (meaning never rests on
 * colour alone):
 *   gray: not started or neutral · blue: in progress · purple: waiting on the
 *   other side · yellow: needs a decision · orange: needs attention ·
 *   green: done well · red: failed or overdue · brown: paused.
 */
export const VOCABULARY = {
  commonStage: [
    { value: "NEW", label: "New", tone: "gray" },
    { value: "ACTIVE", label: "Active", tone: "blue" },
    { value: "PARKED", label: "Parked", tone: "brown" },
    { value: "CLOSED", label: "Closed", tone: "default" },
  ],
  relationshipKind: [
    { value: "SALES", label: "Sales", tone: "default", icon: "sales" },
    {
      value: "PARTNERSHIP",
      label: "Partnership",
      tone: "default",
      icon: "partnership",
    },
    { value: "EXCHANGE", label: "Exchange", tone: "default", icon: "exchange" },
    {
      value: "INVESTOR",
      label: "Investor",
      tone: "default",
      icon: "investors",
    },
    { value: "FUNDING", label: "Funding", tone: "default", icon: "funding" },
  ],
  leadStatus: [
    { value: "TO_CONTACT", label: "To contact", tone: "gray" },
    { value: "IN_TOUCH", label: "In touch", tone: "blue" },
    { value: "MEETING_SET", label: "Meeting set", tone: "purple" },
    { value: "MET", label: "Met", tone: "purple" },
    { value: "PROPOSAL", label: "Proposal", tone: "orange" },
    { value: "WON", label: "Won", tone: "green" },
    { value: "LOST", label: "Lost", tone: "red" },
    { value: "PARKED", label: "Parked", tone: "brown" },
  ],
  opportunityStatus: [
    { value: "WATCHING", label: "Watching", tone: "brown" },
    { value: "TO_EVALUATE", label: "To evaluate", tone: "gray" },
    { value: "DECIDING", label: "Deciding", tone: "yellow" },
    { value: "PREPARING", label: "Preparing", tone: "blue" },
    { value: "SUBMITTED", label: "Submitted", tone: "purple" },
    { value: "NEXT_STAGE", label: "Next stage", tone: "purple" },
    { value: "AWARDED", label: "Awarded", tone: "green" },
    { value: "REJECTED", label: "Rejected", tone: "red" },
    { value: "WITHDRAWN", label: "Withdrawn", tone: "gray" },
    { value: "NO_GO", label: "No-go", tone: "red" },
  ],
  instrument: [
    { value: "GRANT", label: "Grant", tone: "default" },
    { value: "FELLOWSHIP", label: "Fellowship", tone: "default" },
    { value: "ACCELERATOR", label: "Accelerator", tone: "default" },
    { value: "CONSORTIUM_CALL", label: "Consortium call", tone: "default" },
    { value: "EQUITY", label: "Equity", tone: "default" },
    { value: "IN_KIND", label: "In-kind", tone: "default" },
    { value: "PRIZE", label: "Prize", tone: "default" },
    { value: "MIXED", label: "Mixed", tone: "default" },
  ],
  fit: [
    { value: "BEST", label: "Best", tone: "green", icon: "star" },
    { value: "GOOD", label: "Good", tone: "blue" },
    { value: "LATER", label: "Later", tone: "yellow" },
    { value: "UNLIKELY", label: "Unlikely", tone: "gray" },
  ],
  conditionState: [
    { value: "MET", label: "Met", tone: "green" },
    { value: "NOT_MET", label: "Not met", tone: "red" },
    { value: "UNKNOWN", label: "Unknown", tone: "gray" },
    {
      value: "WAITING_ON_DECISION",
      label: "Waiting on decision",
      tone: "yellow",
      icon: "decisions",
    },
  ],
  decisionStatus: [
    { value: "OPEN", label: "Open", tone: "yellow" },
    { value: "ANSWERED", label: "Answered", tone: "green" },
    { value: "WITHDRAWN", label: "Withdrawn", tone: "gray" },
  ],
  messageStatus: [
    { value: "DRAFT", label: "Draft", tone: "gray" },
    { value: "APPROVED", label: "Approved", tone: "blue" },
    { value: "SENT", label: "Sent", tone: "green" },
    { value: "DISCARDED", label: "Discarded", tone: "default" },
  ],
  positioningStatus: [
    { value: "DRAFT", label: "Draft", tone: "gray" },
    { value: "APPROVED", label: "Approved", tone: "green" },
    { value: "RETIRED", label: "Retired", tone: "default" },
  ],
  investorRow: [
    { value: "LISTED", label: "Listed", tone: "gray" },
    { value: "SHORTLISTED", label: "Shortlisted", tone: "blue" },
    { value: "EXCLUDED", label: "Excluded", tone: "red" },
    { value: "ENGAGED", label: "Engaged", tone: "green" },
  ],
  partnerStatus: [
    { value: "ASKED", label: "Asked", tone: "gray" },
    { value: "INTERESTED", label: "Interested", tone: "blue" },
    { value: "COMMITTED", label: "Committed", tone: "purple" },
    { value: "SIGNED", label: "Signed", tone: "green" },
  ],
  proposalStatus: [
    { value: "DRAFT", label: "Draft", tone: "gray" },
    { value: "APPROVED", label: "Approved", tone: "blue" },
    { value: "SENT", label: "Sent", tone: "purple" },
    { value: "ACCEPTED", label: "Accepted", tone: "green" },
    { value: "DECLINED", label: "Declined", tone: "red" },
    { value: "WITHDRAWN", label: "Withdrawn", tone: "gray" },
    { value: "SUPERSEDED", label: "Superseded", tone: "gray" },
  ],
  submissionResult: [
    { value: "PASSED", label: "Passed", tone: "green" },
    { value: "AWARDED", label: "Awarded", tone: "green" },
    { value: "UNSUCCESSFUL", label: "Unsuccessful", tone: "red" },
    { value: "WITHDRAWN", label: "Withdrawn", tone: "gray" },
  ],
  interactionKind: [
    { value: "EMAIL", label: "Email", tone: "default", icon: "mail" },
    { value: "CALL", label: "Call", tone: "default", icon: "phone" },
    { value: "MEETING", label: "Meeting", tone: "default", icon: "meeting" },
    { value: "EVENT", label: "Event", tone: "default", icon: "event" },
    { value: "MESSAGE", label: "Message", tone: "default", icon: "message" },
    { value: "OTHER", label: "Other", tone: "default", icon: "note" },
  ],
  interactionStatus: [
    { value: "SCHEDULED", label: "Scheduled", tone: "blue" },
    { value: "HELD", label: "Held", tone: "green" },
    { value: "CANCELLED", label: "Cancelled", tone: "default" },
  ],
  slipping: [
    {
      value: "NO_OWNER",
      label: "No owner",
      tone: "red",
      icon: "user",
      action: "Assign an owner",
    },
    {
      value: "NO_NEXT_STEP",
      label: "No next step",
      tone: "red",
      icon: "checklist",
      action: "Add a next step",
    },
    {
      value: "NEXT_STEP_OVERDUE",
      label: "Next step overdue",
      tone: "red",
      icon: "clock",
      action: "Update the next step",
    },
    {
      value: "FUNDING_DATE_PASSED",
      label: "Funding date passed",
      tone: "red",
      icon: "hourglass",
      action: "Record what happened",
    },
    {
      value: "DECISION_OVERDUE",
      label: "Decision overdue",
      tone: "red",
      icon: "decisions",
      action: "Answer the decision",
    },
    {
      value: "DECISION_ANSWERED_REVIEW",
      label: "Decision answered, review",
      tone: "orange",
      icon: "decisions",
      action: "Review the condition",
    },
    {
      value: "CONDITION_RECHECK",
      label: "Recheck condition",
      tone: "orange",
      icon: "refresh",
      action: "Recheck the condition",
    },
    {
      value: "MEETING_NOT_RECORDED",
      label: "Meeting not recorded",
      tone: "orange",
      icon: "meeting",
      action: "Record how it went",
    },
    {
      value: "PROPOSAL_UNANSWERED",
      label: "Proposal unanswered",
      tone: "red",
      icon: "send",
      action: "Follow up on the proposal",
    },
    {
      value: "PROPOSAL_ANSWER_NOT_REFLECTED",
      label: "Proposal answered, update the lead",
      tone: "orange",
      icon: "send",
      action: "Update the lead",
    },
  ],
} satisfies Record<string, Term[]>;

export type VocabularyName = keyof typeof VOCABULARY;

/** Section titles for the design-system showcase. */
export const VOCABULARY_TITLES: Record<VocabularyName, string> = {
  commonStage: "Common stage (overview board)",
  relationshipKind: "Kind of relationship",
  leadStatus: "Lead status",
  opportunityStatus: "Opportunity status",
  instrument: "Funding instrument",
  fit: "Fit",
  conditionState: "Condition",
  decisionStatus: "Company decision",
  messageStatus: "Outreach message",
  positioningStatus: "Positioning",
  investorRow: "Investor row",
  partnerStatus: "Consortium partner",
  proposalStatus: "Proposal status",
  submissionResult: "Submission result",
  interactionKind: "Interaction kind",
  interactionStatus: "Interaction status",
  slipping: "Slipping reason",
};
