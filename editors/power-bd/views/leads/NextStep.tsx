import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import type { nextAction } from "../../kit/lead-view/index.js";
import { overdueText } from "../../kit/overview-view/index.js";
import { sinceText } from "../overview/display.js";
import { SlipSignal } from "../overview/SlipSignal.js";

type Next = ReturnType<typeof nextAction>;

/**
 * A lead's next action. In a table, an overdue step's day turns red with its
 * age, as in the Decisions table. On a card, where a row has no room for
 * that, the day stays plain and whole, and `NextStepSignal` says it is
 * overdue, as the Overview's cards do.
 */
export function NextStep({ next, inCard = false }: { next: Next; inCard?: boolean }) {
  return (
    <>
      {next.kind === "step" ? (
        <>
          {next.text}
          {next.dueDate ? (
            inCard ? (
              <span className="pb-card__date"> · {fmtDay(next.dueDate)}</span>
            ) : next.overdue ? (
              <span className="pb-relative is-overdue">
                {" "}
                · {fmtDay(next.dueDate)} · {overdueText(next.daysLate)}
              </span>
            ) : (
              <span className="pb-faint pb-small"> · {fmtDay(next.dueDate)}</span>
            )
          ) : null}
        </>
      ) : next.kind === "message" ? (
        "A message needs you"
      ) : next.kind === "none" ? (
        <span className="pb-faint">Closed</span>
      ) : (
        <span className="pb-faint">None yet</span>
      )}
    </>
  );
}

/** On a card: an overdue next step as the signal the Overview's cards show, "Next step overdue · 7 days". */
export function NextStepSignal({ next }: { next: Next }) {
  const term = VOCABULARY.slipping.find((t) => t.value === "NEXT_STEP_OVERDUE");
  if (next.kind !== "step" || !next.overdue || !next.dueDate || !term) return null;
  return (
    <div className="pb-card__end">
      <SlipSignal term={term} since={sinceText({ from: next.dueDate, days: next.daysLate })} />
    </div>
  );
}
