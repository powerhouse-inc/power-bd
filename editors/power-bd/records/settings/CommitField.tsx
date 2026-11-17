import { useState } from "react";

/** A labelled input that saves where it is edited: on leaving it, or on Enter. */
export function CommitField({
  label,
  value,
  onCommit,
  error,
  help,
  suffix,
  inputMode,
  mono,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  error?: string;
  help?: string;
  suffix?: string;
  inputMode?: "numeric";
  mono?: boolean;
}) {
  const [edited, setEdited] = useState<string>();
  const draft = edited ?? value;
  const commit = () => {
    if (draft.trim() !== value) onCommit(draft.trim());
    setEdited(undefined);
  };
  return (
    <label className="pb-field">
      <span className="pb-field__label">{label}</span>
      <span className="pb-flex pb-flex--center pb-gap-8">
        <input
          className={`pb-input${error ? " is-invalid" : ""}${mono ? " pb-mono" : ""}${suffix ? " pb-maxw-160" : ""}`}
          value={draft}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          onChange={(e) => setEdited(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setEdited(undefined);
          }}
        />
        {suffix && <span className="pb-muted pb-small">{suffix}</span>}
      </span>
      {help && !error && <span className="pb-field__help">{help}</span>}
      {error && <span className="pb-field__error">{error}</span>}
    </label>
  );
}
