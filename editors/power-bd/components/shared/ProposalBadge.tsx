import type { ProposalBadge as Badge } from "../../kit/proposal-list/index.js";
import { Icon } from "../Icon.js";

/** A value that is shown and counted nowhere yet, with the word that says so. */
export function DraftValue({ value }: { value: string }) {
  return (
    <span
      className="pb-draft-value"
      title="Not counted in the lead's value or any total until the proposal is sent"
    >
      {value}
      <span className="pb-draft-value__note">Draft</span>
    </span>
  );
}

/** Says a lead has a proposal and where it stands; a draft's value shows marked as a draft. */
export function ProposalBadge({ badge }: { badge: Badge }) {
  return (
    <span className="pb-proposal-badge">
      <Icon name="proposal" />
      Proposal
      <span className={`pb-tag pb-tag--${badge.tone}`}>{badge.label}</span>
      {badge.draftValue ? <DraftValue value={badge.draftValue} /> : null}
      {badge.more > 0 ? (
        <span className="pb-proposal-badge__more">+{badge.more} more</span>
      ) : null}
    </span>
  );
}
