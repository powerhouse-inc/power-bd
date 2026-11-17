import type { Term } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";

/** A slipping reason as a signal: its icon, label and how long it has slipped. */
export function SlipSignal({ term, since }: { term: Term; since: string }) {
  return (
    <span
      className={`pb-signal${term.tone === "orange" ? " pb-signal--orange" : ""}`}
    >
      {term.icon ? <Icon name={term.icon} /> : null}
      {term.label}
      {since}
    </span>
  );
}
