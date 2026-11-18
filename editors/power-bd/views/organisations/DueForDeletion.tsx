import { organisationLabel } from "../../kit/organisation-list/index.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import {
  actions,
} from "document-models/contact";
import { useState } from "react";
import { EmptyPlace } from "../../components/EmptyPlace.js";
import { Icon } from "../../components/Icon.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import { peopleDue, type HeldFile } from "../../kit/retention/index.js";
import { useBdSettingsDocumentsInSelectedDrive, useContactDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { useDriveWrite } from "../../components/data/driveData.js";

const FILE_LABEL: Record<HeldFile, string> = {
  SENT_COPY: "sent copy",
  SIGNED_COPY: "signed copy",
  FIGURE: "figure",
};

/** People whose relationships all closed badly longer ago than the retention period. */
export function DueForDeletion() {
  const { dispatchTo } = useDriveWrite();
  const contacts = useContactDocumentsInSelectedDrive() ?? [];
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const opportunities = useOpportunityDocumentsInSelectedDrive() ?? [];
  const proposals = useProposalDocumentsInSelectedDrive() ?? [];
  const months =
    useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global.retentionMonths;
  const [confirming, setConfirming] = useState<string>();
  const [error, setError] = useState<{ key: string; message: string }>();
  const rec = <S,>(d: { header: { id: string }; state: { global: S } }) => ({
    id: d.header.id,
    state: d.state.global,
  });
  if (months === undefined)
    return (
      <EmptyPlace
        icon="settings"
        title="Retention period not set"
        text="Set how long to keep people in Settings, then the people due for removal show here."
      />
    );
  const due = peopleDue({
    now: new Date().toISOString(),
    retentionMonths: months,
    leads: leads.map(rec),
    opportunities: opportunities.map(rec),
    proposals: proposals.map(rec),
  });
  const find = (d: { contactId: string; personId: string }) => {
    const c = contacts.find((x) => x.header.id === d.contactId);
    return {
      org: organisationLabel(c?.state.global.name),
      person: c?.state.global.people.find((p) => p.id === d.personId)?.name,
    };
  };
  const remove = async (key: string, contactId: string, personId: string) => {
    setError(undefined);
    let failure: Error | undefined;
    try {
      await dispatchTo(
        actions.removePerson({ id: personId }),
        contactId,
        (errors) => {
          failure = errors[0];
        },
      );
    } catch (e) {
      failure = e instanceof Error ? e : new Error("That was not accepted.");
    }
    if (failure) setError({ key, message: failure.message });
    setConfirming(undefined);
  };
  const rows = due.filter((d) => find(d).person);

  if (rows.length === 0)
    return (
      <EmptyPlace
        icon="check"
        title="Nobody is due for removal"
        text={`People appear here ${months} months after the last relationship with them closed badly.`}
      />
    );
  return (
    <>
      <p className="pb-reassure pb-mb-10">
        <Icon name="alert-circle" className="pb-icon pb-icon--xs" />
        Power BD removes nobody by itself. Removing a person takes them off the
        organisation only: files held on proposals must be erased by an
        administrator.
      </p>
      <div className="pb-table-wrap">
        <table className="pb-table">
          <thead>
            <tr>
              <th>Organisation</th>
              <th>Person</th>
              <th>Due since</th>
              <th>Closed records</th>
              <th>Proposals holding a file</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const key = `${d.contactId}/${d.personId}`;
              const { org, person } = find(d);
              return (
                <tr key={key}>
                  <td className="pb-table__title">{org}</td>
                  <td>{person}</td>
                  <td>{fmtDay(d.dueSince)}</td>
                  <td>
                    {d.relationships.map((r) => (
                      <div key={r.id}>
                        {r.kind === "lead" ? "Lead" : "Funding opportunity"}
                        <span className="pb-faint pb-small">
                          {" "}
                          · closed {fmtDay(r.closedAt)}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td>
                    {d.proposals.length === 0 ? (
                      <span className="pb-faint">None</span>
                    ) : (
                      d.proposals.map((p) => (
                        <div key={p.id}>
                          {p.title || "Untitled proposal"}
                          <span className="pb-faint pb-small">
                            {" "}
                            · {p.files.map((f) => FILE_LABEL[f]).join(", ")}
                          </span>
                        </div>
                      ))
                    )}
                  </td>
                  <td className="pb-minw-220">
                    {confirming === key ? (
                      <div className="pb-grid pb-gap-6">
                        <span className="pb-small">
                          Remove {person} from {org}?
                        </span>
                        <span className="pb-flex pb-gap-6">
                          <button
                            className="pb-btn pb-btn--primary pb-btn--sm"
                            onClick={() =>
                              void remove(key, d.contactId, d.personId)
                            }
                          >
                            Remove this person
                          </button>
                          <button
                            className="pb-btn pb-btn--sm"
                            onClick={() => setConfirming(undefined)}
                          >
                            Keep
                          </button>
                        </span>
                      </div>
                    ) : (
                      <button
                        className="pb-btn pb-btn--sm"
                        onClick={() => setConfirming(key)}
                      >
                        <Icon name="trash" />
                        Remove this person
                      </button>
                    )}
                    <ErrorLine
                      message={error?.key === key ? error.message : null}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
