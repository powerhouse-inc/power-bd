import { useState } from "react";
import { enumValue, REFERENCE_KIND_VALUES } from "../../../kit/enums.js";
import type { ReferenceKind } from "document-models/lead";
import { ErrorLine } from "../ErrorLine.js";
import { generateId } from "document-model";
import { Icon } from "../../Icon.js";
import { VaultNoteChip } from "../../vault/VaultNoteLink.js";
import { VaultNotePicker } from "../../vault/VaultNotePicker.js";
import { Section, useRun, type OnErrors } from "./common.js";

export type ReferenceItem = {
  id: string;
  kind: string;
  documentId: string;
  title: string;
};

/** Labels for the kinds of linked note; the design system has no list for them. */
export const REFERENCE_KINDS: { value: ReferenceKind; label: string }[] = [
  { value: "RESEARCH", label: "Research" },
  { value: "NOTE", label: "Note" },
  { value: "SOURCE", label: "Source" },
  { value: "COMPARABLE", label: "Comparable" },
  { value: "OPPORTUNITY", label: "Funding opportunity" },
  { value: "LEAD", label: "Lead" },
  { value: "DECISION", label: "Decision" },
  { value: "OTHER", label: "Other" },
];

export function ReferencesSection({
  items,
  onAdd,
  onRemove,
}: {
  items: readonly ReferenceItem[];
  onAdd: (
    ref: { id: string; kind: ReferenceKind; documentId: string; title: string },
    onErrors: OnErrors,
  ) => void;
  onRemove: (id: string, onErrors: OnErrors) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<ReferenceKind>("NOTE");
  const { error, run } = useRun();
  return (
    <Section
      title="Linked notes"
      count={items.length}
      action={
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm"
          onClick={() => setAdding(!adding)}
        >
          <Icon name="plus" />
          Link a note
        </button>
      }
    >
      {adding ? (
        <div className="pb-row pb-align-start pb-mb-8">
          <select
            className="pb-select pb-select--inline"
            aria-label="Kind of note"
            value={kind}
            onChange={(e) =>
              setKind(enumValue(REFERENCE_KIND_VALUES, e.target.value) ?? kind)
            }
          >
            {REFERENCE_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <div className="pb-flex-1 pb-minw-240">
            <VaultNotePicker
              label="Linked notes"
              linked={items.map((r) => r.documentId)}
              onPick={(note, clear) =>
                run(
                  (onErrors) =>
                    onAdd(
                      {
                        id: generateId(),
                        kind,
                        documentId: note.id,
                        title: note.title,
                      },
                      onErrors,
                    ),
                  clear,
                )
              }
            />
          </div>
        </div>
      ) : null}
      <ErrorLine message={error} />
      {items.length === 0 ? (
        <p className="pb-faint pb-small">No notes linked yet.</p>
      ) : null}
      <div className="pb-row">
        {items.map((r) => (
          <VaultNoteChip
            key={r.id}
            note={{ id: r.documentId, title: r.title }}
            kind={
              REFERENCE_KINDS.find((k) => k.value === r.kind)?.label ?? r.kind
            }
          >
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
              aria-label={`Unlink ${r.title}`}
              onClick={() => run((onErrors) => onRemove(r.id, onErrors))}
            >
              <Icon name="close" />
            </button>
          </VaultNoteChip>
        ))}
      </div>
    </Section>
  );
}
