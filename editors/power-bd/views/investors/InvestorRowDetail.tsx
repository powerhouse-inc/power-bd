import { useState } from "react";
import type { InvestorRow } from "document-models/investor-list";
import { Icon } from "../../components/Icon.js";
import { VaultNotes } from "../../components/shared/VaultNotes.js";

export interface RowEdits {
  name: string;
  website: string;
  sourceList: string;
}

/** The open row: thesis note, comparables and the row's own details. Engaged rows are final. */
export function InvestorRowDetail({
  row,
  error,
  onSave,
  onThesis,
  onLink,
  onUnlink,
  onRemove,
}: {
  row: InvestorRow;
  error?: string;
  onSave: (edits: RowEdits) => void;
  onThesis: (
    note: { id: string; title: string } | null,
    done: () => void,
  ) => void;
  onLink: (note: { id: string; title: string }, done: () => void) => void;
  onUnlink: (id: string) => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const final = row.state === "ENGAGED";
  const [name, setName] = useState(row.name);
  const [website, setWebsite] = useState(row.website ?? "");
  const [sourceList, setSourceList] = useState(row.sourceList ?? "");
  return (
    <div className="pb-grid pb-gap-14 pb-p-compact">
      <div className="pb-row pb-row--end">
        <label className="pb-field pb-flex-2 pb-minw-180">
          <span className="pb-field__label">Investor</span>
          <input
            className="pb-input"
            value={name}
            disabled={final}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="pb-field pb-flex-2 pb-minw-160">
          <span className="pb-field__label">Website</span>
          <input
            className="pb-input"
            value={website}
            disabled={final}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
        <label className="pb-field pb-flex-2 pb-minw-160">
          <span className="pb-field__label">List it came from</span>
          <input
            className="pb-input"
            value={sourceList}
            disabled={final}
            onChange={(e) => setSourceList(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="pb-btn pb-btn--sm"
          disabled={final || name.trim() === ""}
          onClick={() =>
            onSave({
              name: name.trim(),
              website: website.trim(),
              sourceList: sourceList.trim(),
            })
          }
        >
          Save details
        </button>
      </div>
      <VaultNotes
        label="Thesis note"
        notes={row.thesisNote ? [row.thesisNote] : []}
        disabled={final}
        onAdd={(n, done) => onThesis(n, done)}
        onRemove={() => onThesis(null, () => {})}
      />
      <VaultNotes
        label="Funded comparables"
        notes={row.comparables}
        disabled={final}
        onAdd={onLink}
        onRemove={onUnlink}
      />
      {!final &&
        (confirming ? (
          <div className="pb-row">
            <p className="pb-reassure pb-flex-1 pb-minw-240">
              <Icon name="shield" />
              Removing takes {row.name} off this list. Nothing else changes.
            </p>
            <button
              type="button"
              className="pb-btn pb-btn--sm pb-btn--danger"
              onClick={onRemove}
            >
              Yes, remove
            </button>
            <button
              type="button"
              className="pb-btn pb-btn--ghost pb-btn--sm"
              onClick={() => setConfirming(false)}
            >
              Keep it
            </button>
          </div>
        ) : (
          <div className="pb-row">
            <button
              type="button"
              className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--danger"
              onClick={() => setConfirming(true)}
            >
              Remove from list
            </button>
          </div>
        ))}
      {final && (
        <p className="pb-reassure">
          <Icon name="info" />
          This investor is engaged. The row stays as the record of where the
          lead came from.
        </p>
      )}
      {error && (
        <span className="pb-field__error" role="alert">
          <Icon name="alert-circle" />
          {error}
        </span>
      )}
    </div>
  );
}
