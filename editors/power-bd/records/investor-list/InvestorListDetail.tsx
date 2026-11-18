import {
  type DocumentDispatch,
  useSelectedDriveId,
  useSetSelectedNode,
} from "@powerhousedao/reactor-browser";
import { Fragment, useState } from "react";
import type { Action } from "document-model";
import { actions as contactActions } from "document-models/contact";
import {
  actions,
  type InvestorListAction,
  type InvestorListDocument,
  type InvestorRow,
} from "document-models/investor-list";
import { actions as leadActions } from "document-models/lead";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { EmptyStart } from "../../components/EmptyStart.js";
import { Icon } from "../../components/Icon.js";
import { VaultNoteChip } from "../../components/vault/VaultNoteLink.js";
import { useCreateRecord } from "../../components/shared/useCreateRecord.js";
import { dispatchWith, type OnErrors } from "../../components/shared/useRun.js";
import {
  countByState,
  filterRows,
  sourceLists,
  type StateFilter,
} from "../../kit/investors/filter.js";
import {
  startRelationship,
  type StartResult,
} from "../../kit/investors/start-relationship.js";
import { ImportPanel } from "../../views/investors/ImportPanel.js";
import { InvestorRowDetail } from "../../views/investors/InvestorRowDetail.js";
import { StartRelationshipPanel } from "../../views/investors/StartRelationshipPanel.js";
import "../../kit/design.js";
import { useDriveWrite, type DriveWrite } from "../../components/data/driveData.js";

type Dispatch = DocumentDispatch<InvestorListAction>;
type Panel = { rowId: string; kind: "details" | "exclude" | "start" };

const TABS: { id: StateFilter; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "SHORTLISTED", label: "Shortlisted" },
  { id: "LISTED", label: "Listed" },
  { id: "EXCLUDED", label: "Excluded" },
  { id: "ENGAGED", label: "Engaged" },
];

const stateTerm = (state: string) =>
  VOCABULARY.investorRow.find((t) => t.value === state);

/** Sends an action to any document of the drive by id and throws the reducer's message on rejection. */
const sender = (dispatchTo: DriveWrite["dispatchTo"]) => async (action: Action, documentId: string) => {
  let error: Error | undefined;
  await dispatchTo(action, documentId, (errors) => {
    error = errors[0];
  });
  if (error) throw error;
};

/** Brings a row asked for from outside into view, once, when it is first drawn. */
const reveal = (row: HTMLElement | null) =>
  row?.scrollIntoView({ block: "center" });

/**
 * The investor list: the Investors place and the thin editor both show this.
 * `openRow` shows that row's details open from the start (search asks for it).
 * Rejected actions show their reason beside the control that caused them.
 */
export function InvestorListDetail({
  document,
  dispatch,
  openRow,
}: {
  document: InvestorListDocument;
  dispatch: Dispatch;
  openRow?: string;
}) {
  const send = sender(useDriveWrite().dispatchTo);
  const rows: InvestorRow[] = document.state.global.rows;
  const driveId = useSelectedDriveId();
  const organisations = useCreateRecord(
    driveId ?? "",
    "Organisations",
    "powerbd/contact",
    "The organisation could not be created.",
  );
  const leads = useCreateRecord(
    driveId ?? "",
    "Leads",
    "powerbd/lead",
    "The investor lead could not be created.",
  );
  const open = useSetSelectedNode();
  const [tab, setTab] = useState<StateFilter>("ALL");
  const [list, setList] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [panel, setPanel] = useState<Panel | undefined>(
    openRow ? { rowId: openRow, kind: "details" } : undefined,
  );
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<StartResult>();

  const counts = countByState(rows);
  const lists = sourceLists(rows);
  const shown = filterRows(rows, tab, list);

  /** Dispatches, and shows a rejection under `key` ("list" for the whole list). */
  const run = (key: string, action: InvestorListAction, done?: () => void) => {
    setErrors((e) => ({ ...e, [key]: "" }));
    const onErrors: OnErrors = (errs) =>
      setErrors((e) => ({ ...e, [key]: errs[0]?.message ?? "Not done" }));
    onErrors.onDone = done;
    dispatchWith(dispatch, action, onErrors);
  };
  const err = (key: string) => errors[key] || undefined;

  const start = async (row: InvestorRow) => {
    if (!driveId) return;
    setRunning(true);
    setResult(undefined);
    const res = await startRelationship(row, {
      createContact: async (r) => {
        const id = await organisations.create(r.name, { open: false });
        if (!id) throw new Error("The organisation could not be created.");
        await send(
          contactActions.setProfile({
            name: r.name,
            website: r.website ?? undefined,
          }),
          id,
        );
        return id;
      },
      createLead: async (r, organisationId) => {
        const id = await leads.create(r.name, { open: false });
        if (!id) throw new Error("The investor lead could not be created.");
        await send(
          leadActions.setLeadDetails({
            name: r.name,
            kind: "INVESTOR",
            organisationId,
          }),
          id,
        );
        return id;
      },
      markEngaged: (r, organisationId, leadId) =>
        send(
          actions.markRowEngaged({ id: r.id, organisationId, leadId }),
          document.header.id,
        ),
    });
    setResult(res);
    setRunning(false);
    if (res.ok) setPanel(undefined);
  };

  const toggle = (rowId: string, kind: Panel["kind"]) => {
    setResult(undefined);
    setReason("");
    setPanel((p) =>
      p?.rowId === rowId && p.kind === kind ? undefined : { rowId, kind },
    );
  };

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head">
        <h1 className="pb-page__title">Investors</h1>
        <p className="pb-page__sub">
          Organisations only. People join as contacts once we engage.
        </p>
        {(rows.length > 0 || importing) && (
          <div className="pb-row">
            <button
              type="button"
              className="pb-btn pb-btn--sm"
              onClick={() => setImporting((v) => !v)}
            >
              <Icon name="plus" />
              Import list
            </button>
          </div>
        )}
      </div>
      {importing && (
        <ImportPanel
          error={err("list")}
          onClose={() => setImporting(false)}
          onImport={(r) =>
            run("list", actions.addRows({ rows: r }), () => setImporting(false))
          }
        />
      )}
      <div className="pb-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`pb-tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="pb-count">{counts[t.id]}</span>
          </button>
        ))}
      </div>
      {lists.length > 1 && (
        <div className="pb-row pb-mt-10 pb-mb-6">
          <label className="pb-filter pb-filter--off">
            <Icon name="filter" className="pb-icon pb-icon--sm" />
            List:&nbsp;
            <select
              aria-label="List it came from"
              value={list ?? ""}
              onChange={(e) => setList(e.target.value || null)}
              className="pb-select--bare"
            >
              <option value="">All lists</option>
              {lists.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {rows.length === 0 ? (
        <EmptyStart
          icon="investors"
          title="No investors yet"
          text="Investors you might approach belong here: brought in as a list, then narrowed to a shortlist."
          example={{
            title: "Tallgrass Ventures",
            detail:
              "tallgrass.example · from the list “Climate seed funds 2026”",
          }}
          action={
            importing ? undefined : (
              <button
                type="button"
                className="pb-btn pb-btn--primary"
                onClick={() => setImporting(true)}
              >
                <Icon name="plus" />
                Import your first list
              </button>
            )
          }
        />
      ) : shown.length === 0 ? (
        <div className="pb-empty" role="status">
          <Icon name="investors" />
          <div className="pb-empty__title">No investors here</div>
          <p>Nothing matches this tab and list.</p>
        </div>
      ) : (
        <div className="pb-table-wrap">
          <table className="pb-table">
            <thead>
              <tr>
                <th>
                  <Icon name="organisations" />
                  Investor
                </th>
                <th>
                  <Icon name="leads" />
                  State
                </th>
                <th>Thesis</th>
                <th>Funded comparables</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => {
                const term = stateTerm(row.state);
                const here = panel?.rowId === row.id ? panel.kind : undefined;
                return (
                  <Fragment key={row.id}>
                    <tr
                      ref={row.id === openRow ? reveal : undefined}
                      className={
                        row.state === "EXCLUDED" ? "pb-dimmed" : undefined
                      }
                    >
                      <td className="pb-table__title pb-nowrap">
                        {row.name}
                        {(row.website || row.sourceList) && (
                          <span className="pb-table__sub">
                            {[row.website, row.sourceList]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`pb-tag pb-tag--${term?.tone ?? "default"}`}
                        >
                          {term?.label ?? row.state}
                        </span>
                        {row.state === "EXCLUDED" && row.exclusionReason && (
                          <span className="pb-table__sub">
                            {row.exclusionReason}
                          </span>
                        )}
                      </td>
                      <td>
                        {row.thesisNote ? (
                          <VaultNoteChip note={row.thesisNote} />
                        ) : (
                          <span className="pb-faint">None</span>
                        )}
                      </td>
                      <td>
                        {row.comparables.length > 0 ? (
                          <span className="pb-row">
                            {row.comparables.map((c) => (
                              <VaultNoteChip key={c.id} note={c} />
                            ))}
                          </span>
                        ) : (
                          <span className="pb-faint">None yet</span>
                        )}
                      </td>
                      <td>
                        <span className="pb-btn-group">
                          {row.state === "LISTED" && (
                            <button
                              type="button"
                              className="pb-btn pb-btn--ghost pb-btn--sm"
                              onClick={() =>
                                run(
                                  row.id,
                                  actions.shortlistRow({ id: row.id }),
                                )
                              }
                            >
                              Shortlist
                            </button>
                          )}
                          {row.state === "SHORTLISTED" && (
                            <button
                              type="button"
                              className="pb-btn pb-btn--sm"
                              onClick={() => toggle(row.id, "start")}
                            >
                              Start relationship
                            </button>
                          )}
                          {(row.state === "LISTED" ||
                            row.state === "SHORTLISTED") && (
                            <button
                              type="button"
                              className="pb-btn pb-btn--ghost pb-btn--sm"
                              onClick={() => toggle(row.id, "exclude")}
                            >
                              Exclude
                            </button>
                          )}
                          {row.state === "EXCLUDED" && (
                            <button
                              type="button"
                              className="pb-btn pb-btn--ghost pb-btn--sm"
                              onClick={() =>
                                run(row.id, actions.relistRow({ id: row.id }))
                              }
                            >
                              Put back on the list
                            </button>
                          )}
                          {row.state === "ENGAGED" && row.organisationId && (
                            <button
                              type="button"
                              className="pb-ref"
                              onClick={() =>
                                open(row.organisationId ?? undefined)
                              }
                            >
                              <Icon name="organisations" />
                              <span>Organisation</span>
                            </button>
                          )}
                          {row.state === "ENGAGED" && row.leadId && (
                            <button
                              type="button"
                              className="pb-ref"
                              onClick={() => open(row.leadId ?? undefined)}
                            >
                              <Icon name="investors" />
                              <span>Investor lead</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="pb-btn pb-btn--ghost pb-btn--sm"
                            aria-expanded={here === "details"}
                            onClick={() => toggle(row.id, "details")}
                          >
                            Details
                          </button>
                        </span>
                        {err(row.id) && !here && (
                          <span className="pb-field__error" role="alert">
                            <Icon name="alert-circle" />
                            {err(row.id)}
                          </span>
                        )}
                      </td>
                    </tr>
                    {here && (
                      <tr>
                        <td colSpan={5}>
                          {here === "details" && (
                            <InvestorRowDetail
                              row={row}
                              error={err(row.id)}
                              onSave={(e) =>
                                run(
                                  row.id,
                                  actions.updateRow({
                                    id: row.id,
                                    name: e.name,
                                    website: e.website,
                                    sourceList: e.sourceList,
                                  }),
                                )
                              }
                              onThesis={(n, done) =>
                                run(
                                  row.id,
                                  actions.setRowThesis({
                                    id: row.id,
                                    thesisNote: n,
                                  }),
                                  done,
                                )
                              }
                              onLink={(n, done) =>
                                run(
                                  row.id,
                                  actions.linkRowComparable({
                                    rowId: row.id,
                                    comparableId: n.id,
                                    title: n.title,
                                  }),
                                  done,
                                )
                              }
                              onRemove={() =>
                                run(
                                  row.id,
                                  actions.removeRow({ id: row.id }),
                                  () => setPanel(undefined),
                                )
                              }
                              onUnlink={(id) =>
                                run(
                                  row.id,
                                  actions.unlinkRowComparable({
                                    rowId: row.id,
                                    comparableId: id,
                                  }),
                                )
                              }
                            />
                          )}
                          {here === "exclude" && (
                            <div className="pb-grid pb-gap-8 pb-p-compact">
                              <label className="pb-field">
                                <span className="pb-field__label">
                                  Why exclude {row.name}?
                                </span>
                                <input
                                  className="pb-input"
                                  value={reason}
                                  placeholder="For example: home market only"
                                  onChange={(e) => setReason(e.target.value)}
                                />
                                <span className="pb-field__help">
                                  The reason stops the team from asking them
                                  again.
                                </span>
                              </label>
                              {err(row.id) && (
                                <span className="pb-field__error" role="alert">
                                  <Icon name="alert-circle" />
                                  {err(row.id)}
                                </span>
                              )}
                              <div className="pb-row">
                                <button
                                  type="button"
                                  className="pb-btn pb-btn--sm"
                                  disabled={reason.trim() === ""}
                                  onClick={() =>
                                    run(
                                      row.id,
                                      actions.excludeRow({
                                        id: row.id,
                                        reason: reason.trim(),
                                      }),
                                      () => setPanel(undefined),
                                    )
                                  }
                                >
                                  Exclude
                                </button>
                                <button
                                  type="button"
                                  className="pb-btn pb-btn--ghost pb-btn--sm"
                                  onClick={() => setPanel(undefined)}
                                >
                                  Cancel
                                </button>
                              </div>
                              <p className="pb-reassure">
                                <Icon name="shield" />
                                You can put it back on the list later.
                              </p>
                            </div>
                          )}
                          {here === "start" && (
                            <StartRelationshipPanel
                              name={row.name}
                              running={running}
                              result={result}
                              onStart={() => void start(row)}
                              onCancel={() => setPanel(undefined)}
                            />
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
