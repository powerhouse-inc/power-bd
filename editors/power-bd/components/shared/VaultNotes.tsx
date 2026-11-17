import type { VaultNote } from "../../kit/vault/index.js";
import { Icon } from "../Icon.js";
import { VaultNoteRow } from "../vault/VaultNoteLink.js";
import { VaultNotePicker } from "../vault/VaultNotePicker.js";

export type { VaultNote };

/**
 * Notes in the vault, each a link with its cached title. A note shows the
 * vault's title today and opens in the vault app (`VaultNoteRow`); one that
 * can't be read keeps its cached title and says why. A note is added by
 * searching the vault named in Settings, or by typing its id and title when
 * search can't run (`VaultNotePicker`). The refreshed title is never written
 * back: `onAdd` gets the title the note has when it is picked. `error` is the
 * reducer's message and shows beside the picker.
 */
export function VaultNotes({
  label,
  notes,
  onAdd,
  onRemove,
  error,
  disabled,
}: {
  label: string;
  notes: readonly VaultNote[];
  /** Call `done` once the note was applied; a handler that takes no `done` gets the form cleared at once. */
  onAdd: (note: VaultNote, done: () => void) => void;
  onRemove: (id: string) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <div className="pb-field">
      <span className="pb-field__label">{label}</span>
      {notes.length > 0 && (
        <div className="pb-list">
          {notes.map((n) => (
            <VaultNoteRow
              key={n.id}
              note={n}
              end={
                <button
                  type="button"
                  className="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm"
                  aria-label={`Remove ${n.title}`}
                  disabled={disabled}
                  onClick={() => onRemove(n.id)}
                >
                  <Icon name="close" />
                </button>
              }
            />
          ))}
        </div>
      )}
      <VaultNotePicker
        label={label}
        linked={notes.map((n) => n.id)}
        disabled={disabled}
        onPick={(note, clear) => {
          onAdd(note, clear);
          if (onAdd.length < 2) clear();
        }}
      />
      {error && (
        <span className="pb-field__error" role="alert">
          <Icon name="alert-circle" />
          {error}
        </span>
      )}
    </div>
  );
}
