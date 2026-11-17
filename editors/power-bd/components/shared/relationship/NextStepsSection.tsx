import { useState } from "react";
import { ErrorLine } from "../ErrorLine.js";
import { generateId } from "document-model";
import { Icon } from "../../Icon.js";
import {
  fmtDay,
  newDay,
  Section,
  useRun,
  type OnErrors,
  type Option,
} from "./common.js";

export type NextStepItem = {
  id: string;
  text: string;
  owner?: string | null;
  dueDate?: string | null;
  doneAt?: string | null;
};

export function NextStepsSection({
  items,
  owners,
  ownerLabel,
  onAdd,
  onComplete,
  onReopen,
  onRemove,
}: {
  items: readonly NextStepItem[];
  /** Team members to pick from; empty hides the owner picker. */
  owners: Option[];
  ownerLabel: (address: string) => string;
  onAdd: (
    step: { id: string; text: string; owner?: string; dueDate?: string },
    onErrors: OnErrors,
  ) => void;
  onComplete: (id: string, doneAt: string, onErrors: OnErrors) => void;
  onReopen: (id: string, onErrors: OnErrors) => void;
  onRemove: (id: string, onErrors: OnErrors) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [owner, setOwner] = useState("");
  const [due, setDue] = useState("");
  const { error, run } = useRun();
  const open = items.filter((s) => !s.doneAt);
  const done = items.filter((s) => s.doneAt);
  const submit = () =>
    run((onErrors) =>
      onAdd(
        {
          id: generateId(),
          text: text.trim(),
          owner: owner || undefined,
          dueDate: due ? newDay(due) : undefined,
        },
        onErrors,
      ),
    );
  const row = (s: NextStepItem) => (
    <div key={s.id} className={`pb-todo${s.doneAt ? " is-done" : ""}`}>
      <input
        type="checkbox"
        className="pb-check"
        checked={!!s.doneAt}
        aria-label={
          s.doneAt ? "Reopen this next step" : "Mark this next step done"
        }
        onChange={() =>
          run((onErrors) =>
            s.doneAt
              ? onReopen(s.id, onErrors)
              : onComplete(s.id, new Date().toISOString(), onErrors),
          )
        }
      />
      <div className="pb-todo__main">
        <span className="pb-todo__text">{s.text}</span>
        <span className="pb-todo__meta">
          {s.owner ? <span>{ownerLabel(s.owner)}</span> : null}
          {s.dueDate ? <span>{fmtDay(s.dueDate)}</span> : null}
          {s.doneAt ? <span>Done {fmtDay(s.doneAt)}</span> : null}
        </span>
      </div>
      <button
        className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
        aria-label="Remove this next step"
        onClick={() => run((onErrors) => onRemove(s.id, onErrors))}
      >
        <Icon name="trash" />
      </button>
    </div>
  );
  return (
    <Section
      title="Next steps"
      count={open.length}
      action={
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm"
          onClick={() => setAdding(!adding)}
        >
          <Icon name="plus" />
          Add
        </button>
      }
    >
      {adding ? (
        <div className="pb-row pb-mb-8">
          <input
            className="pb-input pb-flex-1 pb-minw-200"

            placeholder="What happens next?"
            aria-label="Next step"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {owners.length > 0 ? (
            <select
              className="pb-select pb-select--inline"
              aria-label="Who does it"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            >
              <option value="">Nobody yet</option>
              {owners.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : null}
          <input
            type="date"
            className="pb-input"
            aria-label="Due day"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
          <button
            className="pb-btn pb-btn--primary pb-btn--sm"
            disabled={!text.trim()}
            onClick={submit}
          >
            Add next step
          </button>
        </div>
      ) : null}
      <ErrorLine message={error} />
      {items.length === 0 ? (
        <p className="pb-faint pb-small">No next steps yet.</p>
      ) : null}
      {[...open, ...done].map(row)}
    </Section>
  );
}
