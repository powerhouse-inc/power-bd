import { useToday } from "../../components/shared/useToday.js";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useUser, type DocumentDispatch } from "@powerhousedao/reactor-browser";
import {
  actions,
  type DecisionAction,
  type DecisionDocument,
} from "document-models/decision";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { OwnerPicker } from "../../components/shared/OwnerPicker.js";
import { useRenameRecord } from "../../components/shared/useRenameRecord.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { ReferencesSection } from "../../components/shared/relationship/ReferencesSection.js";
import {
  fmtDay,
  newDay,
  Section,
  useRun,
  dispatchWith,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { decisionImpact } from "../../kit/decision-impact/index.js";
import {
  daysOverdue,
  gatedRows,
  gatedTotal,
  isOverdue,
} from "../../kit/decision-view/index.js";
import { useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";
import { DeleteRecord } from "../../components/shared/DeleteRecord.js";

/** The decision page: shown in the Decisions place and in the thin editor. */
export function DecisionDetail({
  document,
  dispatch,
}: {
  document: DecisionDocument;
  dispatch: DocumentDispatch<DecisionAction>;
}) {
  const s = document.state.global;
  const id = document.header.id;
  const team = useTeam();
  const user = useUser();
  const select = useSetSelectedNode();
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const opps = useOpportunityDocumentsInSelectedDrive() ?? [];
  const props = useProposalDocumentsInSelectedDrive() ?? [];
  const [answer, setAnswer] = useState("");
  const [reason, setReason] = useState("");
  const details = useRun();
  const owner = useRun();
  const due = useRun();
  const answerRun = useRun();
  const reopenRun = useRun();
  const withdrawRun = useRun();
  const send = (action: DecisionAction, onErrors: OnErrors) =>
    dispatchWith(dispatch, action, onErrors);

  const impact = decisionImpact({
    decisionId: id,
    leads: leads.map((d) => ({ id: d.header.id, state: d.state.global })),
    opportunities: opps.map((d) => ({
      id: d.header.id,
      state: d.state.global,
    })),
    proposals: props.map((d) => ({ id: d.header.id, state: d.state.global })),
  });
  const rows = gatedRows(impact);
  const total = gatedTotal(impact);
  const today = useToday();
  const status = VOCABULARY.decisionStatus.find((t) => t.value === s.status);
  const overdue = isOverdue(s.status, s.decideBy, today);
  const open = s.status === "OPEN";
  const me = user?.address;
  const personName = (a: string) =>
    team.nameFor(a) ?? `${a.slice(0, 6)}…${a.slice(-4)}`;
  const question = s.question ?? "";
  const renameEntry = useRenameRecord(document.header.id);
  const setQuestion = (q: string, c: string) =>
    details.run(
      (e) => send(actions.setQuestion({ question: q, context: c }), e),
      () => q !== question && renameEntry(q),
    );

  return (
    <div className="pb-page">
      <div className="pb-page__head">
        <span className="pb-page__icon pb-page__icon--yellow">
          <Icon name="decisions" />
        </span>
        <input
          className="pb-input pb-page__title"
          aria-label="Question"
          placeholder="What needs deciding?"
          defaultValue={question}
          key={`q-${question}`}
          onBlur={(e) =>
            e.target.value !== question &&
            e.target.value.trim() &&
            setQuestion(e.target.value, s.context ?? "")
          }
        />
      </div>
      <ErrorLine message={details.error} />

      <div className="pb-props">
        <div className="pb-prop__key">
          <Icon name="leads" />
          Status
        </div>
        <div className="pb-prop__value">
          <span className={`pb-tag pb-tag--${status?.tone}`}>
            {status?.label}
          </span>
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
              owner.run((e) =>
                send(actions.setDecisionOwner({ owner: address ?? null }), e),
              )
            }
          />
        </div>
        <div className="pb-prop__key">
          <Icon name="hourglass" />
          Decide by
        </div>
        <div className="pb-prop__value">
          <input
            type="date"
            className="pb-input pb-input--auto"
            aria-label="Decide by"

            value={s.decideBy ? s.decideBy.slice(0, 10) : ""}
            onChange={(e) =>
              due.run((er) =>
                send(
                  actions.setDecideBy({
                    decideBy: e.target.value ? newDay(e.target.value) : null,
                  }),
                  er,
                ),
              )
            }
          />
          {overdue && s.decideBy ? (
            <span className="pb-when is-overdue">
              <span className="pb-when__ours">
                {fmtDay(s.decideBy)} · {daysOverdue(s.decideBy, today)} days
                overdue
              </span>
            </span>
          ) : null}
          <ErrorLine message={due.error} />
        </div>
      </div>

      <textarea
        className="pb-textarea pb-mt-14"

        aria-label="Context"
        placeholder="What should the person answering know?"
        defaultValue={s.context ?? ""}
        key={`c-${s.context ?? ""}`}
        onBlur={(e) =>
          e.target.value !== (s.context ?? "") &&
          question.trim() &&
          setQuestion(question, e.target.value)
        }
      />
      {!question.trim() && (
        <p className="pb-faint pb-small">
          Write the question first; the context is saved with it.
        </p>
      )}

      <Section title="What this decides" count={rows.length}>
        {rows.length === 0 ? (
          <p className="pb-faint pb-small">
            Nothing is waiting on this decision yet. Link it from a lead or a
            funding opportunity.
          </p>
        ) : (
          <div className="pb-list">
            {rows.map((r) => (
              <button
                key={r.key}
                className="pb-list__item pb-list__item--button"

                onClick={() => select(r.id)}
              >
                <span className="pb-list__lead">
                  <Icon name="funding" />
                </span>
                <span className="pb-list__main">
                  <span className="pb-list__title">{r.name || "Untitled"}</span>
                  <span className="pb-list__sub">
                    {r.sub}
                    {r.closed ? " · closed" : ""}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="Answer">
        {s.status === "ANSWERED" ? (
          <div>
            <p>{s.answer}</p>
            <p className="pb-faint pb-small">
              Answered by {s.answeredBy ? personName(s.answeredBy) : "someone"}
              {s.answeredAt ? ` on ${fmtDay(s.answeredAt)}` : ""}
            </p>
          </div>
        ) : s.status === "WITHDRAWN" ? (
          <p className="pb-muted">
            Withdrawn{s.reason ? `: ${s.reason}` : ""}. Nothing waits on it any
            more.
          </p>
        ) : (
          <>
            <p className="pb-small pb-muted">
              {total === 0
                ? "Answering affects no item yet."
                : `Answering will affect ${total} ${total === 1 ? "item" : "items"}, listed above.`}
            </p>
            <textarea
              className="pb-textarea"
              aria-label="Your answer"
              placeholder="What did we decide, and why?"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="pb-row">
              <p className="pb-reassure pb-flex-1 pb-minw-260">
                <Icon name="shield" />
                {me
                  ? "Only a person can answer. Answering changes no condition by itself: the people who own them are asked to review."
                  : "Sign in to answer: only a signed-in person can answer a decision."}
              </p>
              <button
                className="pb-btn pb-btn--primary"
                disabled={!me || !answer.trim()}
                onClick={() =>
                  me &&
                  answerRun.run(
                    (e) => {
                      send(
                        actions.answerDecision({
                          answer: answer.trim(),
                          answeredBy: me,
                          answeredAt: new Date().toISOString(),
                        }),
                        e,
                      );
                    },
                    () => setAnswer(""),
                  )
                }
              >
                <PeopleMark />
                Answer decision
              </button>
            </div>
            <ErrorLine message={answerRun.error} />
          </>
        )}
      </Section>

      {open || s.status === "ANSWERED" ? (
        <Section title={open ? "Withdraw" : "Reopen"}>
          <input
            className="pb-input"
            aria-label="Reason"
            placeholder={open ? "Why is it withdrawn?" : "Why is it reopened?"}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="pb-row pb-mt-8">
            <p className="pb-reassure pb-flex-1 pb-minw-260">
              <Icon name="shield" />
              {open
                ? "Withdrawing keeps the question and your reason in the history."
                : "Reopening clears the answer from this page. It stays in the history."}
            </p>
            <button
              className="pb-btn"
              disabled={!reason.trim()}
              onClick={() =>
                (open ? withdrawRun : reopenRun).run(
                  (e) => {
                    send(
                      open
                        ? actions.withdrawDecision({ reason: reason.trim() })
                        : actions.reopenDecision({ reason: reason.trim() }),
                      e,
                    );
                  },
                  () => setReason(""),
                )
              }
            >
              {open ? "Withdraw decision" : "Reopen decision"}
            </button>
          </div>
          <ErrorLine message={open ? withdrawRun.error : reopenRun.error} />
        </Section>
      ) : null}

      <ReferencesSection
        items={s.references}
        onAdd={(r, e) => send(actions.addReference(r), e)}
        onRemove={(rid, e) => send(actions.removeReference({ id: rid }), e)}
      />
      <DeleteRecord document={document} />
    </div>
  );
}
