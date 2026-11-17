import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import type { CommonStage } from "../../kit/overview/index.js";
import { moveHint, type MoveTarget } from "../../kit/overview-view/index.js";

/**
 * The stages a card can be moved to without dragging, listed inside the card:
 * each says what it does, or why it cannot take the card. The card's own stage
 * shows only when it has another status to offer.
 */
export function MoveList({
  targets,
  onMove,
  onClose,
}: {
  targets: MoveTarget[];
  onMove: (stage: CommonStage) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="pb-card__moves"
      role="group"
      aria-label="Move to"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") onClose();
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        const buttons = [...e.currentTarget.querySelectorAll("button")];
        const at = buttons.findIndex((b) => b === document.activeElement);
        const next = at + (e.key === "ArrowDown" ? 1 : -1);
        buttons.at(Math.min(Math.max(next, 0), buttons.length - 1))?.focus();
      }}
    >
      {!targets.some((t) => t.accepts) ? (
        <p className="pb-ask__note">
          {[...new Set(targets.map((t) => moveHint(t.outcome)))]
            .filter(Boolean)
            .join(". ")}
          .
        </p>
      ) : null}
      {targets
        .filter(
          (t) => t.outcome.kind !== "stay" && targets.some((x) => x.accepts),
        )
        .map((t, i) => {
          const term = VOCABULARY.commonStage.find((s) => s.value === t.stage);
          return (
            <button
              key={t.stage}
              type="button"
              className="pb-move"
              autoFocus={i === 0}
              aria-disabled={!t.accepts}
              onClick={() => t.accepts && onMove(t.stage)}
            >
              <span>
                <span className={`pb-tag pb-tag--${term?.tone ?? "default"}`}>
                  {term?.label}
                </span>
              </span>
              <span className="pb-move__hint">{moveHint(t.outcome)}</span>
            </button>
          );
        })}
    </div>
  );
}
