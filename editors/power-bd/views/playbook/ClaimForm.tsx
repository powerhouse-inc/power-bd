import type { NeverClaim } from "./types.js";
import { useState } from "react";
import { parsePhrases, phrasesToText } from "../../kit/playbook/playbook.js";

export function ClaimForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: NeverClaim;
  submitLabel: string;
  onSubmit: (
    v: { claim: string; reason: string; phrases: string[] },
    done: () => void,
  ) => void;
  onCancel?: () => void;
}) {
  const [claim, setClaim] = useState(initial?.claim ?? "");
  const [reason, setReason] = useState(initial?.reason ?? "");
  const [phrases, setPhrases] = useState(phrasesToText(initial?.phrases ?? []));
  return (
    <div className="pb-field">
      <input
        className="pb-input"
        placeholder="The claim we must never make"
        aria-label="Claim"
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
      />
      <textarea
        className="pb-textarea"
        placeholder="Why we must not make it"
        aria-label="Why we must not make it"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <textarea
        className="pb-textarea"
        placeholder="Phrases that would make it, one per line"
        aria-label="Phrases that would make it"
        value={phrases}
        onChange={(e) => setPhrases(e.target.value)}
      />
      <div className="pb-row">
        <button
          type="button"
          className="pb-btn pb-btn--primary pb-btn--sm"
          disabled={!claim.trim()}
          onClick={() => {
            onSubmit(
              {
                claim: claim.trim(),
                reason: reason.trim(),
                phrases: parsePhrases(phrases),
              },
              () => {
                if (!initial) {
                  setClaim("");
                  setReason("");
                  setPhrases("");
                }
              },
            );
          }}
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="pb-btn pb-btn--ghost pb-btn--sm"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
