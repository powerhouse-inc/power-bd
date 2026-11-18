import { useState } from "react";
import { FundingBoard } from "./FundingBoard.js";
import { GroupedTable } from "../../components/shared/board/GroupedTable.js";
import {
  FUNDING_STATUSES,
  opportunityMoveCard,
  opportunityStatusTargets,
} from "../../kit/overview-view/index.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { settingsOrDefaults } from "../../kit/settings/index.js";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { EmptyStart } from "../../components/EmptyStart.js";
import { Icon } from "../../components/Icon.js";
import { useCreateRecord } from "../../components/shared/useCreateRecord.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { fmtInstant } from "../../components/shared/relationship/common.js";
import { deadline, sortByDeadline } from "../../kit/funding/index.js";
import { attemptsLeft } from "../../kit/overview/index.js";
import { useNow } from "../../components/shared/useNow.js";
import { useBdSettingsDocumentsInSelectedDrive, useContactDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";

/** The Funding place: opportunities by status on a board, or by status in deadline order in a list, and a way to start one. */
export function FundingView({ driveId }: { driveId: string }) {
  const docs = useOpportunityDocumentsInSelectedDrive() ?? [];
  const contacts = useContactDocumentsInSelectedDrive() ?? [];
  const { timeZone: ourZone } = settingsOrDefaults(
    useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global,
  );
  const select = useSetSelectedNode();
  const team = useTeam();
  const now = useNow();
  const [asBoard, setAsBoard] = useState(true);

  const {
    create: createRecord,
    busy,
    error,
  } = useCreateRecord(
    driveId,
    "Opportunities",
    "powerbd/opportunity",
    "The opportunity could not be created.",
  );
  const create = () => void createRecord("New opportunity");

  const all = docs.map((d) => ({
    id: d.header.id,
    state: d.state.global,
  }));
  const rows = sortByDeadline(all, now);
  const funderName = (id?: string | null) =>
    contacts.find((c) => c.header.id === id)?.state.global.name;

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">Funding</h1>
        <span className="pb-toolbar__spacer" />
        {rows.length > 0 && (
          <button
            className="pb-btn pb-btn--primary"
            disabled={busy}
            onClick={create}
          >
            <Icon name="plus" />
            New opportunity
          </button>
        )}
      </div>
      <ErrorLine message={error} />
      {rows.length === 0 ? (
        <EmptyStart
          icon="funding"
          title="No funding opportunities yet"
          text="A funding opportunity is one grant, call or programme you might apply to, kept with its deadline."
          example={{
            title: "Harbour Innovation Fund, round 3",
            detail:
              "Grant of 250,000 EUR · deadline Fri 27 Nov, 17:00 · Jonas Brandt owns it",
          }}
          action={
            <button
              type="button"
              className="pb-btn pb-btn--primary"
              disabled={busy}
              onClick={create}
            >
              <Icon name="plus" />
              Add your first opportunity
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
            <FundingBoard
              rows={rows}
              now={now}
              ourZone={ourZone}
              funderName={funderName}
              ownerName={team.ownerName}
              onOpen={select}
            />
          ) : (
            <GroupedTable
              head={
                <>
                  <th>Deadline</th>
                  <th>Opportunity</th>
                  <th>Funder</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Amount</th>
                  <th>Attempts left</th>
                </>
              }
              columns={7}
              statuses={FUNDING_STATUSES}
              terms={VOCABULARY.opportunityStatus}
              rows={rows.map(({ id, state }) => ({
                key: id,
                status: state.status,
                name: state.name || "Untitled opportunity",
                state,
              }))}
              targetsOf={(id) => {
                const s = rows.find((r) => r.id === id)?.state;
                return s
                  ? opportunityStatusTargets(opportunityMoveCard(s))
                  : [];
              }}
              onRow={(r) => select(r.key)}
              onOpenRecord={select}
              cells={({ key: id, state: s }) => {
                const d = deadline(s, now);
                const st = VOCABULARY.opportunityStatus.find(
                  (t) => t.value === s.status,
                );
                const left = attemptsLeft({ id, state: s }, all);
                return (
                  <>
                    <td className="pb-num pb-nowrap">
                      {d ? (
                        <>
                          {fmtInstant(d.step.at, ourZone)}
                          <span className="pb-table__sub">
                            {d.step.label}
                            {d.targeted ? " · we aim for this" : ""}
                          </span>
                        </>
                      ) : (
                        <span className="pb-faint">No date</span>
                      )}
                    </td>
                    <td className="pb-table__title">
                      {s.name || "Untitled opportunity"}
                    </td>
                    <td>
                      {funderName(s.funderId) ?? (
                        <span className="pb-faint">Not set</span>
                      )}
                    </td>
                    <td>
                      <span className={`pb-tag pb-tag--${st?.tone}`}>
                        {st?.label}
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
                      {s.amount != null && s.currency ? (
                        <span className="pb-amount">
                          {s.amount.toLocaleString("en-GB")}
                          <span className="pb-amount__ccy">{s.currency}</span>
                        </span>
                      ) : (
                        <span className="pb-faint">Not set</span>
                      )}
                    </td>
                    <td>
                      {left === null ? (
                        <span className="pb-faint">No limit</span>
                      ) : (
                        <span
                          className={
                            left <= 1 ? "pb-tag pb-tag--orange" : undefined
                          }
                        >
                          {left}
                          {s.attemptLimit ? ` of ${s.attemptLimit.max}` : ""}
                        </span>
                      )}
                    </td>
                  </>
                );
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
