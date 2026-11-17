import { CaseCard } from "./CaseCard.js";
import { generateId } from "document-model";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { actions } from "document-models/playbook";
import type { PlaybookState } from "document-models/playbook";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import type { Dispatch } from "./run.js";
import { dispatchWith, useRun } from "../../components/shared/useRun.js";

export function ProofCasesSection({
  state,
  dispatch,
}: {
  state: PlaybookState;
  dispatch: Dispatch;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [named, setNamed] = useState(false);
  const errRun = useRun();
  return (
    <div className="pb-section">
      <div className="pb-section__head">
        <h2 className="pb-section__title">
          Proof cases<span className="pb-count">{state.proofCases.length}</span>
        </h2>
      </div>
      {state.proofCases.length === 0 && (
        <p className="pb-muted">
          No proof cases yet. A proof case is something we did that backs a
          claim, with the notes that show it.
        </p>
      )}
      {state.proofCases.map((c) => (
        <CaseCard key={c.id} item={c} dispatch={dispatch} />
      ))}
      <div className="pb-field">
        <input
          className="pb-input"
          placeholder="Title, for example: Pilot with a regional grid operator"
          aria-label="New proof case title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="pb-textarea"
          placeholder="What happened and what it proves"
          aria-label="New proof case summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <div className="pb-row">
          <label className="pb-choice">
            <input
              type="checkbox"
              className="pb-switch"
              checked={named}
              onChange={(e) => setNamed(e.target.checked)}
            />
            May be named publicly
          </label>
          <button
            type="button"
            className="pb-btn"
            disabled={!title.trim()}
            onClick={() => {
              errRun.run(
                (e) =>
                  dispatchWith(
                    dispatch,
                    actions.addProofCase({
                      id: generateId(),
                      title: title.trim(),
                      summary: summary.trim() || null,
                      mayBeNamedPublicly: named,
                    }),
                    e,
                  ),
                () => {
                  setTitle("");
                  setSummary("");
                  setNamed(false);
                },
              );
            }}
          >
            <Icon name="plus" />
            Add proof case
          </button>
        </div>
        <ErrorLine message={errRun.error} />
      </div>
    </div>
  );
}
