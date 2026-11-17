import { useState } from "react";
import { ErrorLine } from "../ErrorLine.js";
import { generateId } from "document-model";
import { Icon } from "../../Icon.js";
import { daysLate, overdueText } from "../../../kit/overview-view/index.js";
import { useToday } from "../useToday.js";
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
  onUpdate,
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
  /** Changes an open step's text, who does it and its due day ("Update the next step"). */
  onUpdate?: (
    step: { id: string; text: string; owner: string | null; dueDate: string | null },
    onErrors: OnErrors,
  ) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [owner, setOwner] = useState("");
  const [due, setDue] = useState("");
  const [editing, setEditing] = useState<string>();
  const [editText, setEditText] = useState("");
  const [editOwner, setEditOwner] = useState("");
  const [editDue, setEditDue] = useState("");
  const { error, run } = useRun();
  const today = useToday();
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
      () => {
        setText("");
        setOwner("");
        setDue("");
        setAdding(false);
      },
    );
  const row = (s: NextStepItem) =>
    editing === s.id ? (
      <div key={s.id} className="pb-todo">
        <div className="pb-todo__main pb-stack pb-gap-6">
          <input
            className="pb-input"
            aria-label="Next step"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="pb-row pb-gap-6">
            {owners.length > 0 ? (
              <select
                className="pb-select pb-select--inline"
                aria-label="Who does it"
                value={editOwner}
                onChange={(e) => setEditOwner(e.target.value)}
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
              className="pb-input pb-w-160"
              type="date"
              aria-label="Due day"
              value={editDue}
              onChange={(e) => setEditDue(e.target.value)}
            />
            <button
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!editText.trim()}
              onClick={() =>
                run(
                  (onErrors) =>
                    onUpdate?.(
                      {
                        id: s.id,
                        text: editText.trim(),
                        owner: editOwner || null,
                        dueDate: editDue ? newDay(editDue) : null,
                      },
                      onErrors,
                    ),
                  () => setEditing(undefined),
                )
              }
            >
              Save
            </button>
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm"
              onClick={() => setEditing(undefined)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    ) : (
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
          {s.dueDate ? (
            !s.doneAt && daysLate(s.dueDate, today) > 0 ? (
              <span className="pb-relative is-overdue">
                {fmtDay(s.dueDate)} · {overdueText(daysLate(s.dueDate, today))}
              </span>
            ) : (
              <span>{fmtDay(s.dueDate)}</span>
            )
          ) : null}
          {s.doneAt ? <span>Done {fmtDay(s.doneAt)}</span> : null}
        </span>
      </div>
      {!s.doneAt && onUpdate ? (
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
          aria-label="Edit this next step"
          onClick={() => {
            setEditing(s.id);
            setEditText(s.text);
            setEditOwner(s.owner ?? "");
            setEditDue(s.dueDate ? s.dueDate.slice(0, 10) : "");
          }}
        >
          <Icon name="edit" />
        </button>
      ) : null}
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
