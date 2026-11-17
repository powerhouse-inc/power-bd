import { useToday } from "../../components/shared/useToday.js";
import { enumValue, FITS, LEAD_KINDS, LEAD_STATUSES } from "../../kit/enums.js";
import type { Fit } from "document-models/lead";
import { organisationLabel } from "../../kit/organisation-list/index.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useUser, type DocumentDispatch } from "@powerhousedao/reactor-browser";
import { generateId } from "document-model";
import {
  actions,
  type LeadAction,
  type LeadDocument,
} from "document-models/lead";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { OwnerPicker } from "../../components/shared/OwnerPicker.js";
import { useRenameRecord } from "../../components/shared/useRenameRecord.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { ConfidentialSection } from "../../components/shared/relationship/ConfidentialSection.js";
import { ContactLinksSection } from "../../components/shared/relationship/ContactLinksSection.js";
import { InteractionsSection } from "../../components/shared/relationship/InteractionsSection.js";
import { NextStepsSection } from "../../components/shared/relationship/NextStepsSection.js";
import { ReferencesSection } from "../../components/shared/relationship/ReferencesSection.js";
import {
  Section,
  useRun,
  dispatchWith,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { useProposalRows } from "../../components/shared/useProposalRows.js";
import { nextAction, statusPath } from "../../kit/lead-view/index.js";
import { leadProposalNext } from "../../kit/proposal-list/index.js";
import { LeadNextBar } from "./LeadNextBar.js";
import { MessagesSection } from "./MessagesSection.js";
import { ProposalsSection } from "../proposal/ProposalsSection.js";
import { useContactDocumentsInSelectedDrive, usePlaybookDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";

const tag = <T extends { value: string }>(list: readonly T[], v: string) =>
  list.find((t) => t.value === v);
const MOVES = LEAD_STATUSES.filter((m) => m !== "PARKED");

/** The lead page: shown in the Leads place and in the thin editor. */
export function LeadDetail({
  document,
  dispatch,
}: {
  document: LeadDocument;
  dispatch: DocumentDispatch<LeadAction>;
}) {
  const s = document.state.global;
  const team = useTeam();
  const user = useUser();
  const me = user?.address ?? "";
  const contactDocs = useContactDocumentsInSelectedDrive() ?? [];
  const playbook = usePlaybookDocumentsInSelectedDrive()?.[0];
  const [reason, setReason] = useState("");
  const status = useRun();
  const owner = useRun();
  const renameEntry = useRenameRecord(document.header.id);
  const details = useRun();
  const stepRun = useRun();
  const angleRun = useRun();
  const [angleText, setAngleText] = useState("");
  const [angleFit, setAngleFit] = useState<Fit>("GOOD");

  const contacts = contactDocs.map((d) => ({
    id: d.header.id,
    name: organisationLabel(d.state.global.name),
    people: d.state.global.people.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
    })),
  }));
  const personLabel = (a: string) =>
    a ? (team.nameFor(a) ?? `${a.slice(0, 6)}…${a.slice(-4)}`) : "someone";
  const recipientLabel = (
    r?: { contactId: string; personId: string } | null,
  ) => {
    if (!r) return "nobody yet";
    const c = contacts.find((x) => x.id === r.contactId);
    return (
      c?.people.find((p) => p.id === r.personId)?.name ??
      c?.name ??
      "an unknown person"
    );
  };
  const send = (action: LeadAction, onErrors: OnErrors) =>
    dispatchWith(dispatch, action, onErrors);

  const parked = s.status === "PARKED";
  const closed = s.status === "WON" || s.status === "LOST";
  const path = statusPath(s.status, s.kind, s.parkedFrom);
  const today = useToday();
  const next = nextAction(s, today);
  const proposals = useProposalRows(document.header.id);
  const kindTerm = tag(VOCABULARY.relationshipKind, s.kind ?? "");
  const statusTerm = tag(VOCABULARY.leadStatus, s.status);

  return (
    <div className="pb-page">
      <div className="pb-page__head pb-page__head--row">
        <span className="pb-page__icon pb-page__icon--purple">
          <Icon name={kindTerm?.icon ?? "leads"} />
        </span>
        <h1 className="pb-page__title">{s.name || "Untitled lead"}</h1>
        {statusTerm ? (
          <span className={`pb-tag pb-tag--${statusTerm.tone}`}>
            {statusTerm.label}
          </span>
        ) : null}
      </div>

      <ol className="pb-path pb-mt-6 pb-mb-8">
        {path.map((p) => (
          <li
            key={p.value}
            className={`pb-path__step${p.state === "done" ? " is-done" : p.state === "current" ? " is-current" : ""}`}
          >
            <span className="pb-path__dot">
              {p.state === "done" ? <Icon name="check" /> : null}
            </span>
            {tag(VOCABULARY.leadStatus, p.value)?.label}
            {p.state === "current" && parked ? (
              <span className="pb-path__note">Parked</span>
            ) : null}
          </li>
        ))}
      </ol>
      {!closed ? (
        <div className="pb-row pb-mb-14">
          {!parked ? (
            <select
              className="pb-select pb-select--inline"
              aria-label="Move to"
              value=""
              onChange={(e) => {
                const to = enumValue(LEAD_STATUSES, e.target.value);
                if (!to) return;
                status.run((onErrors) =>
                  send(
                    actions.setLeadStatus({
                      status: to,
                      reason: reason.trim() || undefined,
                      changedAt: new Date().toISOString(),
                    }),
                    onErrors,
                  ),
                );
              }}
            >
              <option value="">Move to…</option>
              {MOVES.filter((m) => m !== s.status).map((m) => (
                <option key={m} value={m}>
                  {tag(VOCABULARY.leadStatus, m)?.label}
                </option>
              ))}
            </select>
          ) : null}
          {parked ? (
            <button
              className="pb-btn pb-btn--sm"
              onClick={() => status.run((e) => send(actions.unparkLead({}), e))}
            >
              Take off hold
            </button>
          ) : (
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm"
              onClick={() =>
                status.run((e) =>
                  send(
                    actions.parkLead({
                      reason: reason.trim(),
                      parkedAt: new Date().toISOString(),
                    }),
                    e,
                  ),
                )
              }
            >
              Put on hold
            </button>
          )}
          {!parked ? (
            <input
              className="pb-input pb-minw-260"
              placeholder="Reason, needed for lost and on hold"
              aria-label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          ) : null}
          <ErrorLine message={status.error} />
        </div>
      ) : s.statusReason ? (
        <p className="pb-faint pb-small">Reason: {s.statusReason}</p>
      ) : null}
      <LeadNextBar
        leadId={document.header.id}
        next={next}
        proposal={leadProposalNext({
          status: s.status,
          kind: s.kind,
          rows: proposals,
        })}
        error={stepRun.error}
        onStepDone={(id) =>
          stepRun.run((e) =>
            send(
              actions.completeNextStep({
                id,
                doneAt: new Date().toISOString(),
              }),
              e,
            ),
          )
        }
      />
      <ProposalsSection
        leadId={document.header.id}
        kind={s.kind}
        rows={proposals}
      />

      <div className="pb-props pb-mt-14">
        <div className="pb-prop__key">
          <Icon name="leads" />
          Name
        </div>
        <div className="pb-prop__value">
          <input
            className="pb-input"
            aria-label="Name"
            defaultValue={s.name ?? ""}
            key={s.name ?? ""}
            onBlur={(e) =>
              e.target.value !== (s.name ?? "") &&
              details.run(
                (onErrors) =>
                  send(
                    actions.setLeadDetails({ name: e.target.value }),
                    onErrors,
                  ),
                () => renameEntry(e.target.value),
              )
            }
          />
        </div>
        <div className="pb-prop__key">
          <Icon name="partnership" />
          Kind
        </div>
        <div className="pb-prop__value">
          <select
            className="pb-select pb-select--inline"
            aria-label="Kind"
            value={s.kind ?? ""}
            onChange={(e) => {
              /* The model cannot clear a kind, so "Not set" sends nothing. */
              const kind = enumValue(LEAD_KINDS, e.target.value);
              if (!kind) return;
              details.run((onErrors) =>
                send(actions.setLeadDetails({ kind }), onErrors),
              );
            }}
          >
            <option value="">Not set</option>
            {VOCABULARY.relationshipKind
              .filter((k) => k.value !== "FUNDING")
              .map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
          </select>
        </div>
        <div className="pb-prop__key">
          <Icon name="organisations" />
          Organisation
        </div>
        <div className="pb-prop__value">
          <select
            className="pb-select pb-select--inline"
            aria-label="Organisation"
            value={s.organisationId ?? ""}
            onChange={(e) =>
              details.run((onErrors) =>
                send(
                  actions.setLeadDetails({ organisationId: e.target.value }),
                  onErrors,
                ),
              )
            }
          >
            <option value="">Not set</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="pb-prop__key">
          <Icon name="user" />
          Owner
        </div>
        <div className="pb-prop__value">
          <OwnerPicker
            bare
            value={s.owner}
            error={owner.error ?? undefined}
            onChange={(address) =>
              owner.run((onErrors) =>
                send(actions.setOwner({ owner: address ?? null }), onErrors),
              )
            }
          />
        </div>
      </div>
      <ErrorLine message={details.error} />

      <Section title="Angles" count={s.angles.length} action={null}>
        {s.angles.length === 0 ? (
          <p className="pb-faint pb-small">No angles yet.</p>
        ) : null}
        <div className="pb-list">
          {s.angles.map((a) => {
            const fit = tag(VOCABULARY.fit, a.fit);
            return (
              <div key={a.id} className="pb-list__item">
                <span className="pb-list__lead">
                  <Icon name="compass" />
                </span>
                <div className="pb-list__main">
                  <span className="pb-list__title">{a.summary}</span>
                </div>
                <div className="pb-list__end">
                  <span className={`pb-tag pb-tag--${fit?.tone}`}>
                    {fit?.label}
                  </span>
                  <button
                    className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                    aria-label="Remove this angle"
                    onClick={() =>
                      angleRun.run((e) =>
                        send(actions.removeAngle({ id: a.id }), e),
                      )
                    }
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pb-row pb-mt-8">
          <input
            className="pb-input pb-flex-1"

            placeholder="Why would they care?"
            aria-label="New angle"
            value={angleText}
            onChange={(e) => setAngleText(e.target.value)}
          />
          <select
            className="pb-select pb-select--inline"
            aria-label="Fit"
            value={angleFit}
            onChange={(e) =>
              setAngleFit(enumValue(FITS, e.target.value) ?? angleFit)
            }
          >
            {VOCABULARY.fit.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            className="pb-btn pb-btn--sm"
            disabled={!angleText.trim()}
            onClick={() =>
              angleRun.run(
                (e) => {
                  send(
                    actions.addAngle({
                      id: generateId(),
                      summary: angleText.trim(),
                      fit: angleFit,
                    }),
                    e,
                  );
                },
                () => setAngleText(""),
              )
            }
          >
            <Icon name="plus" />
            Add angle
          </button>
        </div>
        <ErrorLine message={angleRun.error} />
      </Section>

      <NextStepsSection
        items={s.nextSteps}
        owners={team.active.map((m) => ({ value: m.address, label: m.name }))}
        ownerLabel={personLabel}
        onAdd={(step, e) => send(actions.addNextStep(step), e)}
        onComplete={(id, doneAt, e) =>
          send(actions.completeNextStep({ id, doneAt }), e)
        }
        onReopen={(id, e) => send(actions.reopenNextStep({ id }), e)}
        onRemove={(id, e) => send(actions.removeNextStep({ id }), e)}
        onUpdate={(st, e) => send(actions.updateNextStep(st), e)}
      />

      <MessagesSection
        messages={s.messages}
        playbookLoaded={!!playbook}
        neverClaims={playbook?.state.global.neverClaims ?? []}
        confidential={s.confidentialItems}
        recipients={contacts.flatMap((c) =>
          c.people.map((p) => ({
            value: `${c.id}|${p.id}`,
            label: `${p.name} · ${c.name}`,
          })),
        )}
        angles={s.angles.map((a) => ({ value: a.id, label: a.summary }))}
        recipientLabel={recipientLabel}
        personLabel={personLabel}
        callbacks={{
          onDraft: (m, e) =>
            send(
              actions.draftMessage({
                ...m,
                channel: m.channel,
                draftedBy: me,
                draftedAt: new Date().toISOString(),
              }),
              e,
            ),
          onUpdate: (m, e) => send(actions.updateMessage(m), e),
          onApprove: (id, e) =>
            send(
              actions.approveMessage({
                id,
                approvedBy: me,
                approvedAt: new Date().toISOString(),
              }),
              e,
            ),
          onReopen: (id, e) => send(actions.reopenMessage({ id }), e),
          onMarkSent: (id, e) =>
            send(
              actions.markMessageSent({
                id,
                sentBy: me,
                sentAt: new Date().toISOString(),
              }),
              e,
            ),
          onDiscard: (id, e) => send(actions.discardMessage({ id }), e),
        }}
      />

      <InteractionsSection
        items={s.interactions}
        onAdd={(i, e) =>
          send(
            actions.addInteraction({
              ...i,
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removeInteraction({ id }), e)}
        onUpdate={(c, e) => send(actions.updateInteraction(c), e)}
      />

      <ContactLinksSection
        items={s.contactLinks}
        contacts={contacts}
        onLink={(l, e) => send(actions.linkContact(l), e)}
        onUnlink={(id, e) => send(actions.unlinkContact({ id }), e)}
      />

      <ReferencesSection
        items={s.references}
        onAdd={(r, e) => send(actions.addReference(r), e)}
        onRemove={(id, e) => send(actions.removeReference({ id }), e)}
      />

      <ConfidentialSection
        items={s.confidentialItems}
        subjects={contacts.map((c) => ({ value: c.id, label: c.name }))}
        personLabel={personLabel}
        onAdd={(item, e) =>
          send(actions.addConfidentialItem({ ...item, addedBy: me }), e)
        }
        onRemove={(id, e) => send(actions.removeConfidentialItem({ id }), e)}
      />
    </div>
  );
}
