import { useRef, useState, type FormEvent } from "react";
import { DEFAULT_MODEL, type KeyTestOutcome, type OwnKeyShown } from "../../kit/chat/index.js";
import { Icon } from "../Icon.js";
import { AutoApproveSwitch } from "./KeyCard.js";
import type { OwnKey } from "./useChatService.js";

const NOT_KEPT: Record<Exclude<KeyTestOutcome, "accepted">, string> = {
  refused: "OpenRouter didn't accept this key. Check it and try again.",
  unreachable: "OpenRouter couldn't be reached. Check your connection and try again.",
};

interface Props {
  /** The key kept here, masked; undefined before one is. */
  saved: OwnKeyShown | undefined;
  ownKey: OwnKey;
  /** After a key was saved, replaced or removed. */
  onDone?: () => void;
}

/**
 * The person's own OpenRouter key, where the server doesn't run the agent for
 * them. It is tested with OpenRouter before it is kept, in this browser and for
 * this person only; the page shows only its masked hint afterwards, and the
 * agent never sees it. Once kept it also holds the model and Auto-approve.
 */
export function OwnKeyCard({ saved, ownKey, onDone }: Props) {
  const [editing, setEditing] = useState<"key" | "model" | "remove">();
  // The key stays in the field alone: a controlled field would copy it into
  // the page's HTML as the input's value attribute.
  const field = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState(false);
  const [model, setModel] = useState("");
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string>();
  const keyForm = !saved || editing === "key";

  const close = () => {
    setEditing(undefined);
    if (field.current) field.current.value = "";
    setTyped(false);
    setError(undefined);
  };
  const saveKey = async (event: FormEvent) => {
    event.preventDefault();
    setTesting(true);
    setError(undefined);
    try {
      const outcome = await ownKey.save(field.current?.value.trim() ?? "");
      if (outcome === "accepted") {
        close();
        onDone?.();
      } else {
        setError(NOT_KEPT[outcome]);
      }
    } finally {
      setTesting(false);
    }
  };
  const chooseModel = (event: FormEvent) => {
    event.preventDefault();
    ownKey.setModel(model.trim());
    close();
  };
  const remove = () => {
    ownKey.remove();
    close();
    onDone?.();
  };

  return (
    <section className="pb-key" aria-label="Your OpenRouter key">
      <div className="pb-key__head">
        <Icon name="lock" />
        <span className="pb-key__title">Your OpenRouter key</span>
        {saved ? (
          <span className="pb-tag pb-tag--green">Set</span>
        ) : (
          <span className="pb-tag pb-tag--gray">Not set</span>
        )}
      </div>
      {saved ? (
        <p className="pb-key__set">
          <code>{saved.hint}</code>
          <span>in this browser</span>
          <span className="pb-faint">model {saved.model}</span>
        </p>
      ) : (
        <p className="pb-key__text">
          This server doesn't run the agent for you. With your own key from OpenRouter, it runs
          here in this browser instead.
        </p>
      )}
      {keyForm ? (
        <form className="pb-key__form" onSubmit={(event) => void saveKey(event)}>
          <label className="pb-field">
            <span className="pb-field__label">{saved ? "New key" : "Key"}</span>
            <input
              className={error ? "pb-input is-invalid" : "pb-input"}
              type="password"
              name="openrouter-key"
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-or-v1-…"
              ref={field}
              readOnly={testing}
              aria-invalid={error ? true : undefined}
              onChange={(event) => setTyped(event.target.value.trim() !== "")}
            />
            {error ? (
              <span className="pb-field__error" role="alert">
                <Icon name="alert-circle" className="pb-icon pb-icon--xs" />
                {error}
              </span>
            ) : (
              <span className="pb-field__help">
                {saved
                  ? "Your current key stays until this one passes the test."
                  : "Tested with OpenRouter before it is kept. The test spends nothing."}
              </span>
            )}
          </label>
          <div className="pb-key__actions">
            <button
              type="submit"
              className="pb-btn pb-btn--primary"
              disabled={testing || !typed}
            >
              {testing ? "Testing…" : "Save and test"}
            </button>
            {saved ? (
              <button type="button" className="pb-btn pb-btn--ghost" disabled={testing} onClick={close}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : editing === "model" ? (
        <form className="pb-key__form" onSubmit={chooseModel}>
          <label className="pb-field">
            <span className="pb-field__label">Model</span>
            <input
              className="pb-input"
              name="openrouter-model"
              autoComplete="off"
              spellCheck={false}
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
            <span className="pb-field__help">An OpenRouter model id, such as {DEFAULT_MODEL}.</span>
          </label>
          <div className="pb-key__actions">
            <button
              type="submit"
              className="pb-btn pb-btn--sm pb-btn--primary"
              disabled={model.trim() === "" || model.trim() === saved.model}
            >
              Use this model
            </button>
            <button type="button" className="pb-btn pb-btn--sm pb-btn--ghost" onClick={close}>
              Cancel
            </button>
          </div>
        </form>
      ) : editing === "remove" ? (
        <div className="pb-key__confirm">
          <p className="pb-medium">Remove your key from this browser?</p>
          <p className="pb-small">
            The agent stops until you add a key again. The key itself stays valid at OpenRouter.
          </p>
          <div className="pb-key__actions">
            <button type="button" className="pb-btn pb-btn--sm pb-btn--danger" onClick={remove}>
              Remove key
            </button>
            <button type="button" className="pb-btn pb-btn--sm pb-btn--ghost" onClick={close}>
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="pb-key__actions">
          <button type="button" className="pb-btn pb-btn--sm" onClick={() => setEditing("key")}>
            Replace key
          </button>
          <button
            type="button"
            className="pb-btn pb-btn--sm"
            onClick={() => {
              setModel(saved.model);
              setEditing("model");
            }}
          >
            Change model
          </button>
          <button
            type="button"
            className="pb-btn pb-btn--sm pb-btn--ghost pb-btn--danger"
            onClick={() => setEditing("remove")}
          >
            Remove key
          </button>
        </div>
      )}
      <p className="pb-reassure">
        <Icon name="lock" />
        Your key stays in this browser, for you only, and goes only to OpenRouter. The agent never
        sees it.
      </p>
      {saved ? <AutoApproveSwitch /> : null}
      <p className="pb-key__note">
        <Icon name="info" />
        An admin can set a server key instead, which is safer.
      </p>
    </section>
  );
}
