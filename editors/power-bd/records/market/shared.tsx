import type { MarketAction } from "document-models/market";
import { useState } from "react";
import type { OnErrors } from "../../components/shared/relationship/common.js";

/** Sends one market action; the reducer's message goes to `onErrors`. */
export type Send = (action: MarketAction, onErrors: OnErrors) => void;

/** The parts of the market's map a peek can show. */
export type Selected = { kind: "player"; id: string } | { kind: "us" } | null;

/**
 * A number edited where it is shown: saved on leaving the field or on Enter,
 * cleared (not counted) when emptied. Escape puts the stored value back.
 */
export function NumberCell({
  label,
  value,
  integer,
  disabled,
  onCommit,
}: {
  label: string;
  value: number | null | undefined;
  integer?: boolean;
  disabled?: boolean;
  onCommit: (value: number | null) => void;
}) {
  const stored = value == null ? "" : String(value);
  const [edited, setEdited] = useState<string>();
  const [invalid, setInvalid] = useState(false);
  const draft = edited ?? stored;
  const commit = () => {
    const text = draft.trim().replace(/[\s,]/g, "");
    setEdited(undefined);
    if (text === stored) return setInvalid(false);
    if (text === "") return onCommit(null);
    const n = Number(text);
    const ok = Number.isFinite(n) && (!integer || Number.isInteger(n));
    setInvalid(!ok);
    if (ok) onCommit(n);
  };
  return (
    <input
      className={`pb-input pb-input--number${invalid ? " is-invalid" : ""}`}
      aria-label={label}
      aria-invalid={invalid || undefined}
      inputMode={integer ? "numeric" : "decimal"}
      placeholder="Not counted"
      value={draft}
      disabled={disabled}
      title={invalid ? (integer ? "A whole number" : "A number") : undefined}
      onChange={(e) => setEdited(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") setEdited(undefined);
      }}
    />
  );
}
