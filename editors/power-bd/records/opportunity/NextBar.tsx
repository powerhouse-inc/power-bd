import { PeopleMark } from "../../components/shared/PeopleMark.js";
import type { Next } from "../../kit/funding/index.js";

/** The one thing to do now: what, why, and a button when there is one. */
export function NextBar({
  next,
  signedIn,
  questionFor,
  onOpenDecision,
  onDecide,
}: {
  next: Next;
  signedIn: boolean;
  /** The words for the decision a block waits on. */
  questionFor: (id?: string) => string;
  onOpenDecision: (id: string) => void;
  onDecide: () => void;
}) {
  if (next.kind === "none") return null;
  let what = "";
  let why = "";
  let button: React.ReactNode = null;
  if (next.kind === "blocked") {
    const decisionId = next.decisionId;
    what = decisionId
      ? `Get an answer to "${questionFor(decisionId)}"`
      : next.what;
    why = "This blocks the application. Lift the block when it is resolved.";
    if (decisionId)
      button = (
        <button
          className="pb-btn pb-btn--sm"
          onClick={() => onOpenDecision(decisionId)}
        >
          Open decision
        </button>
      );
  } else if (next.kind === "owner") {
    what = "Assign an owner";
    why = "Every opportunity past to evaluate needs someone who owns it";
  } else if (next.kind === "decide") {
    what = "Decide go or no-go";
    why = "Nothing is prepared until a person decides";
    button = (
      <button
        className="pb-btn pb-btn--primary pb-btn--sm"
        disabled={!signedIn}
        title={signedIn ? undefined : "Sign in to decide: only a person can"}
        onClick={onDecide}
      >
        <PeopleMark />
        Decide
      </button>
    );
  } else if (next.kind === "outcome") {
    what = "Record the funder's answer";
    why = "Use Record the result under Submissions";
  } else {
    what = next.what;
    why = next.why;
  }
  return (
    <div
      className={`pb-next pb-mb-14${next.kind === "blocked" ? " pb-next--blocked" : ""}`}
    >
      <span className="pb-next__label">Next</span>
      <div className="pb-next__main">
        <span className="pb-next__what">{what}</span>
        <span className="pb-next__why">{why}</span>
      </div>
      {button}
    </div>
  );
}
