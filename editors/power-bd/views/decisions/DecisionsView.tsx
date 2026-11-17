import { useToday } from "../../components/shared/useToday.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useSetSelectedNode } from "@powerhousedao/reactor-browser";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { EmptyStart } from "../../components/EmptyStart.js";
import { Icon } from "../../components/Icon.js";
import { useCreateRecord } from "../../components/shared/useCreateRecord.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import { decisionImpact } from "../../kit/decision-impact/index.js";
import {
  daysOverdue,
  gatedTotal,
  isOverdue,
  sortDecisions,
} from "../../kit/decision-view/index.js";
import { useDecisionDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";

/** The Decisions place: open questions first, overdue ones marked, and a way to start one. */
export function DecisionsView({ driveId }: { driveId: string }) {
  const decisions = useDecisionDocumentsInSelectedDrive() ?? [];
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const opps = useOpportunityDocumentsInSelectedDrive() ?? [];
  const props = useProposalDocumentsInSelectedDrive() ?? [];
  const select = useSetSelectedNode();
  const team = useTeam();
  const today = useToday();

  const {
    create: createRecord,
    busy,
    error,
  } = useCreateRecord(
    driveId,
    "Decisions",
    "powerbd/decision",
    "The decision could not be created.",
  );
  const create = () => void createRecord("New decision");

  const rows = sortDecisions(
    decisions.map((d) => ({
      id: d.header.id,
      s: d.state.global,
      status: d.state.global.status,
      decideBy: d.state.global.decideBy,
    })),
    today,
  );
  const gates = (id: string) =>
    gatedTotal(
      decisionImpact({
        decisionId: id,
        leads: leads.map((d) => ({ id: d.header.id, state: d.state.global })),
        opportunities: opps.map((d) => ({
          id: d.header.id,
          state: d.state.global,
        })),
        proposals: props.map((d) => ({
          id: d.header.id,
          state: d.state.global,
        })),
      }),
    );

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">Decisions</h1>
        <span className="pb-toolbar__spacer" />
        {rows.length > 0 && (
          <button
            className="pb-btn pb-btn--primary"
            disabled={busy}
            onClick={create}
          >
            <Icon name="plus" />
            New decision
          </button>
        )}
      </div>
      <ErrorLine message={error} />
      {rows.length === 0 ? (
        <EmptyStart
          icon="decisions"
          title="No decisions yet"
          text="A decision is a question the company must answer before a lead or an application can move on."
          example={{
            title: "Do we apply alone or as a consortium?",
            detail:
              "Mara Lind decides by Fri 20 Nov · two funding opportunities wait on it",
          }}
          action={
            <button
              type="button"
              className="pb-btn pb-btn--primary"
              disabled={busy}
              onClick={create}
            >
              <Icon name="plus" />
              Add your first decision
            </button>
          }
        />
      ) : (
        <div className="pb-table-wrap">
          <table className="pb-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Decide by</th>
                <th>Gates</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ id, s, status, decideBy }) => {
                const tag = VOCABULARY.decisionStatus.find(
                  (t) => t.value === status,
                );
                const late = isOverdue(status, decideBy, today);
                const n = gates(id);
                return (
                  <tr
                    key={id}
                    className="pb-clickable"
                    onClick={() => select(id)}
                  >
                    <td className="pb-table__title">
                      {s.question || "Untitled decision"}
                    </td>
                    <td>
                      <span className={`pb-tag pb-tag--${tag?.tone}`}>
                        {tag?.label}
                      </span>
                    </td>
                    <td>
                      {s.owner ? (
                        team.ownerName(s.owner)
                      ) : (
                        <span className="pb-faint">No owner</span>
                      )}
                    </td>
                    <td>
                      {decideBy ? (
                        <span className={late ? "pb-relative is-overdue" : ""}>
                          {fmtDay(decideBy)}
                          {late
                            ? ` · ${daysOverdue(decideBy, today)} days overdue`
                            : ""}
                        </span>
                      ) : (
                        <span className="pb-faint">No day set</span>
                      )}
                    </td>
                    <td>
                      {n ? (
                        `${n} ${n === 1 ? "item" : "items"} waiting`
                      ) : (
                        <span className="pb-faint">Nothing</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
