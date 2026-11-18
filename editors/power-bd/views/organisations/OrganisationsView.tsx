import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useState } from "react";
import { EmptyStart } from "../../components/EmptyStart.js";
import { useCreateRecord } from "../../components/shared/useCreateRecord.js";
import { Icon } from "../../components/Icon.js";
import { organisationRows } from "../../kit/organisation-list/index.js";
import { DueForDeletion } from "./DueForDeletion.js";
import { useContactDocumentsInSelectedDrive, useInvestorListDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";

/** The Organisations place: every organisation with its country, tags and relationships, and the retention list. */
export function OrganisationsView({ driveId }: { driveId: string }) {
  const contacts = useContactDocumentsInSelectedDrive() ?? [];
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const opportunities = useOpportunityDocumentsInSelectedDrive() ?? [];
  const investorLists = useInvestorListDocumentsInSelectedDrive() ?? [];
  const proposals = useProposalDocumentsInSelectedDrive() ?? [];
  const select = useSetSelectedNode();
  const [tab, setTab] = useState<"list" | "due">("list");
  const rec = <S,>(d: { header: { id: string }; state: { global: S } }) => ({
    id: d.header.id,
    state: d.state.global,
  });
  const rows = organisationRows(contacts.map(rec), {
    leads: leads.map(rec),
    opportunities: opportunities.map(rec),
    investorLists: investorLists.map(rec),
    proposals: proposals.map(rec),
  });

  const {
    create: createRecord,
    busy,
    error,
  } = useCreateRecord(
    driveId,
    "Organisations",
    "powerbd/contact",
    "The organisation could not be created.",
  );
  const create = () => void createRecord("New organisation");

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">Organisations</h1>
        <span className="pb-toolbar__spacer" />
        {rows.length > 0 && (
          <button
            className="pb-btn pb-btn--primary"
            disabled={busy}
            onClick={create}
          >
            <Icon name="plus" />
            New organisation
          </button>
        )}
      </div>
      <ErrorLine message={error} />
      <div className="pb-tabs pb-mb-12" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "list"}
          className={`pb-tab${tab === "list" ? " is-active" : ""}`}
          onClick={() => setTab("list")}
        >
          Organisations
        </button>
        <button
          role="tab"
          aria-selected={tab === "due"}
          className={`pb-tab${tab === "due" ? " is-active" : ""}`}
          onClick={() => setTab("due")}
        >
          Due for deletion
        </button>
      </div>
      {tab === "due" ? (
        <DueForDeletion />
      ) : rows.length === 0 ? (
        <EmptyStart
          icon="organisations"
          title="No organisations yet"
          text="Every customer, partner and funder you deal with belongs here, each with the people you know there."
          example={{
            title: "Kelvar Institute",
            detail: "Switzerland · research, partner · 2 people · 1 lead",
          }}
          action={
            <button
              type="button"
              className="pb-btn pb-btn--primary"
              disabled={busy}
              onClick={create}
            >
              <Icon name="plus" />
              Add your first organisation
            </button>
          }
        />
      ) : (
        <div className="pb-table-wrap">
          <table className="pb-table">
            <thead>
              <tr>
                <th>Organisation</th>
                <th>Country</th>
                <th>Tags</th>
                <th>Relationships</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="pb-clickable"
                  onClick={() => select(r.id)}
                >
                  <td className="pb-table__title">{r.name}</td>
                  <td>
                    {r.country || <span className="pb-faint">Not set</span>}
                  </td>
                  <td>
                    <span className="pb-tags">
                      {r.tags.map((t) => (
                        <span key={t} className="pb-tag pb-tag--default">
                          {t}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td>{r.relationships}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
