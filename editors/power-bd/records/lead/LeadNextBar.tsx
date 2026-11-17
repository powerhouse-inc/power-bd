import { useSetSelectedNode } from "@powerhousedao/reactor-browser";
import type { ReactNode } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import type { NextAction } from "../../kit/lead-view/index.js";
import type { LeadProposalNext } from "../../kit/proposal-list/index.js";
import { useNewProposal } from "../proposal/ProposalsSection.js";

/**
 * The lead's one next action. While the lead is at "proposal" it is the
 * proposal's (`proposal`), with the button that opens it or starts one;
 * otherwise the lead's own (`next`).
 */
export function LeadNextBar({
  leadId,
  next,
  proposal,
  error,
  onStepDone,
}: {
  leadId: string;
  next: NextAction;
  proposal: LeadProposalNext | null;
  /** Why the last "Mark done" was not accepted. */
  error: string | null;
  onStepDone: (id: string) => void;
}) {
  const select = useSetSelectedNode();
  const fresh = useNewProposal(leadId);
  let what = "";
  let why = "";
  let button: ReactNode = null;
  if (proposal) {
    const id = proposal.proposalId;
    what = proposal.what;
    why = proposal.why;
    button = (
      <button
        className="pb-btn pb-btn--primary pb-btn--sm"
        onClick={() => (id ? select(id) : fresh.start())}
      >
        <Icon name={id ? "arrow-right" : "plus"} />
        {proposal.button}
      </button>
    );
  } else if (next.kind === "none") {
    return null;
  } else if (next.kind === "owner") {
    what = "Assign an owner";
    why = "Every lead past to contact needs someone who owns it";
  } else if (next.kind === "step") {
    what = next.text;
    why = next.dueDate
      ? `${next.overdue ? "Overdue · was due" : "Due"} ${fmtDay(next.dueDate)}`
      : "No due day";
    button = (
      <button
        className="pb-btn pb-btn--primary pb-btn--sm"
        onClick={() => onStepDone(next.id)}
      >
        <Icon name="check" />
        Mark done
      </button>
    );
  } else if (next.kind === "message") {
    what =
      next.status === "APPROVED"
        ? "Send the approved message yourself, then mark it sent"
        : "Review the draft message";
    why =
      next.status === "APPROVED"
        ? "Power BD sends nothing: mark it sent below once you have"
        : "Check it, then approve it below";
  } else {
    what = "Add a next step";
    why = "A lead without a next step is slipping";
  }
  return (
    <>
      <div className="pb-next pb-mb-14">
        <span className="pb-next__label">Next</span>
        <div className="pb-next__main">
          <span className="pb-next__what">{what}</span>
          <span className="pb-next__why">{why}</span>
        </div>
        {button}
      </div>
      <ErrorLine message={error ?? fresh.error} />
    </>
  );
}
