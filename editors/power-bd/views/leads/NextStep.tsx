import { fmtDay } from "../../components/shared/relationship/common.js";
import type { nextAction } from "../../kit/lead-view/index.js";

export function NextStep({ next }: { next: ReturnType<typeof nextAction> }) {
  return (
    <>
      {next.kind === "step" ? (
        <>
          {next.text}
          {next.dueDate ? (
            <span className="pb-faint pb-small"> · {fmtDay(next.dueDate)}</span>
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
