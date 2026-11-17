import { Icon } from "../../../components/Icon.js";
import type { SetupStep, SetupStepId } from "../../../kit/first-run/index.js";

const NOTE: Partial<Record<SetupStep["state"], string>> = {
  done: "done",
  skipped: "skipped",
  current: "next",
};

/** The numbered steps side by side; picking one shows its panel. */
export function StepsStrip({
  steps,
  open,
  onPick,
}: {
  steps: readonly SetupStep[];
  open: SetupStepId | null;
  onPick: (id: SetupStepId) => void;
}) {
  return (
    <ol className="pb-steps" aria-label="Set-up steps">
      {steps.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            className={`pb-steps__step is-${s.state}${open === s.id ? " is-open" : ""}`}
            aria-current={open === s.id ? "step" : undefined}
            aria-label={`Step ${s.number}: ${s.short}${NOTE[s.state] ? `, ${NOTE[s.state]}` : ""}`}
            onClick={() => onPick(s.id)}
          >
            <span className="pb-steps__num">
              {s.state === "done" ? <Icon name="check" /> : s.number}
            </span>
            {s.short}
            {s.state === "skipped" && (
              <span className="pb-steps__note">skipped</span>
            )}
          </button>
        </li>
      ))}
    </ol>
  );
}
