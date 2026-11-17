import type { Wait } from "../../kit/proposal-list/index.js";
import { Icon } from "../Icon.js";

/** What a proposal waits on: the team's move reads strongest, an overdue answer as a red signal. */
export function WaitsOn({ wait, label }: { wait: Wait; label: string }) {
  if (wait.kind === "answer" && wait.overdue)
    return (
      <span className="pb-signal">
        <Icon name="hourglass" />
        {label}
      </span>
    );
  const whose =
    wait.kind === "nothing" ? "none" : wait.kind === "answer" ? "theirs" : "ours";
  return <span className={`pb-waits pb-waits--${whose}`}>{label}</span>;
}
