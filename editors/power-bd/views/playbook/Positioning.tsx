import { PositioningCard } from "./PositioningCard.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { generateId } from "document-model";
import { actions } from "document-models/playbook";
import type { PlaybookState } from "document-models/playbook";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import type { Dispatch } from "./run.js";
import { dispatchWith, useRun } from "../../components/shared/useRun.js";

/** The id of the field a first positioning is written in, so the empty playbook's button can go to it. */
export const NEW_POSITIONING_TITLE = "pb-new-positioning-title";

export function PositioningSection({
  state,
  dispatch,
}: {
  state: PlaybookState;
  dispatch: Dispatch;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const errRun = useRun();
  return (
    <div className="pb-section">
      <div className="pb-section__head">
        <h2 className="pb-section__title">
          Positioning
          <span className="pb-count">{state.positioning.length}</span>
        </h2>
      </div>
      {state.positioning.length === 0 && (
        <p className="pb-muted">
          No positioning yet. Write the first one below; it starts as a draft.
        </p>
      )}
      {state.positioning.map((item) => (
        <PositioningCard
          key={item.id}
          item={item}
          state={state}
          dispatch={dispatch}
        />
      ))}
      <div className="pb-field">
        <input
          className="pb-input"
          id={NEW_POSITIONING_TITLE}
          placeholder="Title, for example: For funders"
          aria-label="New positioning title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="pb-textarea"
          placeholder="What we say about ourselves, and to whom"
          aria-label="New positioning text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="pb-row">
          <button
            type="button"
            className="pb-btn"
            disabled={!title.trim() || !text.trim()}
            onClick={() => {
              errRun.run(
                (e) =>
                  dispatchWith(
                    dispatch,
                    actions.addPositioning({
                      id: generateId(),
                      title: title.trim(),
                      text: text.trim(),
                    }),
                    e,
                  ),
                () => {
                  setTitle("");
                  setText("");
                },
              );
            }}
          >
            <Icon name="plus" />
            Add positioning
          </button>
        </div>
        <ErrorLine message={errRun.error} />
      </div>
    </div>
  );
}
