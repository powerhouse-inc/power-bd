import { Icon } from "../../components/Icon.js";
import {
  STEP_LABELS,
  type StartResult,
  type StartStep,
} from "../../kit/investors/start-relationship.js";

const STEPS: StartStep[] = ["contact", "lead", "mark"];

/** Lists what "Start relationship" will create, runs it, and names the step that failed. */
export function StartRelationshipPanel({
  name,
  running,
  result,
  onStart,
  onCancel,
}: {
  name: string;
  running: boolean;
  result?: StartResult;
  onStart: () => void;
  onCancel: () => void;
}) {
  const failed = result && !result.ok ? result : undefined;
  const failedAt = failed ? STEPS.indexOf(failed.step) : STEPS.length;
  return (
    <div className="pb-grid pb-gap-10 pb-p-compact">
      <ul className="pb-checks">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`pb-checks__item ${failed ? (i < failedAt ? "is-ok" : i === failedAt ? "is-bad" : "") : ""}`}
          >
            <Icon
              name={
                failed
                  ? i < failedAt
                    ? "check-circle"
                    : i === failedAt
                      ? "alert-circle"
                      : "clock"
                  : "clock"
              }
            />
            {STEP_LABELS[s]} for {name}
          </li>
        ))}
      </ul>
      {failed && (
        <div className="pb-callout" role="alert">
          <Icon name="alert-circle" />
          <div>
            <strong>{STEP_LABELS[failed.step]} did not work.</strong>{" "}
            {failed.message}
            <div>
              Already made:{" "}
              {failed.created.organisationId || failed.created.leadId
                ? [
                    failed.created.organisationId && "the organisation",
                    failed.created.leadId && "the investor lead",
                  ]
                    .filter(Boolean)
                    .join(" and ")
                : "nothing"}
              . The investor is still shortlisted. Open Organisations or Leads
              to see what exists before trying again.
            </div>
          </div>
        </div>
      )}
      <div className="pb-row">
        <button
          type="button"
          className="pb-btn pb-btn--primary pb-btn--sm"
          disabled={running || !!failed}
          onClick={onStart}
        >
          {running ? "Starting…" : "Start relationship"}
        </button>
        <button
          type="button"
          className="pb-btn pb-btn--ghost pb-btn--sm"
          disabled={running}
          onClick={onCancel}
        >
          {failed ? "Close" : "Cancel"}
        </button>
      </div>
      <p className="pb-reassure">
        <Icon name="shield" />
        Creates an organisation and an investor lead. Nobody is contacted.
      </p>
    </div>
  );
}
