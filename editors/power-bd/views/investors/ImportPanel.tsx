import { useState } from "react";
import { generateId } from "document-model";
import { Icon } from "../../components/Icon.js";
import {
  parseImport,
  type ImportRow,
  type SkippedLine,
} from "../../kit/investors/import.js";

/** Paste lines of "name, website, list it came from"; one batch goes to `onImport`. */
export function ImportPanel({
  onImport,
  onClose,
  error,
}: {
  onImport: (rows: ImportRow[]) => void;
  onClose: () => void;
  error?: string;
}) {
  const [text, setText] = useState("");
  const [skipped, setSkipped] = useState<SkippedLine[]>([]);
  const preview = parseImport(text, generateId);
  const run = () => {
    setSkipped(preview.skipped);
    if (preview.rows.length > 0) onImport(preview.rows);
  };
  return (
    <div className="pb-callout pb-grid pb-gap-10 pb-my-10">
      <div className="pb-field">
        <label className="pb-field__label" htmlFor="investor-import">
          Paste investors, one per line
        </label>
        <textarea
          id="investor-import"
          className="pb-textarea"
          rows={6}
          placeholder={
            "Velden Capital, velden.example, Regional investor map 2026\nArbor Nine Ventures, arbornine.example, Regional investor map 2026"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <span className="pb-field__help">
          Name, website, then the list it came from. The website and the list
          are optional.
        </span>
      </div>
      {text.trim() !== "" && (
        <span className="pb-field__help" aria-live="polite">
          {preview.rows.length} to add
          {preview.skipped.length > 0 &&
            `, ${preview.skipped.length} skipped (no name, or already in this paste)`}
        </span>
      )}
      {skipped.length > 0 && (
        <ul className="pb-field__help pb-list-tight">
          {skipped.map((s) => (
            <li key={s.line}>
              Line {s.line}: {s.text}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <span className="pb-field__error" role="alert">
          <Icon name="alert-circle" />
          {error}
        </span>
      )}
      <div className="pb-row">
        <button
          type="button"
          className="pb-btn pb-btn--primary"
          disabled={preview.rows.length === 0}
          onClick={run}
        >
          <Icon name="plus" />
          Add {preview.rows.length || ""} investors
        </button>
        <button
          type="button"
          className="pb-btn pb-btn--ghost"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <p className="pb-reassure">
        <Icon name="shield" />
        Nobody is contacted. Lines without a name are skipped and listed here.
      </p>
    </div>
  );
}
