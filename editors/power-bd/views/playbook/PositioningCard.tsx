import type { PositioningItem } from "./types.js";
import { useUser } from "@powerhousedao/reactor-browser";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { actions } from "document-models/playbook";
import type { PlaybookState } from "document-models/playbook";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import { VaultNotes } from "../../components/shared/VaultNotes.js";
import { approvalState, editNote } from "../../kit/playbook/playbook.js";
import type { Dispatch } from "./run.js";
import { dispatchWith, useRun } from "../../components/shared/useRun.js";
import { StatusTag } from "./Tag.js";

export function PositioningCard({
  item,
  state,
  dispatch,
}: {
  item: PositioningItem;
  state: PlaybookState;
  dispatch: Dispatch;
}) {
  const user = useUser();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [text, setText] = useState(item.text);
  const editRun = useRun();
  const approveRun = useRun();
  const retireRun = useRun();
  const noteRun = useRun();
  const proofRun = useRun();
  const note = editNote(item.status);
  const approval = approvalState(item.status, Boolean(user?.address));
  const final = item.status === "RETIRED";

  const save = () =>
    editRun.run(
      (e) =>
        dispatchWith(
          dispatch,
          actions.updatePositioning({ id: item.id, title, text }),
          e,
        ),
      () => setEditing(false),
    );

  return (
    <div className="pb-card pb-grid pb-gap-12 pb-p-16">
      <div className="pb-row">
        <h3 className="pb-card__heading">{item.title}</h3>
        <StatusTag status={item.status} />
      </div>
      {editing ? (
        <div className="pb-field">
          <input
            className="pb-input"
            aria-label="Positioning title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="pb-textarea"
            aria-label="Positioning text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="pb-row">
            <button
              type="button"
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!title.trim() || !text.trim()}
              onClick={save}
            >
              Save
            </button>
            <button
              type="button"
              className="pb-btn pb-btn--ghost pb-btn--sm"
              onClick={() => {
                setEditing(false);
                setTitle(item.title);
                setText(item.text);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="pb-m-0 pb-prewrap">{item.text}</p>
      )}
      {!final && !editing && (
        <div className="pb-row">
          <button
            type="button"
            className="pb-btn pb-btn--sm"
            onClick={() => {
              setTitle(item.title);
              setText(item.text);
              setEditing(true);
            }}
          >
            <Icon name="edit" />
            Edit
          </button>
          {note && (
            <p className="pb-reassure pb-flex-1 pb-minw-240">
              <Icon name="info" />
              {note}
            </p>
          )}
        </div>
      )}
      {final && note && (
        <p className="pb-reassure">
          <Icon name="lock" />
          {note}
        </p>
      )}
      <ErrorLine message={editRun.error} />
      {item.status === "APPROVED" && item.approvedAt && (
        <p className="pb-muted pb-m-0">Approved on {fmtDay(item.approvedAt)}</p>
      )}

      {item.status === "DRAFT" && (
        <div className="pb-field">
          <div className="pb-row">
            <p className="pb-reassure pb-flex-1 pb-minw-240">
              <Icon name="shield" />
              {approval.allowed
                ? "Only a person can approve. Approving changes nothing already sent; you can still edit it, which returns it to draft."
                : approval.reason}
            </p>
            <button
              type="button"
              className="pb-btn pb-btn--primary"
              disabled={!approval.allowed}
              onClick={() =>
                user?.address &&
                approveRun.run((e) =>
                  dispatchWith(
                    dispatch,
                    actions.approvePositioning({
                      id: item.id,
                      approvedBy: user.address,
                      approvedAt: new Date().toISOString(),
                    }),
                    e,
                  ),
                )
              }
            >
              <PeopleMark />
              Approve positioning
            </button>
          </div>
          <ErrorLine message={approveRun.error} />
        </div>
      )}

      <VaultNotes
        label="Comparables"
        notes={item.comparables}
        disabled={final}
        error={noteRun.error}
        onAdd={(n, done) =>
          noteRun.run(
            (e) =>
              dispatchWith(
                dispatch,
                actions.linkPositioningComparable({
                  positioningId: item.id,
                  comparableId: n.id,
                  title: n.title,
                }),
                e,
              ),
            done,
          )
        }
        onRemove={(id) =>
          noteRun.run((e) =>
            dispatchWith(
              dispatch,
              actions.unlinkPositioningComparable({
                positioningId: item.id,
                comparableId: id,
              }),
              e,
            ),
          )
        }
      />

      {state.proofCases.length > 0 && (
        <div className="pb-field">
          <span className="pb-field__label">Proof cases it rests on</span>
          {state.proofCases.map((c) => {
            const linked = item.proofCaseIds.includes(c.id);
            return (
              <label className="pb-choice" key={c.id}>
                <input
                  type="checkbox"
                  checked={linked}
                  disabled={final}
                  onChange={() =>
                    proofRun.run((e) =>
                      dispatchWith(
                        dispatch,
                        linked
                          ? actions.unlinkPositioningProof({
                              positioningId: item.id,
                              proofCaseId: c.id,
                            })
                          : actions.linkPositioningProof({
                              positioningId: item.id,
                              proofCaseId: c.id,
                            }),
                        e,
                      ),
                    )
                  }
                />
                {c.title}
              </label>
            );
          })}
          <ErrorLine message={proofRun.error} />
        </div>
      )}

      {!final && (
        <div className="pb-row">
          <p className="pb-reassure pb-flex-1 pb-minw-240">
            <Icon name="shield" />
            Retiring is final: it stays on record but can never change or be
            approved again.
          </p>
          <button
            type="button"
            className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--danger"
            onClick={() =>
              retireRun.run((e) =>
                dispatchWith(
                  dispatch,
                  actions.retirePositioning({ id: item.id }),
                  e,
                ),
              )
            }
          >
            Retire
          </button>
        </div>
      )}
      <ErrorLine message={retireRun.error} />
    </div>
  );
}
