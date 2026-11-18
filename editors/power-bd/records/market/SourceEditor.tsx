import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { VaultNotePicker } from "../../components/vault/VaultNotePicker.js";
import type { SourceLike } from "../../kit/market/index.js";

/**
 * Where a number comes from: a title, and a web page, a vault note or both.
 * Save sets it, Clear removes it, Cancel leaves it as it was.
 */
export function SourceEditor({
  what,
  source,
  busy,
  onSave,
  onClear,
  onCancel,
}: {
  /** What the number is, for the labels: "number of organisations in Group finance". */
  what: string;
  source: SourceLike | null | undefined;
  busy?: boolean;
  onSave: (source: { title: string; url: string | null; documentId: string | null }) => void;
  onClear: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(source?.title ?? "");
  const [url, setUrl] = useState(source?.url ?? "");
  const [note, setNote] = useState<{ id: string; title: string } | null>(
    source?.documentId ? { id: source.documentId, title: source.title } : null,
  );
  const ready = title.trim() !== "" && (url.trim() !== "" || note !== null);
  return (
    <div
      className="pb-stack pb-gap-2"
      role="group"
      aria-label={`Source of the ${what}`}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div className="pb-grid-2">
        <label className="pb-field">
          <span className="pb-field__label">Source</span>
          <input
            className="pb-input"
            autoFocus
            placeholder="Companies registry, 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="pb-field">
          <span className="pb-field__label">Link</span>
          <input
            className="pb-input"
            type="url"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
      </div>
      {note ? (
        <p className="pb-small">
          <Icon name="note" /> Vault note: {note.title}{" "}
          <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={() => setNote(null)}>
            Unlink
          </button>
        </p>
      ) : (
        <VaultNotePicker
          label="Vault note"
          linked={[]}
          onPick={(n, clear) => {
            setNote(n);
            if (!title.trim()) setTitle(n.title);
            clear();
          }}
        />
      )}
      <div className="pb-flex pb-gap-8">
        <button
          type="button"
          className="pb-btn pb-btn--primary pb-btn--sm"
          disabled={!ready || busy}
          onClick={() =>
            onSave({ title: title.trim(), url: url.trim() || null, documentId: note?.id ?? null })
          }
        >
          Save source
        </button>
        {source ? (
          <button type="button" className="pb-btn pb-btn--sm" disabled={busy} onClick={onClear}>
            Clear
          </button>
        ) : null}
        <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
