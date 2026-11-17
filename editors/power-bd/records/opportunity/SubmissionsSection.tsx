import { useUser } from "@powerhousedao/reactor-browser";
import type {
  MarkSubmissionInput,
  RecordSubmissionOutcomeInput,
  SubmissionResult,
} from "document-models/opportunity";
import { generateId } from "document-model";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { PeopleMark } from "../../components/shared/PeopleMark.js";
import {
  ErrorLine,
  Section,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { enumValue } from "../../kit/enums.js";
import { SUBMISSION_RESULTS, type Check } from "../../kit/funding/index.js";
import { Checks } from "./Checks.js";

const day = (iso: string) => iso.slice(0, 10);
const RESULTS = VOCABULARY.submissionResult.map(
  (t) => [t.value, t.label, t.tone] as const,
);

export type Sub = {
  id: string;
  stepId?: string | null;
  submittedAt: string;
  where?: string | null;
  submittedBy: string;
  outcome?: {
    result: SubmissionResult;
    text?: string | null;
    receivedAt: string;
  } | null;
};

/** Submissions and their outcomes. Marking one records that a person submitted. */
export function SubmissionsSection({
  items,
  steps,
  checks,
  nameFor,
  onMark,
  onOutcome,
}: {
  items: readonly Sub[];
  steps: readonly { id: string; label: string }[];
  checks: readonly Check[];
  nameFor: (address: string) => string;
  onMark: (s: Omit<MarkSubmissionInput, "submittedBy">, e: OnErrors) => void;
  onOutcome: (o: RecordSubmissionOutcomeInput, e: OnErrors) => void;
}) {
  const run = useRun();
  const signedIn = Boolean(useUser()?.address);
  const [open, setOpen] = useState(false);
  const [stepId, setStepId] = useState("");
  const [where, setWhere] = useState("");
  const [subId, setSubId] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult>("PASSED");
  const [text, setText] = useState("");
  const stepLabel = (id?: string | null) =>
    steps.find((s) => s.id === id)?.label;
  return (
    <Section
      title="Submissions"
      count={items.length}
      action={
        <button className="pb-btn pb-btn--sm" onClick={() => setOpen(!open)}>
          <PeopleMark />
          Mark a submission
        </button>
      }
    >
      {open ? (
        <div
          className="pb-dialog pb-mt-8 pb-mb-14"
          role="group"
          aria-label="Mark a submission"
        >
          <div className="pb-dialog__body">
            <Checks checks={checks} />
            <select
              className="pb-select"
              aria-label="Which step"
              value={stepId}
              onChange={(e) => setStepId(e.target.value)}
            >
              <option value="">No particular step</option>
              {steps.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              className="pb-input"
              placeholder="Where you submitted, e.g. the funder's portal"
              aria-label="Where"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
            />
            <p className="pb-reassure">
              <Icon name="shield" />
              Power BD never submits. You submit on the funder's portal, then
              mark it here. The agent can't.
            </p>
          </div>
          <div className="pb-dialog__foot">
            <button className="pb-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className="pb-btn pb-btn--primary"
              disabled={!signedIn}
              title={
                signedIn
                  ? undefined
                  : "Sign in to mark a submission: only a person can"
              }
              onClick={() =>
                run.run(
                  (er) => {
                    onMark(
                      {
                        id: generateId(),
                        stepId: stepId || undefined,
                        submittedAt: new Date().toISOString(),
                        where: where.trim() || undefined,
                      },
                      er,
                    );
                  },
                  () => {
                    setWhere("");
                    setOpen(false);
                  },
                )
              }
            >
              <PeopleMark />
              I submitted this
            </button>
          </div>
        </div>
      ) : null}
      <ErrorLine message={run.error} />
      {items.length === 0 ? (
        <p className="pb-faint pb-small">Nothing submitted yet.</p>
      ) : (
        <div className="pb-list">
          {items.map((s) => {
            const r = RESULTS.find(([v]) => v === s.outcome?.result);
            return (
              <div key={s.id}>
                <div className="pb-list__item">
                  <span className="pb-list__lead">
                    <Icon name="send" />
                  </span>
                  <div className="pb-list__main">
                    <span className="pb-list__title">
                      {stepLabel(s.stepId) ?? "Submission"}
                    </span>
                    <span className="pb-list__sub">
                      Submitted {day(s.submittedAt)} by {nameFor(s.submittedBy)}
                      {s.where ? ` on ${s.where}` : ""}
                      {s.outcome?.text ? ` · ${s.outcome.text}` : ""}
                    </span>
                  </div>
                  <div className="pb-list__end">
                    {r ? (
                      <>
                        <span className={`pb-tag pb-tag--${r[2]}`}>{r[1]}</span>
                        <span className="pb-faint pb-small">
                          {day(s.outcome!.receivedAt)}
                        </span>
                      </>
                    ) : (
                      <button
                        className="pb-btn pb-btn--sm"
                        onClick={() => setSubId(subId === s.id ? null : s.id)}
                      >
                        Record the result
                      </button>
                    )}
                  </div>
                </div>
                {subId === s.id && !r ? (
                  <div className="pb-row pb-wrap pb-mt-6 pb-mb-10">
                    <select
                      className="pb-select pb-select--inline"
                      aria-label="Result"
                      value={result}
                      onChange={(e) =>
                        setResult(
                          enumValue(SUBMISSION_RESULTS, e.target.value) ??
                            result,
                        )
                      }
                    >
                      {RESULTS.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <input
                      className="pb-input pb-flex-1"
                      placeholder="Conditions, or the reasons and comments"
                      aria-label="Result notes"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <button
                      className="pb-btn pb-btn--sm"
                      onClick={() =>
                        run.run(
                          (er) => {
                            onOutcome(
                              {
                                id: s.id,
                                result,
                                text: text.trim() || undefined,
                                receivedAt: new Date().toISOString(),
                              },
                              er,
                            );
                          },
                          () => {
                            setSubId(null);
                            setText("");
                          },
                        )
                      }
                    >
                      Save the result
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}
