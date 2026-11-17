import {
  dispatchActions,
  type DocumentDispatch,
} from "@powerhousedao/reactor-browser";
import {
  actions,
  type ProposalAction,
  type ProposalState,
} from "document-models/proposal";
import { useState, type ReactNode } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import { dispatchWith, useRun } from "../../components/shared/useRun.js";
import { useTeam } from "../../components/shared/useTeam.js";
import type { ApprovalGate } from "../../kit/approval-gate/approval-gate.js";
import {
  answerLine,
  approveNote,
  statusRules,
} from "../../kit/proposal-view/index.js";
import { FilePicker, FileSlot, type useAttach } from "./Files.js";
import type { Send } from "./tabs/types.js";

const PERSON_BUTTON = "pb-btn pb-btn--primary";

/** The notice that says why the text is locked. */
function FrozenCallout({ status }: { status: ProposalState["status"] }) {
  const frozen = statusRules(status).frozen;
  if (!frozen) return null;
  return (
    <div
      className={`pb-callout${frozen.tone === "blue" ? " pb-callout--blue" : ""}`}
    >
      <Icon name="lock" />
      <div className="pb-callout__body">
        <div className="pb-callout__title">{frozen.title}</div>
        <div className="pb-callout__text">{frozen.text}</div>
      </div>
    </div>
  );
}

/** One action of the panel: its controls, the line that says what pressing them does, and a quiet way out at the end. */
function ActionRow({
  children,
  note,
  wide,
  end,
}: {
  children: ReactNode;
  note?: string;
  wide?: boolean;
  end?: ReactNode;
}) {
  return (
    <div className="pb-actions__row">
      <div className={`pb-actions__do${wide ? " pb-actions__do--wide" : ""}`}>
        {children}
      </div>
      {note ? (
        <p className="pb-reassure">
          <Icon name="shield" />
          {note}
        </p>
      ) : null}
      {end ? <div className="pb-actions__end">{end}</div> : null}
    </div>
  );
}

/** Withdrawing, once it was pressed: the reason, the step itself, and a way back. */
function WithdrawRow({
  onWithdraw,
  onKeep,
}: {
  onWithdraw: (reason: string) => void;
  onKeep: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <ActionRow
      note="Withdrawing keeps the proposal and your reason in the history."
      wide
    >
      <input
        className="pb-input"
        aria-label="Why you are withdrawing it"
        placeholder="Why you are withdrawing it"
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <button
        className="pb-btn pb-btn--sm pb-btn--danger"
        disabled={!reason.trim()}
        onClick={() => onWithdraw(reason.trim())}
      >
        Withdraw the proposal
      </button>
      <button className="pb-btn pb-btn--ghost pb-btn--sm" onClick={onKeep}>
        Keep it
      </button>
    </ActionRow>
  );
}

/**
 * What can be done with the proposal now, in one panel: approve, mark sent,
 * record the answer, withdraw; and the sent and signed copies. Each step is a person's.
 */
export function StatusPanel({
  s,
  documentId,
  dispatch,
  attach,
  me,
  gate,
  findings,
  lapsed,
}: {
  s: ProposalState;
  documentId: string;
  dispatch: DocumentDispatch<ProposalAction>;
  attach: ReturnType<typeof useAttach>["attach"];
  me: string;
  gate: ApprovalGate;
  findings: number;
  lapsed: boolean;
}) {
  const team = useTeam();
  const status = useRun();
  const [answerOption, setAnswerOption] = useState("");
  const [reason, setReason] = useState("");
  const [sentFile, setSentFile] = useState<File | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const rules = statusRules(s.status);
  /** Asks for the reason only once it is pressed; sits at the end of the first row. */
  const withdraw =
    rules.canWithdraw && !withdrawing ? (
      <button
        className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--danger"
        onClick={() => setWithdrawing(true)}
      >
        Withdraw…
      </button>
    ) : null;
  const send: Send = (a, e) => dispatchWith(dispatch, a, e);
  const nameOf = (address: string | null | undefined) =>
    address ? team.ownerName(address) : "someone";
  const now = () => new Date().toISOString();

  const supersedeOld = (e: Parameters<Send>[1]) => {
    if (s.revisesProposalId)
      void dispatchActions(
        actions.supersedeProposal({ supersededByProposalId: documentId }),
        s.revisesProposalId,
        e,
      );
  };
  const markSent = () =>
    status.run((e) => {
      const base = { sentBy: me, sentAt: now() };
      if (sentFile)
        void attach(
          sentFile,
          (copy) => actions.markProposalSent({ ...base, copy }),
          e,
        ).then((ok) => ok && supersedeOld(e));
      else dispatch(actions.markProposalSent(base), e, () => supersedeOld(e));
    });
  const record = (input: {
    accepted: boolean;
    chosenOptionId?: string;
    reason?: string;
  }) =>
    status.run((e) =>
      send(actions.recordProposalAnswer({ ...input, answeredAt: now() }), e),
    );

  const rows = (): ReactNode => {
    switch (rules.panel) {
      case "draft":
        return (
          <ActionRow
            end={withdraw}
            note={approveNote({
              gateMessage: gate.message,
              signedIn: !!me,
              findings,
            })}
          >
            <button
              className={PERSON_BUTTON}
              disabled={!gate.canApprove}
              onClick={() =>
                status.run((e) =>
                  send(
                    actions.approveProposal({
                      approvedBy: me,
                      approvedAt: now(),
                    }),
                    e,
                  ),
                )
              }
            >
              <PeopleMark />
              Approve
            </button>
          </ActionRow>
        );
      case "approved":
        return (
          <>
            <ActionRow
              end={withdraw}
              note="Nothing is sent from Power BD. Send it yourself first, then mark it sent."
            >
              <span className="pb-actions__fact">
                Approved by {nameOf(s.approvedBy)}
                {s.approvedAt ? `, ${fmtDay(s.approvedAt)}` : ""}.
              </span>
              <button
                className={PERSON_BUTTON}
                disabled={!me}
                onClick={markSent}
              >
                <PeopleMark />
                Mark sent
              </button>
              <FilePicker
                label={
                  sentFile
                    ? `Copy: ${sentFile.name}`
                    : "Attach the copy you sent (optional)"
                }
                onFile={setSentFile}
              />
            </ActionRow>
            <ActionRow note="Reopening clears the approval; it stays in the history.">
              <button
                className="pb-btn pb-btn--sm"
                onClick={() =>
                  status.run((e) => send(actions.reopenProposal({}), e))
                }
              >
                <Icon name="edit" />
                Reopen to edit
              </button>
            </ActionRow>
          </>
        );
      case "sent":
        return (
          <>
            <ActionRow
              end={withdraw}
              note="Recording the answer changes this proposal only. Nothing is sent to the client."
            >
              <span className="pb-actions__fact">
                Sent by {nameOf(s.sentBy)}
                {s.sentAt ? `, ${fmtDay(s.sentAt)}` : ""}.
                {lapsed ? " Past its valid until day with no answer." : ""}
              </span>
              <select
                className="pb-select pb-input--auto"
                aria-label="Option chosen"
                value={answerOption}
                onChange={(e) => setAnswerOption(e.target.value)}
              >
                <option value="">Option chosen…</option>
                {s.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                className="pb-btn pb-btn--primary pb-btn--sm"
                disabled={!answerOption}
                onClick={() =>
                  record({ accepted: true, chosenOptionId: answerOption })
                }
              >
                The client accepted
              </button>
            </ActionRow>
            <ActionRow wide>
              <input
                className="pb-input"
                aria-label="Reason for declining"
                placeholder="Why they declined"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button
                className="pb-btn pb-btn--sm"
                disabled={!reason.trim()}
                onClick={() =>
                  record({ accepted: false, reason: reason.trim() })
                }
              >
                The client declined
              </button>
            </ActionRow>
          </>
        );
      case "answered":
        return (
          <ActionRow>
            <span className="pb-actions__fact">
              {answerLine({
                status: s.status === "ACCEPTED" ? "ACCEPTED" : "DECLINED",
                chosen: s.options.find((o) => o.id === s.chosenOptionId)?.label,
                reason: s.reason,
                day: s.answeredAt ? fmtDay(s.answeredAt) : null,
              })}
            </span>
          </ActionRow>
        );
      case "ended":
        return s.reason ? (
          <ActionRow>
            <span className="pb-actions__fact">Reason: {s.reason}</span>
          </ActionRow>
        ) : null;
    }
  };
  const main = rows();

  return (
    <div className="pb-stack pb-gap-10">
      <FrozenCallout status={s.status} />
      {main ? (
        <div className="pb-actions" aria-label="What you can do now">
          {main}
          {withdrawing && rules.canWithdraw ? (
            <WithdrawRow
              onKeep={() => setWithdrawing(false)}
              onWithdraw={(why) =>
                status.run((e) =>
                  send(actions.withdrawProposal({ reason: why }), e),
                )
              }
            />
          ) : null}
        </div>
      ) : null}
      <ErrorLine message={status.error} />
      {rules.showsSentCopy ? (
        <FileSlot
          label="The copy that was sent"
          file={s.sentCopy}
          documentId={documentId}
          editable
          attach={attach}
          make={(file) => actions.setSentCopy({ file })}
          clear={actions.setSentCopy({})}
          send={send}
        />
      ) : null}
      {rules.showsSignedCopy ? (
        <FileSlot
          label="The signed copy"
          file={s.signedCopy}
          documentId={documentId}
          editable
          attach={attach}
          make={(file) => actions.setSignedCopy({ file })}
          clear={actions.setSignedCopy({})}
          send={send}
        />
      ) : null}
    </div>
  );
}
