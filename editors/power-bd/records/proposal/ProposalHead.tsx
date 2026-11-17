import type { ProposalState } from "document-models/proposal";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import {
  PROPOSAL_STATUS,
  proposalPath,
} from "../../kit/proposal-view/index.js";

/** The top of the proposal page: links back to its lead and organisation, the title row and the status path. */
export function ProposalHead({
  s,
  leadName,
  organisationId,
  organisationName,
  lapsed,
  canRevise,
  error,
  onOpen,
  onCopy,
  onRevise,
}: {
  s: ProposalState;
  leadName: string | null | undefined;
  organisationId: string | null | undefined;
  organisationName: string;
  lapsed: boolean;
  canRevise: boolean;
  error: string | null | undefined;
  onOpen: (id: string) => void;
  onCopy: () => void;
  onRevise: () => void;
}) {
  const term = PROPOSAL_STATUS[s.status];
  const leadId = s.leadId;
  return (
    <>
      {leadId ? (
        <nav className="pb-backlinks" aria-label="This proposal belongs to">
          <button className="pb-backlink" onClick={() => onOpen(leadId)}>
            <Icon name="leads" />
            <span>{leadName || "Its lead"}</span>
          </button>
          {organisationId ? (
            <>
              <span className="pb-backlinks__sep">·</span>
              <button
                className="pb-backlink"
                onClick={() => onOpen(organisationId)}
              >
                <Icon name="organisations" />
                <span>{organisationName}</span>
              </button>
            </>
          ) : null}
        </nav>
      ) : null}
      <div className="pb-page__head pb-page__head--row pb-wrap">
        <span className="pb-page__icon pb-page__icon--purple">
          <Icon name="proposal" />
        </span>
        <h1 className="pb-page__title">{s.title || "Untitled proposal"}</h1>
        <span className={`pb-tag pb-tag--${term.tone}`}>{term.label}</span>
        {lapsed ? (
          <span className="pb-tag pb-tag--red">Past its valid until day</span>
        ) : null}
        <span className="pb-toolbar__spacer pb-flex-1" />
        <button className="pb-btn pb-btn--sm" onClick={onCopy}>
          <Icon name="copy" />
          Copy as a new proposal
        </button>
        {canRevise ? (
          <button className="pb-btn pb-btn--sm" onClick={onRevise}>
            <Icon name="edit" />
            Revise
          </button>
        ) : null}
      </div>
      <ErrorLine message={error} />
      <ol className="pb-path pb-mt-6 pb-mb-8">
        {proposalPath(s.status).map((p) => (
          <li
            key={p.value}
            className={`pb-path__step${p.state === "done" ? " is-done" : p.state === "current" ? " is-current" : ""}`}
          >
            <span className="pb-path__dot">
              {p.state === "done" ? <Icon name="check" /> : null}
            </span>
            {p.label}
          </li>
        ))}
      </ol>
    </>
  );
}
