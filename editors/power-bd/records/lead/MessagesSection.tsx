import { MessageCard } from "./MessageCard.js";
import {
  CHANNELS,
  type MessageCallbacks,
  type MessageView,
} from "./messages.js";
export type { MessageCallbacks, MessageView } from "./messages.js";
import { useUser } from "@powerhousedao/reactor-browser";
import { enumValue, MESSAGE_CHANNELS } from "../../kit/enums.js";
import type { MessageChannel } from "document-models/lead";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useState } from "react";
import { generateId } from "document-model";
import { Icon } from "../../components/Icon.js";
import {
  Section,
  useRun,
  type Option,
} from "../../components/shared/relationship/common.js";
import {
  type ConfidentialText,
  type NeverClaimItem,
} from "../../kit/sensitivity/sensitivity.js";

export function MessagesSection({
  messages,
  playbookLoaded,
  neverClaims,
  confidential,
  recipients,
  angles,
  recipientLabel,
  personLabel,
  callbacks,
}: {
  messages: readonly MessageView[];
  /** The playbook was found in the open drive; without it nothing can be approved. */
  playbookLoaded: boolean;
  neverClaims: readonly (NeverClaimItem & { claim?: string })[];
  confidential: readonly ConfidentialText[];
  /** value is `contactId|personId`. */
  recipients: Option[];
  angles: Option[];
  recipientLabel: (r: MessageView["recipient"]) => string;
  personLabel: (address: string) => string;
  callbacks: MessageCallbacks;
}) {
  const [adding, setAdding] = useState(false);
  const [channel, setChannel] = useState<MessageChannel>("EMAIL");
  const [recipient, setRecipient] = useState("");
  const [angleId, setAngleId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { error, run } = useRun();
  const signedIn = Boolean(useUser()?.address);
  const submit = () =>
    run(
      (onErrors) => {
        const [contactId, personId] = recipient.split("|");
        callbacks.onDraft(
          {
            id: generateId(),
            channel,
            recipient: recipient ? { contactId, personId } : undefined,
            subject: subject.trim() || undefined,
            body: body.trim(),
            angleId: angleId || undefined,
          },
          onErrors,
        );
      },
      () => {
        setBody("");
        setSubject("");
      },
    );
  return (
    <Section
      title="Outreach"
      count={
        messages.filter((m) => m.status === "DRAFT" || m.status === "APPROVED")
          .length
      }
      action={
        <button
          className="pb-btn pb-btn--sm"
          onClick={() => setAdding(!adding)}
        >
          <Icon name="plus" />
          Write a draft
        </button>
      }
    >
      {adding ? (
        <div className="pb-grid pb-gap-8 pb-mb-10">
          <div className="pb-row">
            <select
              className="pb-select pb-select--inline"
              aria-label="Channel"
              value={channel}
              onChange={(e) =>
                setChannel(
                  enumValue(MESSAGE_CHANNELS, e.target.value) ?? channel,
                )
              }
            >
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <select
              className="pb-select pb-select--inline"
              aria-label="To"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            >
              <option value="">No recipient yet</option>
              {recipients.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <select
              className="pb-select pb-select--inline"
              aria-label="Angle"
              value={angleId}
              onChange={(e) => setAngleId(e.target.value)}
            >
              <option value="">No angle</option>
              {angles.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <input
            className="pb-input"
            placeholder="Subject"
            aria-label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="pb-textarea"
            rows={6}
            placeholder="Write the message"
            aria-label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="pb-row">
            <button
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!body.trim() || !signedIn}
              title={signedIn ? undefined : "Sign in to save a draft"}
              onClick={submit}
            >
              Save draft
            </button>
          </div>
          {signedIn ? null : (
            <p className="pb-reassure">
              <Icon name="shield" />
              Sign in to save a draft: it records who wrote it.
            </p>
          )}
          <ErrorLine message={error} />
        </div>
      ) : null}
      {messages.length === 0 ? (
        <p className="pb-faint pb-small">No messages yet.</p>
      ) : null}
      {messages.map((m) => (
        <MessageCard
          key={m.id}
          m={m}
          playbookLoaded={playbookLoaded}
          neverClaims={neverClaims}
          confidential={confidential}
          recipientLabel={recipientLabel}
          personLabel={personLabel}
          cb={callbacks}
        />
      ))}
    </Section>
  );
}
