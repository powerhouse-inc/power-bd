import type { AddStepInput, StepKind } from "document-models/opportunity";
import { generateId } from "document-model";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import {
  ErrorLine,
  fmtInstant,
  Section,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { enumValue } from "../../kit/enums.js";
import { STEP_KINDS, zonedToInstant } from "../../kit/funding/index.js";

const day = (iso: string) => iso.slice(0, 10);
const KIND_VALUES = STEP_KINDS.map(([value]) => value);

export type StepItem = {
  id: string;
  kind: StepKind;
  label: string;
  at: string;
  timeZone: string;
  targeted: boolean;
  source: string;
  checkedAt: string;
};

/** "By when?": dated steps in our time and the funder's, the targeted cut-off marked. */
export function StepsSection({
  items,
  ourZone,
  now,
  onAdd,
  onTarget,
  onRemove,
}: {
  items: readonly StepItem[];
  ourZone: string;
  now: string;
  onAdd: (s: AddStepInput, e: OnErrors) => void;
  onTarget: (id: string, e: OnErrors) => void;
  onRemove: (id: string, e: OnErrors) => void;
}) {
  const run = useRun();
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<StepKind>("CUT_OFF");
  const [label, setLabel] = useState("");
  const [wall, setWall] = useState("");
  const [zone, setZone] = useState("");
  const [source, setSource] = useState("");
  const sorted = [...items].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const sameZone = (z: string) => z === ourZone;
  return (
    <Section
      title="By when?"
      count={items.length}
      action={
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm"
          onClick={() => setAdding(!adding)}
        >
          <Icon name="plus" />
          Add step
        </button>
      }
    >
      {sorted.length === 0 ? (
        <p className="pb-faint pb-small">No dated steps yet.</p>
      ) : (
        <table className="pb-table pb-table--compact">
          <thead>
            <tr>
              <th>Step</th>
              <th>
                <Icon name="clock" />
                Your time
              </th>
              <th>
                <Icon name="globe" />
                The funder's time
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const past = Date.parse(s.at) < Date.parse(now);
              return (
                <tr key={s.id} className={past ? "pb-muted" : undefined}>
                  <td className="pb-table__title">
                    {s.label}
                    {s.targeted ? (
                      <span className="pb-tag pb-tag--blue pb-ml-6">
                        We aim for this
                      </span>
                    ) : null}
                    {past ? (
                      <span className="pb-tag pb-tag--gray pb-ml-6">
                        Passed
                      </span>
                    ) : null}
                    <span className="pb-table__sub">
                      {STEP_KINDS.find(([v]) => v === s.kind)?.[1]} · {s.source}
                      , checked {day(s.checkedAt)}
                    </span>
                  </td>
                  <td className="pb-num">{fmtInstant(s.at, ourZone)}</td>
                  <td className="pb-num">
                    {sameZone(s.timeZone)
                      ? "Same time"
                      : fmtInstant(s.at, s.timeZone)}
                  </td>
                  <td>
                    {s.kind === "CUT_OFF" && !s.targeted && !past ? (
                      <button
                        className="pb-btn pb-btn--ghost pb-btn--sm"
                        onClick={() => run.run((er) => onTarget(s.id, er))}
                      >
                        Aim for this
                      </button>
                    ) : null}
                    <button
                      className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                      aria-label={`Remove step: ${s.label}`}
                      onClick={() => run.run((er) => onRemove(s.id, er))}
                    >
                      <Icon name="trash" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="pb-reassure">
        <Icon name="shield" />
        Shown in your time ({ourZone}). Each date also shows the funder's own
        clock, so a deadline at night for you is not missed.
      </p>
      <ErrorLine message={run.error} />
      {adding ? (
        <div className="pb-row pb-wrap pb-mt-8">
          <select
            className="pb-select pb-select--inline"
            aria-label="Kind of step"
            value={kind}
            onChange={(e) =>
              setKind(enumValue(KIND_VALUES, e.target.value) ?? kind)
            }
          >
            {STEP_KINDS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <input
            className="pb-input"
            placeholder="Name of the step"
            aria-label="Step name"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            className="pb-input"
            type="datetime-local"
            aria-label="Date and time on the funder's clock"
            value={wall}
            onChange={(e) => setWall(e.target.value)}
          />
          <input
            className="pb-input"
            placeholder={`Funder's time zone, e.g. ${ourZone}`}
            aria-label="Funder's time zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          />
          <input
            className="pb-input"
            placeholder="Where it says so"
            aria-label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <button
            className="pb-btn pb-btn--sm"
            disabled={!label.trim() || !wall || !source.trim()}
            onClick={() =>
              run.run(
                (er) => {
                  const tz = zone.trim() || ourZone;
                  let at: string;
                  try {
                    at = zonedToInstant(wall, tz);
                  } catch {
                    er([
                      new Error(
                        "That time zone is not known. Use a name like Europe/Berlin.",
                      ),
                    ]);
                    return;
                  }
                  onAdd(
                    {
                      id: generateId(),
                      kind,
                      label: label.trim(),
                      at,
                      timeZone: tz,
                      source: source.trim(),
                      checkedAt: new Date().toISOString(),
                    },
                    er,
                  );
                },
                () => {
                  setLabel("");
                  setWall("");
                  setSource("");
                },
              )
            }
          >
            Add step
          </button>
        </div>
      ) : null}
    </Section>
  );
}
