import { useState, type ReactNode } from "react";
import { Icon } from "../Icon.js";

/**
 * How a figure is worked out, closed until asked: the method stays one click
 * away, right where the question comes up, instead of competing with the numbers.
 */
export function Explain({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pb-explain">
      <button type="button" className="pb-disclosure" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="chevron-right" />
        {label}
      </button>
      {open ? <p className="pb-explain__text">{children}</p> : null}
    </div>
  );
}
