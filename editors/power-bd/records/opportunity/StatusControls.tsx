import type {
  OpportunityStatus,
  SetBlockedInput,
} from "document-models/opportunity";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import {
  ErrorLine,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { enumValue } from "../../kit/enums.js";
import { OPPORTUNITY_STATUSES } from "../../kit/funding/index.js";
import type { DecisionChoice } from "./types.js";

/**
 * What can be done to the status: move it on, decide go or no-go, mark or lift
 * a block. A closed opportunity shows its reason instead.
 */
export function StatusControls({
  status,
  statusReason,
  closed,
  moves,
  blocked,
  decisions,
  signedIn,
  canDecide,
  onDecide,
  onMove,
  onBlock,
  onLift,
}: {
  status: string;
  statusReason?: string | null;
  closed: boolean;
  moves: readonly string[];
  blocked: boolean;
  decisions: readonly DecisionChoice[];
  signedIn: boolean;
  /** True while the go or no-go form is not already open. */
  canDecide: boolean;
  onDecide: () => void;
  onMove: (
    to: OpportunityStatus,
    reason: string | undefined,
    e: OnErrors,
  ) => void;
  onBlock: (input: SetBlockedInput, e: OnErrors) => void;
  onLift: (e: OnErrors) => void;
}) {
  const [reason, setReason] = useState("");
  const [blockText, setBlockText] = useState("");
  const [blockDecision, setBlockDecision] = useState("");
  const move = useRun();
  const block = useRun();
  const deciderOk = status === "TO_EVALUATE" || status === "DECIDING";

  if (closed)
    return statusReason ? (
      <p className="pb-faint pb-small">Reason: {statusReason}</p>
    ) : null;

  return (
    <div className="pb-row pb-wrap pb-mb-14">
      {moves.length > 0 ? (
        <select
          className="pb-select pb-select--inline"
          aria-label="Move to"
          value=""
          onChange={(e) => {
            const to = enumValue(OPPORTUNITY_STATUSES, e.target.value);
            if (!to) return;
            move.run((er) => onMove(to, reason.trim() || undefined, er));
          }}
        >
          <option value="">Move to…</option>
          {moves.map((m) => (
            <option key={m} value={m}>
              {VOCABULARY.opportunityStatus.find((t) => t.value === m)?.label}
            </option>
          ))}
        </select>
      ) : null}
      {moves.length > 0 ? (
        <input
          className="pb-input pb-w-320"
          placeholder="Reason, needed for rejected and withdrawn"
          aria-label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      ) : null}
      {deciderOk && canDecide ? (
        <button
          className="pb-btn pb-btn--sm"
          disabled={!signedIn}
          title={signedIn ? undefined : "Sign in to decide: only a person can"}
          onClick={onDecide}
        >
          <PeopleMark />
          Decide go or no-go
        </button>
      ) : null}
      {status === "PREPARING" && !blocked ? (
        <>
          <input
            className="pb-input"
            placeholder="What blocks it?"
            aria-label="What blocks it"
            value={blockText}
            onChange={(e) => setBlockText(e.target.value)}
          />
          <select
            className="pb-select pb-select--inline"
            aria-label="Blocked by decision"
            value={blockDecision}
            onChange={(e) => setBlockDecision(e.target.value)}
          >
            <option value="">No decision</option>
            {decisions
              .filter((d) => d.open)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.question || "A company decision"}
                </option>
              ))}
          </select>
          <button
            className="pb-btn pb-btn--ghost pb-btn--sm"
            disabled={!blockText.trim() && !blockDecision}
            onClick={() =>
              block.run((er) =>
                onBlock(
                  {
                    text: blockText.trim() || undefined,
                    decisionId: blockDecision || undefined,
                  },
                  er,
                ),
              )
            }
          >
            <Icon name="flag" />
            Mark as blocked
          </button>
        </>
      ) : null}
      {blocked ? (
        <button
          className="pb-btn pb-btn--sm"
          onClick={() => block.run((er) => onLift(er))}
        >
          Lift the block
        </button>
      ) : null}
      <ErrorLine message={move.error ?? block.error} />
    </div>
  );
}
