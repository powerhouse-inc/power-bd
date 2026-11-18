import { useSetSelectedNode } from "@powerhousedao/reactor-browser";
import { useState } from "react";
import { EmptyPlace } from "../../components/EmptyPlace.js";
import { EmptyStart } from "../../components/EmptyStart.js";
import { Icon } from "../../components/Icon.js";
import { useGoToPlace } from "../../components/PlaceContext.js";
import { Menu } from "../../components/shared/Menu.js";
import { DraftValue } from "../../components/shared/ProposalBadge.js";
import { useProposalRows } from "../../components/shared/useProposalRows.js";
import { WaitsOn } from "../../components/shared/WaitsOn.js";
import { useProposalDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { proposalMoveCard } from "../../kit/overview-view/index.js";
import { ProposalsBoard } from "./ProposalsBoard.js";
import {
  filterRows,
  statusOptions,
  waitSummary,
} from "../../kit/proposal-list/index.js";

const STATUSES = statusOptions();

/** The Proposals place: every proposal with its lead, status, value, valid-until day and what it waits on, on a board by status or in a list. */
export function ProposalsView(_: { driveId: string }) {
  const select = useSetSelectedNode();
  const goTo = useGoToPlace();
  const all = useProposalRows();
  const [status, setStatus] = useState("");
  const [asBoard, setAsBoard] = useState(true);
  const cards = new Map(
    (useProposalDocumentsInSelectedDrive() ?? []).map((d) => [
      d.header.id,
      proposalMoveCard(d.state.global),
    ]),
  );
  const rows = filterRows(all, status);
  const { us, client } = waitSummary(all);

  const toLeads = (
    <button type="button" className="pb-btn" onClick={() => goTo("leads")}>
      <Icon name="leads" />
      Start one from a lead
    </button>
  );

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">Proposals</h1>
        <span className="pb-toolbar__spacer" />
        {all.length > 0 ? toLeads : null}
      </div>
      {all.length === 0 ? (
        <EmptyStart
          icon="proposal"
          title="No proposals yet"
          text="A proposal is the offer you send a client: what you will deliver, the options and their prices. Each one starts from its lead, so open the lead and choose New proposal."
          example={{
            title: "Pilot reporting for Kelvar Institute",
            detail:
              "Kelvar Institute: pilot · Draft · €8,000.00 to €20,000.00 · valid until Fri 4 Dec · 2 findings to fix",
          }}
          action={
            <button
              type="button"
              className="pb-btn pb-btn--primary"
              onClick={() => goTo("leads")}
            >
              <Icon name="leads" />
              Go to Leads to start one
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
            {/* On the board the columns are the statuses, so the filter is the list's. */}
            {asBoard ? null : (
              <Menu
                label="Status"
                value={status}
                options={STATUSES}
                onChange={setStatus}
              />
            )}
            <span className="pb-toolbar__spacer" />
            <div className="pb-pulse">
              <span>
                <strong>{us}</strong> {us === 1 ? "waits" : "wait"} on you
              </span>
              <span>
                <strong>{client}</strong> {client === 1 ? "waits" : "wait"} on
                the client
              </span>
            </div>
          </div>
          {asBoard ? (
            <ProposalsBoard rows={all} cards={cards} onOpen={select} />
          ) : rows.length === 0 ? (
            <EmptyPlace
              icon="proposal"
              title="No proposals with this status"
              text="Choose All to see every proposal."
            />
          ) : (
            <div className="pb-table-wrap">
              <table className="pb-table">
                <thead>
                  <tr>
                    <th>Proposal</th>
                    <th>Lead</th>
                    <th>Organisation</th>
                    <th>Status</th>
                    <th className="pb-table__num">Value</th>
                    <th>Valid until</th>
                    <th>Waits on</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="pb-clickable"
                      onClick={() => select(r.id)}
                    >
                      <td className="pb-table__title">{r.title}</td>
                      <td>
                        {r.leadId && r.leadName ? (
                          <a
                            className="pb-link"
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              select(r.leadId ?? undefined);
                            }}
                          >
                            {r.leadName}
                          </a>
                        ) : (
                          <span className="pb-faint">No lead</span>
                        )}
                      </td>
                      <td>
                        {r.organisation ?? <span className="pb-faint">—</span>}
                      </td>
                      <td>
                        <span className={`pb-tag pb-tag--${r.tone}`}>
                          {r.statusLabel}
                        </span>
                      </td>
                      <td className="pb-table__num">
                        {r.valueNote ? (
                          <DraftValue value={r.value} />
                        ) : r.priced ? (
                          r.value
                        ) : (
                          <span className="pb-faint">{r.value}</span>
                        )}
                      </td>
                      <td>
                        {r.validUntilLabel ?? (
                          <span className="pb-faint">No day set</span>
                        )}
                      </td>
                      <td>
                        <WaitsOn wait={r.wait} label={r.waitLabel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
