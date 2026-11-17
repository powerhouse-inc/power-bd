import type { AiGatewayStatus, UseAiGatewayResult } from "@powerhousedao/reactor-browser/ai";
import { useState, type FormEvent } from "react";
import { Icon } from "../Icon.js";
import { useAutoApprove } from "./useChatChoices.js";

/** "Tue 17 Nov" for when the key was set. */
const setOn = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(iso),
  );

interface Props {
  status: AiGatewayStatus;
  gateway: UseAiGatewayResult;
  /** After a key was saved, replaced or removed. */
  onDone?: () => void;
}

/**
 * The server's OpenRouter key, for an admin. The key goes from this field to
 * the server, which tests it and keeps it encrypted; the page shows only its
 * masked hint afterwards, and the agent never sees it. Once a key is set it
 * also holds Auto-approve, each person's own choice, off until they turn it on.
 */
export function KeyCard({ status, gateway, onDone }: Props) {
  const [replacing, setReplacing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const showForm = !status.configured || replacing;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      setValue("");
      setReplacing(false);
      setRemoving(false);
      onDone?.();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void run(() => gateway.setKey(value.trim()));
  };

  return (
    <section className="pb-key" aria-label="OpenRouter key">
      <div className="pb-key__head">
        <Icon name="shield" />
        <span className="pb-key__title">OpenRouter key</span>
        {status.configured ? (
          <span className="pb-tag pb-tag--green">Set</span>
        ) : (
          <span className="pb-tag pb-tag--gray">Not set</span>
        )}
      </div>
      {status.configured ? (
        <p className="pb-key__set">
          <code>{status.keyHint}</code>
          {status.keySetAt ? <span>set {setOn(status.keySetAt)}</span> : null}
          <span className="pb-faint">model {status.model}</span>
        </p>
      ) : (
        <p className="pb-key__text">
          The agent runs on your server with a key from OpenRouter. An admin adds it once, for the
          server's admins.
        </p>
      )}
      {showForm && status.demoKeyAvailable ? (
        <div className="pb-key__actions">
          <button
            type="button"
            className="pb-btn pb-btn--primary"
            disabled={busy}
            onClick={() => void run(gateway.setDemoKey)}
          >
            {busy ? "Testing…" : "Use the key included with your server"}
          </button>
          <span className="pb-key__or">or add your own below</span>
        </div>
      ) : null}
      {showForm ? (
        <form className="pb-key__form" onSubmit={submit}>
          <label className="pb-field">
            <span className="pb-field__label">{status.configured ? "New key" : "Key"}</span>
            <input
              className={error ? "pb-input is-invalid" : "pb-input"}
              type="password"
              name="openrouter-key"
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-or-v1-…"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            {error ? (
              <span className="pb-field__error" role="alert">
                <Icon name="alert-circle" className="pb-icon pb-icon--xs" />
                {error}
              </span>
            ) : (
              <span className="pb-field__help">Tested with OpenRouter before it is kept.</span>
            )}
          </label>
          <div className="pb-key__actions">
            <button
              type="submit"
              className="pb-btn pb-btn--primary"
              disabled={busy || value.trim() === ""}
            >
              {busy ? "Testing…" : "Save and test"}
            </button>
            {replacing ? (
              <button
                type="button"
                className="pb-btn pb-btn--ghost"
                disabled={busy}
                onClick={() => {
                  setReplacing(false);
                  setValue("");
                  setError(undefined);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
          <p className="pb-reassure">
            <Icon name="lock" />
            Stored encrypted on your server and never shown again. The agent never sees it.
          </p>
        </form>
      ) : removing ? (
        <div className="pb-key__confirm">
          <p className="pb-medium">Remove the key?</p>
          <p className="pb-small">
            The agent stops for everyone on this server until a new key is set.
          </p>
          {error ? (
            <p className="pb-field__error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="pb-key__actions">
            <button
              type="button"
              className="pb-btn pb-btn--sm pb-btn--danger"
              disabled={busy}
              onClick={() => void run(gateway.resetKey)}
            >
              Remove key
            </button>
            <button
              type="button"
              className="pb-btn pb-btn--sm pb-btn--ghost"
              disabled={busy}
              onClick={() => setRemoving(false)}
            >
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="pb-key__actions">
            <button type="button" className="pb-btn pb-btn--sm" onClick={() => setReplacing(true)}>
              Replace key
            </button>
            <button
              type="button"
              className="pb-btn pb-btn--sm pb-btn--ghost pb-btn--danger"
              onClick={() => setRemoving(true)}
            >
              Remove key
            </button>
          </div>
          <p className="pb-reassure">
            <Icon name="info" />
            Removing it stops the agent until a new key is set.
          </p>
        </>
      )}
      {status.configured ? <AutoApproveSwitch /> : null}
    </section>
  );
}

/** Auto-approve, each person's own choice, off until they turn it on. */
export function AutoApproveSwitch() {
  const [autoApprove, setAutoApprove] = useAutoApprove();
  return (
    <div className="pb-key__auto">
      <label className="pb-choice">
        <input
          type="checkbox"
          role="switch"
          className="pb-switch"
          checked={autoApprove}
          onChange={(event) => setAutoApprove(event.target.checked)}
        />
        Auto-approve
      </label>
      <p className="pb-reassure">
        <Icon name="info" />
        When on, the agent changes records and takes the steps you ask for without asking you
        first. It is yours alone, in this browser.
      </p>
    </div>
  );
}
