import type {
  AddConditionInput,
  ConditionKind,
  ConditionState,
} from "document-models/opportunity";
import { generateId } from "document-model";
import { useState, type CSSProperties } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { VaultNoteChip } from "../../components/vault/VaultNoteLink.js";
import {
  ErrorLine,
  Section,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { enumValue } from "../../kit/enums.js";
import {
  CONDITION_KINDS,
  CONDITION_STATES,
  conditionSummary,
} from "../../kit/funding/index.js";
import type { DecisionChoice } from "./types.js";

const day = (iso: string) => iso.slice(0, 10);
const KIND_VALUES = CONDITION_KINDS.map(([value]) => value);

/** The ring's fill is data, so it is the one inline style: a custom property. */
const ringStyle = (
  percent: number,
): CSSProperties & Record<"--pb-ring", number> => ({ "--pb-ring": percent });

export type Cond = {
  id: string;
  kind: ConditionKind;
  text: string;
  state: ConditionState;
  decisionIds: readonly string[];
  factNotes: readonly { id: string; title: string }[];
  source: string;
  checkedAt: string;
};

/** "Can we apply?": every condition with its state, source and checked day. */
export function ConditionsSection({
  items,
  decisions,
  onOpenDecision,
  onAdd,
  onMark,
  onRemove,
  onDecisions,
}: {
  items: readonly Cond[];
  decisions: readonly DecisionChoice[];
  onOpenDecision: (id: string) => void;
  onAdd: (c: AddConditionInput, e: OnErrors) => void;
  onMark: (
    id: string,
    state: ConditionState,
    checkedAt: string,
    e: OnErrors,
  ) => void;
  onRemove: (id: string, e: OnErrors) => void;
  onDecisions: (id: string, decisionIds: string[], e: OnErrors) => void;
}) {
  const sum = conditionSummary(items);
  const run = useRun();
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<ConditionKind>("ELIGIBILITY");
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [decisionId, setDecisionId] = useState("");
  const question = (id: string) =>
    decisions.find((d) => d.id === id)?.question || "A company decision";
  return (
    <Section
      title="Can we apply?"
      action={
        <>
          {items.length > 0 ? (
            <span className="pb-readiness pb-mr-8">
              <svg
                className={`pb-ring pb-ring--sm${sum.met === sum.total ? "" : " pb-ring--warn"}`}
                viewBox="0 0 36 36"
                style={ringStyle(sum.percent)}
                aria-hidden="true"
              >
                <circle className="pb-ring__track" cx="18" cy="18" r="15" />
                <circle className="pb-ring__value" cx="18" cy="18" r="15" />
              </svg>
              <span className="pb-small">
                <strong>
                  {sum.met} of {sum.total} conditions met
                </strong>
                {sum.waiting > 0 ? (
                  <span className="pb-muted">
                    {" "}
                    · {sum.waiting} wait on a decision
                  </span>
                ) : null}
              </span>
            </span>
          ) : null}
          <button
            className="pb-btn pb-btn--ghost pb-btn--sm"
            onClick={() => setAdding(!adding)}
          >
            <Icon name="plus" />
            Add
          </button>
        </>
      }
    >
      {items.length === 0 ? (
        <p className="pb-faint pb-small">
          No conditions yet. List who may apply and what the funder asks.
        </p>
      ) : (
        <table className="pb-table pb-table--compact">
          <thead>
            <tr>
              <th>Condition</th>
              <th>State</th>
              <th>Relies on</th>
              <th>Source, checked</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              const st = VOCABULARY.conditionState.find(
                (t) => t.value === c.state,
              );
              return (
                <tr key={c.id}>
                  <td>
                    {c.text}
                    <span className="pb-table__sub">
                      {CONDITION_KINDS.find(([value]) => value === c.kind)?.[1]}
                    </span>
                  </td>
                  <td>
                    <span className={`pb-tag pb-tag--${st?.tone}`}>
                      {st?.label}
                    </span>
                    <select
                      className="pb-select pb-select--inline pb-ml-6"
                      aria-label={`State of: ${c.text}`}
                      value={c.state}
                      onChange={(e) => {
                        const state = enumValue(
                          CONDITION_STATES,
                          e.target.value,
                        );
                        if (!state) return;
                        run.run((er) =>
                          onMark(c.id, state, new Date().toISOString(), er),
                        );
                      }}
                    >
                      {VOCABULARY.conditionState.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {c.decisionIds.map((id) => (
                      <span key={id} className="pb-row pb-gap-2">
                        <button
                          className="pb-ref pb-clickable"
                          onClick={() => onOpenDecision(id)}
                        >
                          <Icon name="decisions" />
                          <span>{question(id)}</span>
                        </button>
                        <button
                          className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                          aria-label={`Stop waiting on: ${question(id)}`}
                          onClick={() =>
                            run.run((er) =>
                              onDecisions(
                                c.id,
                                c.decisionIds.filter((d) => d !== id),
                                er,
                              ),
                            )
                          }
                        >
                          <Icon name="close" />
                        </button>
                      </span>
                    ))}
                    {decisions.some((d) => !c.decisionIds.includes(d.id)) ? (
                      <select
                        className="pb-select pb-select--inline"
                        aria-label={`Add a decision to: ${c.text}`}
                        value=""
                        onChange={(e) =>
                          e.target.value
                            ? run.run((er) =>
                                onDecisions(
                                  c.id,
                                  [...c.decisionIds, e.target.value],
                                  er,
                                ),
                              )
                            : undefined
                        }
                      >
                        <option value="">Add a decision</option>
                        {decisions
                          .filter((d) => !c.decisionIds.includes(d.id))
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.question || "A company decision"}
                            </option>
                          ))}
                      </select>
                    ) : null}
                    {c.factNotes.map((n) => (
                      <VaultNoteChip key={n.id} note={n} />
                    ))}
                    {c.decisionIds.length + c.factNotes.length === 0 ? (
                      <span className="pb-faint">None</span>
                    ) : null}
                  </td>
                  <td className="pb-small pb-muted">
                    {c.source}
                    <span className="pb-table__sub">
                      checked {day(c.checkedAt)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                      aria-label={`Remove condition: ${c.text}`}
                      onClick={() => run.run((er) => onRemove(c.id, er))}
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
      <ErrorLine message={run.error} />
      {adding ? (
        <div className="pb-row pb-wrap pb-mt-8">
          <select
            className="pb-select pb-select--inline"
            aria-label="Kind of condition"
            value={kind}
            onChange={(e) =>
              setKind(enumValue(KIND_VALUES, e.target.value) ?? kind)
            }
          >
            {CONDITION_KINDS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <input
            className="pb-input pb-flex-1 pb-minw-220"
            placeholder="What the funder requires"
            aria-label="Condition"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            className="pb-input pb-minw-200"
            placeholder="Where it says so"
            aria-label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          <select
            className="pb-select pb-select--inline"
            aria-label="Waits on decision"
            value={decisionId}
            onChange={(e) => setDecisionId(e.target.value)}
          >
            <option value="">Waits on no decision</option>
            {decisions
              .filter((d) => d.open)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.question || "A company decision"}
                </option>
              ))}
          </select>
          <button
            className="pb-btn pb-btn--sm"
            disabled={!text.trim() || !source.trim()}
            onClick={() =>
              run.run(
                (er) => {
                  onAdd(
                    {
                      id: generateId(),
                      kind,
                      text: text.trim(),
                      state: decisionId ? "WAITING_ON_DECISION" : "UNKNOWN",
                      decisionIds: decisionId ? [decisionId] : [],
                      source: source.trim(),
                      checkedAt: new Date().toISOString(),
                    },
                    er,
                  );
                },
                () => {
                  setText("");
                  setSource("");
                  setDecisionId("");
                },
              )
            }
          >
            Add condition
          </button>
        </div>
      ) : null}
    </Section>
  );
}
