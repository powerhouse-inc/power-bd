import { actions } from "document-models/proposal";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { DraftValue } from "../../components/shared/ProposalBadge.js";
import { Section } from "../../components/shared/relationship/common.js";
import { useRun } from "../../components/shared/useRun.js";
import type { ProposalRow } from "../../kit/proposal-list/index.js";
import { useStartProposal } from "./useStartProposal.js";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";

/** Starts a proposal on a lead and opens it; `error` is why it could not be started. */
export function useNewProposal(leadId: string) {
  const { start, error: startError } = useStartProposal();
  const run = useRun();
  return {
    start: () =>
      run.run(
        (e) =>
          void start("New proposal", [actions.setProposalParties({ leadId })], e),
      ),
    error: run.error ?? startError,
  };
}

/**
 * A lead's proposals as cards: title, status, value and the next action, and a
 * way to start one. Not offered on an investor lead.
 */
export function ProposalsSection({
  leadId,
  kind,
  rows,
}: {
  leadId: string;
  kind: string | null | undefined;
  /** The lead's own proposals. */
  rows: readonly ProposalRow[];
}) {
  const select = useSetSelectedNode();
  const { start, error } = useNewProposal(leadId);
  if (kind === "INVESTOR") return null;
  return (
    <Section
      title="Proposals"
      count={rows.length}
      action={
        <button className="pb-btn pb-btn--sm" onClick={start}>
          <Icon name="plus" />
          New proposal
        </button>
      }
    >
      {rows.length === 0 ? (
        <p className="pb-faint pb-small">
          No proposals yet. One starts here, from its lead.
        </p>
      ) : (
        <div className="pb-proposal-cards">
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              className="pb-proposal-card"
              onClick={() => select(r.id)}
            >
              <span className="pb-proposal-card__head">
                <Icon name="proposal" />
                <span className="pb-proposal-card__title">{r.title}</span>
                <span className={`pb-tag pb-tag--${r.tone}`}>
                  {r.statusLabel}
                </span>
              </span>
              <span
                className={`pb-proposal-card__value${r.priced ? "" : " is-empty"}`}
              >
                {r.valueNote ? <DraftValue value={r.value} /> : r.value}
              </span>
              <span
                className={`pb-proposal-card__next${r.next ? "" : " is-done"}`}
              >
                {r.next ? <Icon name="arrow-right" /> : null}
                {r.next?.what ?? "Nothing to do"}
              </span>
            </button>
          ))}
        </div>
      )}
      <ErrorLine message={error} />
    </Section>
  );
}
