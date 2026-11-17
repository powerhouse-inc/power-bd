import {
  enumValue,
  INTERACTION_KINDS,
  INTERACTION_STATUSES,
} from "../../../kit/enums.js";
import type { InteractionKind, InteractionStatus } from "document-models/lead";
import { ErrorLine } from "../ErrorLine.js";
import { zonedToInstant } from "../../../kit/funding/index.js";
import { useState } from "react";
import { generateId } from "document-model";
import { VOCABULARY } from "../../../../../design-system/vocabulary.js";
import { Icon } from "../../Icon.js";
import { fmtInstant, Section, useRun, type OnErrors } from "./common.js";
import { useBdSettingsDocumentsInSelectedDrive } from "../../useDriveDocuments.js";

export type InteractionItem = {
  id: string;
  kind: string;
  status: string;
  at?: string | null;
  timeZone?: string | null;
  summary?: string | null;
  notesSource?: { title: string } | null;
};

export type NewInteraction = {
  id: string;
  kind: InteractionKind;
  status: InteractionStatus;
  at?: string;
  timeZone?: string;
  summary?: string;
};

const term = (list: { value: string; label: string }[], v: string) =>
  list.find((t) => t.value === v)?.label ?? v;

export function InteractionsSection({
  items,
  onAdd,
  onRemove,
}: {
  items: readonly InteractionItem[];
  onAdd: (item: NewInteraction, onErrors: OnErrors) => void;
  onRemove: (id: string, onErrors: OnErrors) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<InteractionKind>("CALL");
  const [status, setStatus] = useState<InteractionStatus>("HELD");
  const [at, setAt] = useState("");
  const [summary, setSummary] = useState("");
  const { error, run } = useRun();
  const settings = useBdSettingsDocumentsInSelectedDrive()?.[0];
  /** The drive's time zone from its settings, else the browser's. */
  const zone =
    settings?.state.global.timeZone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;
  const sorted = [...items].sort((a, b) =>
    (b.at ?? "").localeCompare(a.at ?? ""),
  );
  return (
    <Section
      title="History"
      count={items.length}
      action={
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm"
          onClick={() => setAdding(!adding)}
        >
          <Icon name="plus" />
          Log
        </button>
      }
    >
      {adding ? (
        <div className="pb-row pb-mb-8">
          <select
            className="pb-select pb-select--inline"
            aria-label="Kind"
            value={kind}
            onChange={(e) =>
              setKind(enumValue(INTERACTION_KINDS, e.target.value) ?? kind)
            }
          >
            {VOCABULARY.interactionKind.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            className="pb-select pb-select--inline"
            aria-label="Status"
            value={status}
            onChange={(e) =>
              setStatus(
                enumValue(INTERACTION_STATUSES, e.target.value) ?? status,
              )
            }
          >
            {VOCABULARY.interactionStatus.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="pb-input"
            aria-label={`When, your time (${zone})`}
            title={`Your time (${zone})`}
            value={at}
            onChange={(e) => setAt(e.target.value)}
          />
          <input
            className="pb-input pb-flex-1 pb-minw-200"

            placeholder="What was said or decided?"
            aria-label="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <button
            className="pb-btn pb-btn--primary pb-btn--sm"
            onClick={() =>
              run((onErrors) => {
                let instant: string | undefined;
                try {
                  instant = at ? zonedToInstant(at, zone) : undefined;
                } catch {
                  onErrors([
                    new Error(
                      `The time zone ${zone} is not known. Check the settings.`,
                    ),
                  ]);
                  return;
                }
                onAdd(
                  {
                    id: generateId(),
                    kind,
                    status,
                    at: instant,
                    timeZone: at ? zone : undefined,
                    summary: summary.trim() || undefined,
                  },
                  onErrors,
                );
              })
            }
          >
            Save to history
          </button>
        </div>
      ) : null}
      <ErrorLine message={error} />
      {items.length === 0 ? (
        <p className="pb-faint pb-small">Nothing in the history yet.</p>
      ) : null}
      <div className="pb-timeline">
        {sorted.map((i) => (
          <div key={i.id} className="pb-timeline__item">
            <span className="pb-timeline__icon">
              <Icon
                name={
                  VOCABULARY.interactionKind.find((t) => t.value === i.kind)
                    ?.icon ?? "note"
                }
                className="pb-icon pb-icon--sm"
              />
            </span>
            <div className="pb-flex-1">
              <div className="pb-timeline__head">
                <span className="pb-timeline__title">
                  {term(VOCABULARY.interactionKind, i.kind)}
                </span>
                <span
                  className={`pb-tag pb-tag--${VOCABULARY.interactionStatus.find((t) => t.value === i.status)?.tone ?? "default"}`}
                >
                  {term(VOCABULARY.interactionStatus, i.status)}
                </span>
                {i.at ? (
                  <span className="pb-timeline__time">
                    {fmtInstant(i.at, i.timeZone)}
                  </span>
                ) : null}
              </div>
              {i.summary ? (
                <div className="pb-timeline__body">{i.summary}</div>
              ) : null}
            </div>
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
              aria-label="Remove from history"
              onClick={() => run((onErrors) => onRemove(i.id, onErrors))}
            >
              <Icon name="trash" />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}
