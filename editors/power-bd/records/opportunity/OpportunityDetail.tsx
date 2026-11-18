import { useUser, type DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  actions,
  type OpportunityAction,
  type OpportunityDocument,
} from "document-models/opportunity";
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
  ErrorLine,
  fmtInstant,
  newDay,
  useRun,
  dispatchWith,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { enumValue, FITS } from "../../kit/enums.js";
import {
  allowedMoves,
  goNoGoChecks,
  INSTRUMENTS,
  nextAction,
  statusPath,
} from "../../kit/funding/index.js";
import { organisationLabel } from "../../kit/organisation-list/index.js";
import { settingsOrDefaults } from "../../kit/settings/index.js";
import { attemptsLeft } from "../../kit/overview/index.js";
import { VaultNotes } from "../../components/shared/VaultNotes.js";
import { AttemptsSection } from "./AttemptsSection.js";
import { ConditionsSection } from "./ConditionsSection.js";
import { ConsortiumSection } from "./ConsortiumSection.js";
import { GoNoGo } from "./GoNoGo.js";
import { NextBar } from "./NextBar.js";
import { OpportunityHeader } from "./OpportunityHeader.js";
import { StatusControls } from "./StatusControls.js";
import { CURRENCY_FORMAT, currencyCode } from "../../kit/format/index.js";
import { StepsSection } from "./StepsSection.js";
import { SubmissionsSection } from "./SubmissionsSection.js";
import { useBdSettingsDocumentsInSelectedDrive, useContactDocumentsInSelectedDrive, useDecisionDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";
import { DeleteRecord } from "../../components/shared/DeleteRecord.js";

/** The funding opportunity page: shown in the Funding place and in the thin editor. */
export function OpportunityDetail({
  document,
  dispatch,
}: {
  document: OpportunityDocument;
  dispatch: DocumentDispatch<OpportunityAction>;
}) {
  const s = document.state.global;
  const renameEntry = useRenameRecord(document.header.id);
  const team = useTeam();
  const me = useUser()?.address ?? "";
  const select = useSetSelectedNode();
  const { timeZone: ourZone } = settingsOrDefaults(
    useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global,
  );
  const contactDocs = useContactDocumentsInSelectedDrive() ?? [];
  const decisionDocs = useDecisionDocumentsInSelectedDrive() ?? [];
  const allOpps = (useOpportunityDocumentsInSelectedDrive() ?? []).map((d) => ({
    id: d.header.id,
    state: d.state.global,
  }));
  const [deciding, setDeciding] = useState(false);
  const details = useRun();
  const owner = useRun();
  const dates = useRun();

  const send = (a: OpportunityAction, e: OnErrors) =>
    dispatchWith(dispatch, a, e);
  const contacts = contactDocs.map((d) => ({
    id: d.header.id,
    name: organisationLabel(d.state.global.name),
    people: d.state.global.people.map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
    })),
  }));
  const decisions = decisionDocs.map((d) => ({
    id: d.header.id,
    question: d.state.global.question ?? "",
    open: d.state.global.status === "OPEN",
  }));
  const personLabel = (a: string) =>
    a ? (team.nameFor(a) ?? `${a.slice(0, 6)}…${a.slice(-4)}`) : "someone";

  const now = new Date().toISOString();
  const left = attemptsLeft({ id: document.header.id, state: s }, allOpps);
  const checks = goNoGoChecks(s, {
    attemptsLeft: left,
    max: s.attemptLimit?.max ?? null,
    ourZone,
    now,
  });
  const path = statusPath(s);
  const next = nextAction(s, now);
  const fitTerm = VOCABULARY.fit.find((t) => t.value === s.fit);
  const moves = allowedMoves(s.status);
  const closed = path.closed;
  const question = (id?: string) =>
    decisions.find((d) => d.id === id)?.question || "the company decision";

  const goDecision = s.goNoGoDecisions[s.goNoGoDecisions.length - 1];

  return (
    <div className="pb-page">
      <OpportunityHeader
        name={s.name}
        status={s.status}
        path={path}
        goDecision={goDecision}
        personLabel={personLabel}
      />
      <StatusControls
        status={s.status}
        statusReason={s.statusReason}
        closed={closed}
        moves={moves}
        blocked={Boolean(s.blocked)}
        decisions={decisions}
        signedIn={Boolean(me)}
        canDecide={!deciding}
        onDecide={() => setDeciding(true)}
        onMove={(to, reason, er) =>
          send(
            actions.setOpportunityStatus({
              status: to,
              reason,
              changedAt: new Date().toISOString(),
            }),
            er,
          )
        }
        onBlock={(input, er) => send(actions.setBlocked(input), er)}
        onLift={(er) => send(actions.clearBlocked({}), er)}
      />

      {deciding ? (
        <GoNoGo
          checks={checks}
          attemptsLeft={left}
          decidedBy={me}
          onCancel={() => setDeciding(false)}
          onDecide={(input, er) => {
            let failed = false;
            send(actions.decideGoNoGo(input), (errors) => {
              failed = true;
              er(errors);
            });
            if (!failed) setDeciding(false);
          }}
        />
      ) : null}
      <NextBar
        next={next}
        signedIn={Boolean(me)}
        questionFor={question}
        onOpenDecision={(id) => select(id)}
        onDecide={() => setDeciding(true)}
      />

      <div className="pb-props">
        <div className="pb-prop__key">
          <Icon name="funding" />
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
                (er) =>
                  send(
                    actions.setOpportunityDetails({ name: e.target.value }),
                    er,
                  ),
                () => renameEntry(e.target.value),
              )
            }
          />
        </div>
        <div className="pb-prop__key">
          <Icon name="funder" />
          Funder
        </div>
        <div className="pb-prop__value">
          <select
            className="pb-select pb-select--inline"
            aria-label="Funder"
            value={s.funderId ?? ""}
            onChange={(e) =>
              details.run((er) =>
                send(
                  actions.setOpportunityDetails({ funderId: e.target.value }),
                  er,
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
          <Icon name="funding" />
          Amount
        </div>
        <div className="pb-prop__value">
          <input
            className="pb-input pb-w-130"
            type="number"
            min={0}
            aria-label="Amount"
            defaultValue={s.amount ?? ""}
            key={`a${s.amount ?? ""}`}
            onBlur={(e) =>
              e.target.value !== String(s.amount ?? "") &&
              e.target.value !== "" &&
              details.run((er) =>
                send(
                  actions.setOpportunityDetails({
                    amount: Number(e.target.value),
                    currency: s.currency ?? "EUR",
                  }),
                  er,
                ),
              )
            }
          />
          <input
            className="pb-input pb-w-80"
            aria-label="Currency"
            placeholder="EUR"
            defaultValue={s.currency ?? ""}
            key={`c${s.currency ?? ""}`}
            onBlur={(e) => {
              const typed = e.target.value;
              if (typed.trim() === "" || typed === (s.currency ?? "")) return;
              const code = currencyCode(typed);
              if (!code) {
                details.run((er) => er([new Error(CURRENCY_FORMAT)]));
                return;
              }
              // "eur" for a stored "EUR" changes nothing: show the stored code again.
              if (code === s.currency) {
                e.target.value = code;
                return;
              }
              details.run((er) =>
                send(
                  actions.setOpportunityDetails({
                    currency: code,
                    amount: s.amount ?? undefined,
                  }),
                  er,
                ),
              );
            }}
          />
          <select
            className="pb-select pb-select--inline"
            aria-label="Instrument"
            value={s.instrument ?? ""}
            onChange={(e) =>
              details.run((er) =>
                send(
                  actions.setOpportunityDetails({
                    instrument: enumValue(INSTRUMENTS, e.target.value),
                  }),
                  er,
                ),
              )
            }
          >
            <option value="">Not set</option>
            {VOCABULARY.instrument.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pb-prop__key">
          <Icon name="star" />
          Fit
        </div>
        <div className="pb-prop__value">
          <select
            className="pb-select pb-select--inline"
            aria-label="Fit"
            value={s.fit ?? ""}
            onChange={(e) =>
              details.run((er) =>
                send(
                  actions.setFit({
                    fit: enumValue(FITS, e.target.value) ?? null,
                  }),
                  er,
                ),
              )
            }
          >
            <option value="">Not judged</option>
            {VOCABULARY.fit.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          {fitTerm ? (
            <span className={`pb-tag pb-tag--${fitTerm.tone}`}>
              {fitTerm.label}
            </span>
          ) : null}
          <div className="pb-basis-full">
            <VaultNotes
              label="Fit reasoning note"
              notes={s.fitReasoning ? [s.fitReasoning] : []}
              onAdd={(n, done) =>
                details.run(
                  (er) => send(actions.setFit({ reasoning: n }), er),
                  done,
                )
              }
              onRemove={() =>
                details.run((er) =>
                  send(actions.setFit({ reasoning: null }), er),
                )
              }
            />
          </div>
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
              owner.run((er) =>
                send(actions.setOwner({ owner: address ?? null }), er),
              )
            }
          />
        </div>
        {s.status === "TO_EVALUATE" || s.status === "DECIDING" ? (
          <>
            <div className="pb-prop__key">
              <Icon name="hourglass" />
              Decide by
            </div>
            <div className="pb-prop__value">
              <input
                className="pb-input pb-w-160"
                type="date"
                aria-label="Decide by"
                defaultValue={(s.decideBy ?? "").slice(0, 10)}
                key={`d${s.decideBy ?? ""}`}
                onChange={(e) =>
                  dates.run((er) =>
                    send(
                      actions.setDecideBy({
                        decideBy: e.target.value ? newDay(e.target.value) : null,
                      }),
                      er,
                    ),
                  )
                }
              />
              <ErrorLine message={dates.error} />
            </div>
          </>
        ) : null}
        {s.status === "WATCHING" ? (
          <>
            <div className="pb-prop__key">
              <Icon name="calendar" />
              Expected opening
            </div>
            <div className="pb-prop__value">
              <input
                className="pb-input pb-w-160"
                type="date"
                aria-label="Expected opening"
                defaultValue={(s.expectedOpening ?? "").slice(0, 10)}
                key={`o${s.expectedOpening ?? ""}`}
                onChange={(e) =>
                  dates.run((er) =>
                    send(
                      actions.setExpectedOpening({
                        expectedOpening: e.target.value
                          ? newDay(e.target.value)
                          : null,
                      }),
                      er,
                    ),
                  )
                }
              />
              <ErrorLine message={dates.error} />
            </div>
          </>
        ) : null}
        <div className="pb-prop__key">
          <Icon name="note" />
          Programme
        </div>
        <div className="pb-prop__value">
          <div className="pb-basis-full">
            <VaultNotes
              label="Programme note"
              notes={s.programme ? [s.programme] : []}
              onAdd={(n, done) =>
                details.run(
                  (er) =>
                    send(actions.setOpportunityDetails({ programme: n }), er),
                  done,
                )
              }
              onRemove={() =>
                details.run((er) =>
                  send(actions.setOpportunityDetails({ programme: null }), er),
                )
              }
            />
          </div>
          {s.roundLabel ? (
            <span className="pb-faint pb-small">· {s.roundLabel}</span>
          ) : null}
          {s.roundOpenedAt ? (
            <span className="pb-faint pb-small">
              · opened {fmtInstant(s.roundOpenedAt, ourZone)}
            </span>
          ) : null}
        </div>
      </div>
      <ErrorLine message={details.error} />

      <ConditionsSection
        items={s.conditions}
        decisions={decisions}
        onOpenDecision={(id) => select(id)}
        onAdd={(c, e) => send(actions.addCondition(c), e)}
        onMark={(id, state, checkedAt, e) =>
          send(actions.markCondition({ id, state, checkedAt }), e)
        }
        onRemove={(id, e) => send(actions.removeCondition({ id }), e)}
        onDecisions={(id, decisionIds, e) =>
          send(actions.updateCondition({ id, decisionIds }), e)
        }
      />
      <StepsSection
        items={s.steps}
        ourZone={ourZone}
        now={now}
        onAdd={(st, e) => send(actions.addStep(st), e)}
        onTarget={(id, e) => send(actions.targetCutOff({ id }), e)}
        onRemove={(id, e) => send(actions.removeStep({ id }), e)}
      />
      <AttemptsSection
        limit={s.attemptLimit ?? null}
        left={left}
        entity={s.applyingEntity ?? null}
        onSet={(l, e) => send(actions.setAttemptLimit(l), e)}
        onClear={(e) => send(actions.clearAttemptLimit({}), e)}
        onEntity={(entity, e) => send(actions.setApplyingEntity({ entity }), e)}
      />
      <SubmissionsSection
        items={s.submissions}
        steps={s.steps}
        checks={checks}
        nameFor={personLabel}
        onMark={(m, e) =>
          send(actions.markSubmission({ ...m, submittedBy: me }), e)
        }
        onOutcome={(o, e) => send(actions.recordSubmissionOutcome(o), e)}
      />
      <ConsortiumSection
        coordinatorId={s.coordinatorId}
        partners={s.partners}
        contacts={contacts}
        onCoordinator={(id, e) =>
          send(actions.setCoordinator({ coordinatorId: id ?? null }), e)
        }
        onAdd={(p, e) => send(actions.addPartner(p), e)}
        onRemove={(id, e) => send(actions.removePartner({ id }), e)}
        onStatus={(id, status, e) =>
          send(actions.updatePartner({ id, status }), e)
        }
      />

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
      <InteractionsSection
        items={s.interactions}
        onAdd={(i, e) => send(actions.addInteraction(i), e)}
        onRemove={(id, e) => send(actions.removeInteraction({ id }), e)}
        onUpdate={(c, e) => send(actions.updateInteraction(c), e)}
        onOutcome={(id, outcome, e) => send(actions.setInteractionOutcome({ id, outcome }), e)}
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
      <DeleteRecord document={document} />
    </div>
  );
}
