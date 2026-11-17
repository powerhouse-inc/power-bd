import type { ProofCase } from "./types.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { actions } from "document-models/playbook";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { VaultNotes } from "../../components/shared/VaultNotes.js";
import type { Dispatch } from "./run.js";
import { dispatchWith, useRun } from "../../components/shared/useRun.js";

export function CaseCard({
  item,
  dispatch,
}: {
  item: ProofCase;
  dispatch: Dispatch;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [summary, setSummary] = useState(item.summary ?? "");
  const errRun = useRun();
  const evidenceRun = useRun();
  const comparableRun = useRun();
  const removeRun = useRun();
  return (
    <div className="pb-card pb-grid pb-gap-12 pb-p-16">
      <div className="pb-row">
        <h3 className="pb-card__heading">{item.title}</h3>
        <span
          className={`pb-tag pb-tag--${item.mayBeNamedPublicly ? "green" : "gray"}`}
        >
          {item.mayBeNamedPublicly ? "May be named" : "Keep unnamed"}
        </span>
      </div>
      {editing ? (
        <div className="pb-field">
          <input
            className="pb-input"
            aria-label="Proof case title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="pb-textarea"
            aria-label="Proof case summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <div className="pb-row">
            <button
              type="button"
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!title.trim()}
              onClick={() => {
                errRun.run(
                  (e) =>
                    dispatchWith(
                      dispatch,
                      actions.updateProofCase({ id: item.id, title, summary }),
                      e,
                    ),
                  () => setEditing(false),
                );
              }}
            >
              Save
            </button>
            <button
              type="button"
              className="pb-btn pb-btn--ghost pb-btn--sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {item.summary && <p className="pb-m-0 pb-prewrap">{item.summary}</p>}
          <div className="pb-row">
            <button
              type="button"
              className="pb-btn pb-btn--sm"
              onClick={() => {
                setTitle(item.title);
                setSummary(item.summary ?? "");
                setEditing(true);
              }}
            >
              <Icon name="edit" />
              Edit
            </button>
            <label className="pb-choice">
              <input
                type="checkbox"
                className="pb-switch"
                checked={item.mayBeNamedPublicly}
                onChange={(event) =>
                  errRun.run((onErrors) =>
                    dispatchWith(
                      dispatch,
                      actions.updateProofCase({
                        id: item.id,
                        mayBeNamedPublicly: event.target.checked,
                      }),
                      onErrors,
                    ),
                  )
                }
              />
              May be named publicly
            </label>
          </div>
        </>
      )}
      <ErrorLine message={errRun.error} />
      <VaultNotes
        label="Evidence"
        notes={item.evidence}
        error={evidenceRun.error}
        onAdd={(n, done) =>
          evidenceRun.run(
            (e) =>
              dispatchWith(
                dispatch,
                actions.addProofEvidence({
                  proofCaseId: item.id,
                  evidenceId: n.id,
                  title: n.title,
                }),
                e,
              ),
            done,
          )
        }
        onRemove={(id) =>
          evidenceRun.run((e) =>
            dispatchWith(
              dispatch,
              actions.removeProofEvidence({
                proofCaseId: item.id,
                evidenceId: id,
              }),
              e,
            ),
          )
        }
      />
      <VaultNotes
        label="Comparables"
        notes={item.comparables}
        error={comparableRun.error}
        onAdd={(n, done) =>
          comparableRun.run(
            (e) =>
              dispatchWith(
                dispatch,
                actions.linkProofComparable({
                  proofCaseId: item.id,
                  comparableId: n.id,
                  title: n.title,
                }),
                e,
              ),
            done,
          )
        }
        onRemove={(id) =>
          comparableRun.run((e) =>
            dispatchWith(
              dispatch,
              actions.unlinkProofComparable({
                proofCaseId: item.id,
                comparableId: id,
              }),
              e,
            ),
          )
        }
      />
      <div className="pb-row">
        <p className="pb-reassure pb-flex-1 pb-minw-240">
          <Icon name="shield" />
          Removing a proof case also takes it off any positioning that rests on
          it. The evidence notes stay in the vault.
        </p>
        <button
          type="button"
          className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--danger"
          onClick={() =>
            removeRun.run((e) =>
              dispatchWith(
                dispatch,
                actions.removeProofCase({ id: item.id }),
                e,
              ),
            )
          }
        >
          Remove
        </button>
      </div>
      <ErrorLine message={removeRun.error} />
    </div>
  );
}
