import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import type {
  FindingRow,
  FindingTarget,
} from "../../kit/proposal-view/index.js";

/**
 * What the check found, in both views: a count that opens into the list, each
 * finding a way to the tab and item it concerns.
 */
export function Findings({
  rows,
  headline,
  gateMessage,
  startOpen,
  onGo,
}: {
  rows: FindingRow[];
  headline: string;
  gateMessage: string | null;
  startOpen: boolean;
  onGo: (target: FindingTarget) => void;
}) {
  const [open, setOpen] = useState(startOpen);
  if (rows.length > 0)
    return (
      <details
        className="pb-findings"
        open={open}
        onToggle={(e) => setOpen(e.currentTarget.open)}
      >
        <summary className="pb-findings__head">
          <Icon name="alert" />
          {headline}
          <span className="pb-findings__toggle">
            {open ? "Hide" : "Show"}
            <Icon name="chevron-down" />
          </span>
        </summary>
        <ul className="pb-findings__list">
          {rows.map((row, i) => {
            const target = row.target;
            return (
              <li key={i}>
                {target ? (
                  <button className="pb-finding" onClick={() => onGo(target)}>
                    <span className="pb-finding__text">{row.sentence}</span>
                    <span className="pb-finding__where">
                      Fix in {row.where}
                      <Icon name="chevron-down" />
                    </span>
                  </button>
                ) : (
                  <div className="pb-finding">
                    <span className="pb-finding__text">{row.sentence}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </details>
    );
  if (gateMessage)
    return (
      <div className="pb-callout pb-callout--orange">
        <Icon name="alert" />
        <div className="pb-callout__body">
          <div className="pb-callout__text">{gateMessage}.</div>
        </div>
      </div>
    );
  return (
    <div className="pb-callout pb-callout--green">
      <Icon name="check-circle" />
      <div className="pb-callout__body">
        <div className="pb-callout__text">Nothing left to fix.</div>
      </div>
    </div>
  );
}
