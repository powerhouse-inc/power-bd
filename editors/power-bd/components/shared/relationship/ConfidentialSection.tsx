import { useUser } from "@powerhousedao/reactor-browser";
import { ErrorLine } from "../ErrorLine.js";
import { useState } from "react";
import { generateId } from "document-model";
import { Icon } from "../../Icon.js";
import {
  fmtDay,
  Section,
  useRun,
  type OnErrors,
  type Option,
} from "./common.js";

export type ConfidentialItemView = {
  id: string;
  subjectContactId?: string | null;
  text: string;
  addedBy: string;
  addedAt: string;
};

export function ConfidentialSection({
  items,
  subjects,
  personLabel,
  onAdd,
  onRemove,
}: {
  items: readonly ConfidentialItemView[];
  /** Organisations an item can be about. */
  subjects: Option[];
  personLabel: (address: string) => string;
  onAdd: (
    item: {
      id: string;
      subjectContactId?: string;
      text: string;
      addedAt: string;
    },
    onErrors: OnErrors,
  ) => void;
  onRemove: (id: string, onErrors: OnErrors) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const { error, run } = useRun();
  const signedIn = Boolean(useUser()?.address);
  return (
    <Section
      title="Confidential"
      count={items.length}
      action={
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm"
          onClick={() => setAdding(!adding)}
        >
          <Icon name="lock" />
          Add
        </button>
      }
    >
      {adding ? (
        <div className="pb-grid pb-gap-8 pb-mb-8">
          <textarea
            className="pb-textarea"
            rows={3}
            placeholder="What must stay inside the team?"
            aria-label="Confidential note"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="pb-row">
            <select
              className="pb-select pb-select--inline"
              aria-label="About"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">About the whole relationship</option>
              {subjects.map((s) => (
                <option key={s.value} value={s.value}>
                  About {s.label}
                </option>
              ))}
            </select>
            <button
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!text.trim() || !signedIn}
              title={signedIn ? undefined : "Sign in to add a note"}
              onClick={() =>
                run((onErrors) =>
                  onAdd(
                    {
                      id: generateId(),
                      subjectContactId: subject || undefined,
                      text: text.trim(),
                      addedAt: new Date().toISOString(),
                    },
                    onErrors,
                  ),
                  () => {
                    setText("");
                    setSubject("");
                    setAdding(false);
                  },
                )
              }
            >
              Add confidential note
            </button>
          </div>
          {signedIn ? null : (
            <p className="pb-reassure">
              <Icon name="shield" />
              Sign in to add a note: it records who wrote it.
            </p>
          )}
        </div>
      ) : null}
      <ErrorLine message={error} />
      {items.map((c) => {
        const about = subjects.find((s) => s.value === c.subjectContactId);
        return (
          <div key={c.id} className="pb-callout pb-callout--purple pb-mb-8">
            <Icon name="lock" />
            <div className="pb-callout__body">
              <div className="pb-callout__title">
                Confidential{about ? ` · about ${about.label}` : ""}
              </div>
              <div className="pb-callout__text">
                {c.text} Added by {personLabel(c.addedBy)}, {fmtDay(c.addedAt)}.
              </div>
              <p className="pb-reassure pb-mt-8">
                <Icon name="shield" />
                Only people with access to this team's Power BD workspace see
                this. It never reaches the vault's search or chat.
              </p>
            </div>
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
              aria-label="Remove this confidential note"
              onClick={() => run((onErrors) => onRemove(c.id, onErrors))}
            >
              <Icon name="trash" />
            </button>
          </div>
        );
      })}
    </Section>
  );
}
