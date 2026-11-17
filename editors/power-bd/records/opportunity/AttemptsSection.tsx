import type {
  SetApplyingEntityEntityInput,
  SetAttemptLimitInput,
} from "document-models/opportunity";
import { useState } from "react";
import {
  ErrorLine,
  Section,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { VaultNoteChip } from "../../components/vault/VaultNoteLink.js";
import { VaultNotePicker } from "../../components/vault/VaultNotePicker.js";

const day = (iso: string) => iso.slice(0, 10);

export type Limit = {
  max: number;
  withdrawnCounts: boolean;
  source: string;
  checkedAt: string;
} | null;

/** The attempt limit, attempts left, and the entity that applies. */
export function AttemptsSection({
  limit,
  left,
  entity,
  onSet,
  onClear,
  onEntity,
}: {
  limit: Limit;
  left: number | null;
  entity: { id: string; title: string } | null;
  onSet: (l: SetAttemptLimitInput, e: OnErrors) => void;
  onClear: (e: OnErrors) => void;
  onEntity: (e: SetApplyingEntityEntityInput | null, er: OnErrors) => void;
}) {
  const run = useRun();
  const [max, setMax] = useState("");
  const [withdrawn, setWithdrawn] = useState(false);
  const [source, setSource] = useState("");
  return (
    <Section title="Attempts left">
      {limit ? (
        <p>
          <strong>
            {left === null ? "Unknown" : `${left} of ${limit.max}`}
          </strong>{" "}
          <span className="pb-muted">
            attempts left
            {left === null
              ? ": name the applying entity to count them"
              : ""}.{" "}
            {limit.withdrawnCounts
              ? "A withdrawn application counts."
              : "A withdrawn application does not count."}
          </span>
          <span className="pb-faint pb-small">
            {" "}
            {limit.source}, checked {day(limit.checkedAt)}
          </span>{" "}
          <button
            className="pb-btn pb-btn--ghost pb-btn--sm"
            onClick={() => run.run(onClear)}
          >
            Remove the limit
          </button>
        </p>
      ) : (
        <p className="pb-faint pb-small">No attempt limit recorded.</p>
      )}
      <div className="pb-row pb-wrap">
        <input
          className="pb-input pb-w-90"
          type="number"
          min={1}
          placeholder="Most"
          aria-label="Most attempts"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
        <label className="pb-row pb-small">
          <input
            type="checkbox"
            checked={withdrawn}
            onChange={(e) => setWithdrawn(e.target.checked)}
          />
          A withdrawn application counts
        </label>
        <input
          className="pb-input"
          placeholder="Where it says so"
          aria-label="Source of the limit"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <button
          className="pb-btn pb-btn--sm"
          disabled={!max || !source.trim()}
          onClick={() =>
            run.run((er) =>
              onSet(
                {
                  max: Number(max),
                  withdrawnCounts: withdrawn,
                  source: source.trim(),
                  checkedAt: new Date().toISOString(),
                },
                er,
              ),
            )
          }
        >
          {limit ? "Change the limit" : "Set the limit"}
        </button>
      </div>
      <div className="pb-row pb-wrap pb-align-start pb-mt-8">
        <span className="pb-small pb-muted pb-mt-6">Applying entity:</span>
        {entity ? (
          <VaultNoteChip note={entity} />
        ) : (
          <span className="pb-faint pb-small pb-mt-6">Not set</span>
        )}
        <div className="pb-flex-1 pb-minw-240">
          <VaultNotePicker
            label="Applying entity"
            linked={entity ? [entity.id] : []}
            onPick={(note, clear) => run.run((er) => onEntity(note, er), clear)}
          />
        </div>
      </div>
      <ErrorLine message={run.error} />
    </Section>
  );
}
