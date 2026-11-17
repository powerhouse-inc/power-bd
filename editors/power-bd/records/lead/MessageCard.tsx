import { Marked, type Found } from "./MessageMarked.js";
import {
  CHANNELS,
  term,
  type MessageCallbacks,
  type MessageView,
} from "./messages.js";
import { useUser } from "@powerhousedao/reactor-browser";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { fmtDay, useRun } from "../../components/shared/relationship/common.js";
import { approvalGate } from "../../kit/approval-gate/approval-gate.js";
import {
  checkSensitivity,
  type ConfidentialText,
  type NeverClaimItem,
} from "../../kit/sensitivity/sensitivity.js";

export function MessageCard({
  m,
  playbookLoaded,
  neverClaims,
  confidential,
  recipientLabel,
  personLabel,
  cb,
}: {
  m: MessageView;
  playbookLoaded: boolean;
  neverClaims: readonly (NeverClaimItem & { claim?: string })[];
  confidential: readonly ConfidentialText[];
  recipientLabel: (r: MessageView["recipient"]) => string;
  personLabel: (address: string) => string;
  cb: MessageCallbacks;
}) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(m.subject ?? "");
  const [body, setBody] = useState(m.body);
  const { error, run } = useRun();
  const signedIn = Boolean(useUser()?.address);
  const t = term(m.status);
  const gate = (found: number) =>
    approvalGate({ playbookLoaded, findings: found, signedIn });
  const closed = m.status === "SENT" || m.status === "DISCARDED";
  if (closed) {
    return (
      <div className="pb-message pb-message--collapsed">
        <div className="pb-message__head">
          <Icon
            name={m.status === "SENT" ? "send" : "trash"}
            className="pb-icon pb-icon--muted"
          />
          <span className="pb-small pb-medium">{m.subject || "Message"}</span>
          <span className={`pb-tag pb-tag--${t.tone}`}>{t.label}</span>
          {m.status === "SENT" && m.sentAt ? (
            <span className="pb-faint pb-small">
              {fmtDay(m.sentAt)} by {personLabel(m.sentBy ?? "")}
              {m.approvedBy
                ? ` · approved by ${personLabel(m.approvedBy)}`
                : ""}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
  const found: Found[] =
    m.status === "DRAFT"
      ? [
          ...checkSensitivity(m.subject ?? "", neverClaims, confidential).map(
            (finding) => ({ field: "subject" as const, finding }),
          ),
          ...checkSensitivity(m.body, neverClaims, confidential).map(
            (finding) => ({ field: "body" as const, finding }),
          ),
        ]
      : [];
  const claimOf = (id: string) => neverClaims.find((n) => n.id === id)?.claim;
  return (
    <div className="pb-message">
      <div className="pb-message__head">
        <Icon name="mail" className="pb-icon pb-icon--muted" />
        <span className="pb-small">
          To <span className="pb-medium">{recipientLabel(m.recipient)}</span>
          {" · "}
          {CHANNELS.find((c) => c.value === m.channel)?.label}
        </span>
        <span className={`pb-tag pb-tag--${t.tone}`}>{t.label}</span>
        <span className="pb-faint pb-small">
          Drafted by {personLabel(m.draftedBy)}
          {m.approvedBy ? ` · approved by ${personLabel(m.approvedBy)}` : ""}
        </span>
      </div>
      {editing ? (
        <div className="pb-grid pb-gap-8 pb-py-8">
          <input
            className="pb-input"
            aria-label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="pb-textarea"
            rows={8}
            aria-label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="pb-row">
            <button
              className="pb-btn pb-btn--primary pb-btn--sm"
              onClick={() =>
                run((onErrors) =>
                  cb.onUpdate({ id: m.id, subject, body }, (errs) =>
                    onErrors(errs),
                  ),
                )
              }
            >
              Save changes
            </button>
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm"
              onClick={() => setEditing(false)}
            >
              Close editor
            </button>
          </div>
        </div>
      ) : (
        <>
          {m.subject ? (
            <div className="pb-message__subject">
              <Marked
                text={m.subject}
                found={found.filter((f) => f.field === "subject")}
              />
            </div>
          ) : null}
          <div className="pb-message__body">
            <Marked
              text={m.body}
              found={found.filter((f) => f.field === "body")}
            />
          </div>
        </>
      )}
      <div className="pb-message__foot pb-grid pb-gap-10">
        {found.length > 0 ? (
          <div className="pb-callout pb-callout--red">
            <Icon name="alert" />
            <div className="pb-callout__body">
              <div className="pb-callout__title">
                {found.length === 1
                  ? "1 thing to fix before you can approve"
                  : `${found.length} things to fix before you can approve`}
              </div>
              {found.map(({ finding: f }, i) => (
                <div key={i} className="pb-callout__text">
                  {f.kind === "never-claim"
                    ? `The draft says "${f.phrase}". ${claimOf(f.itemId) ? `We must never claim: ${claimOf(f.itemId)}. ` : ""}Remove or reword the highlighted phrase.`
                    : `The draft repeats ${f.words} words in a row from a confidential note. Reword it.`}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <ErrorLine message={error} />
        <div className="pb-row">
          {m.status === "DRAFT" ? (
            <button
              className="pb-btn pb-btn--sm"
              onClick={() => setEditing(!editing)}
            >
              <Icon name="edit" />
              Edit
            </button>
          ) : (
            <button
              className="pb-btn pb-btn--sm"
              onClick={() => run((e) => cb.onReopen(m.id, e))}
            >
              <Icon name="undo" />
              Reopen as draft
            </button>
          )}
          <button
            className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--danger"
            onClick={() => run((e) => cb.onDiscard(m.id, e))}
          >
            <Icon name="trash" />
            Discard
          </button>
          <span className="pb-toolbar__spacer" />
          {m.status === "DRAFT" ? (
            <button
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!gate(found.length).canApprove}
              title={
                gate(found.length).message
                  ? `${gate(found.length).message}`
                  : found.length > 0
                    ? "Fix the highlighted phrases first"
                    : signedIn
                      ? undefined
                      : "Sign in to approve: only a person can"
              }
              onClick={() => run((e) => cb.onApprove(m.id, e))}
            >
              <PeopleMark />
              Approve
            </button>
          ) : (
            <button
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!signedIn}
              title={
                signedIn ? undefined : "Sign in to mark sent: only a person can"
              }
              onClick={() => run((e) => cb.onMarkSent(m.id, e))}
            >
              <PeopleMark />
              Mark sent
            </button>
          )}
        </div>
        <p className="pb-reassure">
          <Icon name="shield" />
          {signedIn
            ? ""
            : "Sign in to approve or mark sent: only a person can. "}
          {m.status === "DRAFT" && gate(found.length).message
            ? `${gate(found.length).message}. `
            : ""}
          {m.status === "DRAFT"
            ? "Nothing is sent from Power BD. After you approve, you send it yourself, then mark it sent."
            : "Nothing is sent from Power BD. Mark it sent only after you have sent it yourself."}
        </p>
      </div>
    </div>
  );
}
