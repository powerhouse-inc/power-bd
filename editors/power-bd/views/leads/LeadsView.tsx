import { LeadsBoard } from "./LeadsBoard.js";
import { NextStep } from "./NextStep.js";
import { useSetSelectedNode } from "@powerhousedao/reactor-browser";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { EmptyStart } from "../../components/EmptyStart.js";
import { Icon } from "../../components/Icon.js";
import { useCreateRecord } from "../../components/shared/useCreateRecord.js";
import { useToday } from "../../components/shared/useToday.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { ProposalBadge } from "../../components/shared/ProposalBadge.js";
import { nextAction } from "../../kit/lead-view/index.js";
import { proposalBadges } from "../../kit/proposal-list/index.js";
import { useContactDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";

/** The Leads place: every lead with its status, owner and next step, and a way to start one. */
export function LeadsView({ driveId }: { driveId: string }) {
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const contacts = useContactDocumentsInSelectedDrive() ?? [];
  const badges = proposalBadges(
    (useProposalDocumentsInSelectedDrive() ?? []).map((d) => ({
      id: d.header.id,
      state: d.state.global,
    })),
  );
  const select = useSetSelectedNode();
  const team = useTeam();
  const [asBoard, setAsBoard] = useState(true);

  const organisationName = (id: string | null | undefined) =>
    id
      ? contacts.find((c) => c.header.id === id)?.state.global.name || null
      : null;

  const {
    create: createRecord,
    busy,
    error,
  } = useCreateRecord(
    driveId,
    "Leads",
    "powerbd/lead",
    "The lead could not be created.",
  );
  const create = () => void createRecord("New lead");
  const today = useToday();

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">Leads</h1>
        <span className="pb-toolbar__spacer" />
        {leads.length > 0 && (
          <button
            className="pb-btn pb-btn--primary"
            disabled={busy}
            onClick={create}
          >
            <Icon name="plus" />
            New lead
          </button>
        )}
      </div>
      <ErrorLine message={error} />
      {leads.length === 0 ? (
        <EmptyStart
          icon="leads"
          title="No leads yet"
          text="A lead is one organisation you are talking to, or want to: a customer, a partner, an exchange or an investor."
          example={{
            title: "Pilot with Kelvar Institute",
            detail:
              "Sales lead · Mara Lind owns it · next step: send the pilot outline by Fri 27 Nov",
          }}
          action={
            <button
              type="button"
              className="pb-btn pb-btn--primary"
              disabled={busy}
              onClick={create}
            >
              <Icon name="plus" />
              Add your first lead
            </button>
          }
        />
      ) : (
        <>
          <div className="pb-toolbar pb-mb-8">
            <div className="pb-segmented">
              <button
                className={`pb-segmented__item${asBoard ? " is-active" : ""}`}
                onClick={() => setAsBoard(true)}
              >
                <Icon name="board" />
                Board
              </button>
              <button
                className={`pb-segmented__item${asBoard ? "" : " is-active"}`}
                onClick={() => setAsBoard(false)}
              >
                <Icon name="table" />
                List
              </button>
            </div>
          </div>
          {asBoard ? (
            <LeadsBoard
              leads={leads}
              badges={badges}
              today={today}
              ownerName={team.ownerName}
              onOpen={select}
            />
          ) : (
            <div className="pb-table-wrap">
              <table className="pb-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Organisation</th>
                    <th>Kind</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Proposal</th>
                    <th>Next step</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((d) => {
                    const s = d.state.global;
                    const kind = VOCABULARY.relationshipKind.find(
                      (k) => k.value === s.kind,
                    );
                    const status = VOCABULARY.leadStatus.find(
                      (k) => k.value === s.status,
                    );
                    const next = nextAction(s, today);
                    const badge = badges[d.header.id];
                    return (
                      <tr
                        key={d.header.id}
                        className="pb-clickable"
                        onClick={() => select(d.header.id)}
                      >
                        <td className="pb-table__title">
                          {s.name || "Untitled lead"}
                        </td>
                        <td>
                          {organisationName(s.organisationId) ?? (
                            <span className="pb-faint">—</span>
                          )}
                        </td>
                        <td>
                          {kind ? (
                            <span className="pb-tag pb-tag--default">
                              {kind.icon ? <Icon name={kind.icon} /> : null}
                              {kind.label}
                            </span>
                          ) : (
                            <span className="pb-faint">Not set</span>
                          )}
                        </td>
                        <td>
                          <span className={`pb-tag pb-tag--${status?.tone}`}>
                            {status?.label}
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
                          {badge ? (
                            <ProposalBadge badge={badge} />
                          ) : (
                            <span className="pb-faint">—</span>
                          )}
                        </td>
                        <td>
                          <NextStep next={next} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
