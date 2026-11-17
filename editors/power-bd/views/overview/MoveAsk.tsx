import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import {
  moveReassurance,
  type MoveOption,
  type MoveOutcome,
} from "../../kit/overview-view/index.js";

type Asking = Extract<MoveOutcome, { kind: "choose" | "reason" | "decision" }>;

const tone = (o: MoveOption) =>
  (o.act === "OPPORTUNITY_STATUS"
    ? VOCABULARY.opportunityStatus
    : VOCABULARY.leadStatus
  ).find((t) => t.value === o.status)?.tone ?? "default";

/** Moves the focus to the next or previous option with the arrow keys. */
function arrows(e: React.KeyboardEvent<HTMLElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  const buttons = [
    ...(e.currentTarget.parentElement?.querySelectorAll("button") ?? []),
  ];
  const next =
    buttons.findIndex((b) => b === e.currentTarget) +
    (e.key === "ArrowDown" ? 1 : -1);
  buttons.at(Math.min(Math.max(next, 0), buttons.length - 1))?.focus();
  e.preventDefault();
}

/**
 * The question a move asks, standing in the stage the card was put on: which
 * status, why, or where go or no-go is decided. Escape puts the card back.
 */
export function MoveAsk({
  name,
  stage,
  outcome,
  busy,
  onApply,
  onOpenRecord,
  onCancel,
}: {
  name: string;
  /** The stage's name, as the board shows it. */
  stage: string;
  outcome: Asking;
  busy: boolean;
  onApply: (option: MoveOption, reason?: string) => void;
  onOpenRecord: () => void;
  onCancel: () => void;
}) {
  const [picked, setPicked] = useState<MoveOption | null>(
    outcome.kind === "reason" ? outcome.option : null,
  );
  const [reason, setReason] = useState("");
  const reassurance = moveReassurance(outcome);
  const title = `Move “${name || "Untitled"}” to ${stage}`;
  const text = reason.trim();

  return (
    <div
      className="pb-ask"
      role="dialog"
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        onCancel();
      }}
    >
      <div className="pb-ask__title">{title}</div>
      {outcome.kind === "decision" ? (
        <>
          <p className="pb-ask__note">{outcome.why}. Nothing was changed.</p>
          <div className="pb-ask__foot">
            <button className="pb-btn pb-btn--sm" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="pb-btn pb-btn--primary pb-btn--sm"
              autoFocus
              onClick={onOpenRecord}
            >
              <PeopleMark />
              Open to decide
            </button>
          </div>
        </>
      ) : picked ? (
        <form
          className="pb-stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (text && !busy) onApply(picked, text);
          }}
        >
          <label className="pb-field">
            <span className="pb-field__label">
              <span className={`pb-tag pb-tag--${tone(picked)}`}>
                {picked.label}
              </span>{" "}
              {picked.ask}
            </span>
            <input
              className="pb-input"
              autoFocus
              required
              placeholder="A short reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          {reassurance ? (
            <p className="pb-reassure">
              <Icon name="shield" />
              {reassurance}
            </p>
          ) : null}
          <div className="pb-ask__foot">
            <button
              type="button"
              className="pb-btn pb-btn--sm"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!text || busy}
            >
              Move
            </button>
          </div>
        </form>
      ) : outcome.kind === "choose" ? (
        <>
          <div className="pb-ask__options" role="group" aria-label="Status">
            {outcome.options.map((o, i) => (
              <button
                key={o.status}
                type="button"
                className="pb-menu__item pb-ask__option"
                autoFocus={i === 0}
                disabled={busy}
                onKeyDown={arrows}
                onClick={() => (o.reason ? setPicked(o) : onApply(o))}
              >
                <span className={`pb-tag pb-tag--${tone(o)}`}>{o.label}</span>
                {o.reason ? (
                  <span className="pb-menu__hint">asks why</span>
                ) : null}
              </button>
            ))}
          </div>
          {outcome.note ? (
            <p className="pb-ask__note">{outcome.note}.</p>
          ) : null}
          {reassurance ? (
            <p className="pb-reassure">
              <Icon name="shield" />
              {reassurance}
            </p>
          ) : null}
          <div className="pb-ask__foot">
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
