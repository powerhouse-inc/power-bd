import { generateId } from "document-model";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import {
  ErrorLine,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import type { Check } from "../../kit/funding/index.js";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import { Checks } from "./Checks.js";

/** Decide go or no-go: a people-only choice, with what must be known first. */
export function GoNoGo({
  checks,
  attemptsLeft,
  decidedBy,
  onDecide,
  onCancel,
}: {
  checks: readonly Check[];
  attemptsLeft: number | null;
  decidedBy: string;
  onDecide: (
    input: {
      id: string;
      decision: "GO" | "NO_GO";
      decidedBy: string;
      reason: string;
      attemptsLeft?: number;
      decidedAt: string;
    },
    onErrors: OnErrors,
  ) => void;
  onCancel: () => void;
}) {
  const [choice, setChoice] = useState<"GO" | "NO_GO">("GO");
  const [reason, setReason] = useState("");
  const run = useRun();
  return (
    <div
      className="pb-dialog pb-mt-8 pb-mb-14"
      role="group"
      aria-label="Decide go or no-go"
    >
      <div className="pb-dialog__head">
        <Icon
          name="people-only"
          className="pb-icon pb-icon--lg pb-icon--muted"
        />
        Decide go or no-go
      </div>
      <div className="pb-dialog__body">
        <Checks checks={checks} />
        <div className="pb-segmented pb-justify-start">
          <button
            type="button"
            className={`pb-segmented__item${choice === "GO" ? " is-active" : ""}`}
            onClick={() => setChoice("GO")}
          >
            <Icon name="check" />
            Go
          </button>
          <button
            type="button"
            className={`pb-segmented__item${choice === "NO_GO" ? " is-active" : ""}`}
            onClick={() => setChoice("NO_GO")}
          >
            <Icon name="close" />
            No-go
          </button>
        </div>
        <label className="pb-field">
          <span className="pb-field__label">Why</span>
          <textarea
            className="pb-textarea pb-minh-64"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <ErrorLine message={run.error} />
        <p className="pb-reassure">
          <Icon name="shield" />
          Only you can decide. The agent can't. Your decision is signed with
          your name.
        </p>
      </div>
      <div className="pb-dialog__foot">
        <button className="pb-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="pb-btn pb-btn--primary"
          disabled={!reason.trim() || !decidedBy}
          title={decidedBy ? undefined : "Sign in to decide: only a person can"}
          onClick={() =>
            run.run((e) =>
              onDecide(
                {
                  id: generateId(),
                  decision: choice,
                  decidedBy,
                  reason: reason.trim(),
                  attemptsLeft: attemptsLeft ?? undefined,
                  decidedAt: new Date().toISOString(),
                },
                e,
              ),
            )
          }
        >
          <PeopleMark />
          Decide: {choice === "GO" ? "Go" : "No-go"}
        </button>
      </div>
    </div>
  );
}
