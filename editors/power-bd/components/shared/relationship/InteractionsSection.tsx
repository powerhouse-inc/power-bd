import {
  enumValue,
  INTERACTION_KINDS,
  INTERACTION_STATUSES,
} from "../../../kit/enums.js";
import type { InteractionKind, InteractionStatus } from "document-models/lead";
import { ErrorLine } from "../ErrorLine.js";
import { zonedToInstant } from "../../../kit/funding/index.js";
import { localTime } from "../../../kit/overview/time.js";
import { useNow } from "../useNow.js";
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

/** What changes on an entry: its status (a meeting held or cancelled), when, and what was said. */
export type InteractionChange = {
  id: string;
  status: InteractionStatus;
  at: string | null;
  timeZone: string | null;
  summary: string | null;
};

export function InteractionsSection({
  items,
  onAdd,
  onRemove,
  onUpdate,
  onBrief,
}: {
  items: readonly InteractionItem[];
  onAdd: (item: NewInteraction, onErrors: OnErrors) => void;
  onRemove: (id: string, onErrors: OnErrors) => void;
  /** Records how a meeting went, or corrects an entry. */
  onUpdate?: (change: InteractionChange, onErrors: OnErrors) => void;
  /** Opens the brief for a scheduled meeting; without it there is no Brief button. */
  onBrief?: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<InteractionKind>("CALL");
  const [status, setStatus] = useState<InteractionStatus>("HELD");
  const [at, setAt] = useState("");
  const [summary, setSummary] = useState("");
  const [editing, setEditing] = useState<string>();
  const [editStatus, setEditStatus] = useState<InteractionStatus>("HELD");
  const [editAt, setEditAt] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const now = useNow();
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
              }, () => {
                setAt("");
                setSummary("");
                setAdding(false);
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
        {sorted.map((i) => {
          const passed = i.status === "SCHEDULED" && !!i.at && i.at < now;
          const startEdit = () => {
            setEditing(i.id);
            setEditStatus(
              passed ? "HELD" : (enumValue(INTERACTION_STATUSES, i.status) ?? "HELD"),
            );
            if (i.at) {
              const wall = localTime(i.at, zone);
              setEditAt(`${wall.day}T${wall.time}`);
            } else setEditAt("");
            setEditSummary(i.summary ?? "");
          };
          return editing === i.id ? (
          <div key={i.id} className="pb-timeline__item">
            <div className="pb-flex-1 pb-stack pb-gap-6">
              <div className="pb-row pb-gap-6">
                <select
                  className="pb-select pb-select--inline"
                  aria-label="Status"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(
                      enumValue(INTERACTION_STATUSES, e.target.value) ?? editStatus,
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
                  className="pb-input pb-input--auto"
                  type="datetime-local"
                  aria-label={`When, your time (${zone})`}
                  value={editAt}
                  onChange={(e) => setEditAt(e.target.value)}
                />
              </div>
              <input
                className="pb-input"
                aria-label="Summary"
                placeholder="How it went, in a line"
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
              />
              <div className="pb-row pb-gap-6">
                <button
                  className="pb-btn pb-btn--primary pb-btn--sm"
                  onClick={() =>
                    run((onErrors) => {
                      let instant: string | null = null;
                      try {
                        instant = editAt ? zonedToInstant(editAt, zone) : null;
                      } catch {
                        onErrors([
                          new Error(
                            `The time zone ${zone} is not known. Check the settings.`,
                          ),
                        ]);
                        return;
                      }
                      onUpdate?.(
                        {
                          id: i.id,
                          status: editStatus,
                          at: instant,
                          timeZone: instant ? (i.timeZone ?? zone) : null,
                          summary: editSummary.trim() || null,
                        },
                        onErrors,
                      );
                    }, () => setEditing(undefined))
                  }
                >
                  Save
                </button>
                <button
                  className="pb-btn pb-btn--ghost pb-btn--sm"
                  onClick={() => setEditing(undefined)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
          ) : (
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
            {onBrief && i.status === "SCHEDULED" && !passed ? (
              <button className="pb-btn pb-btn--ghost pb-btn--sm" onClick={() => onBrief(i.id)}>
                <Icon name="note" />
                Brief
              </button>
            ) : null}
            {onUpdate && passed ? (
              <button className="pb-btn pb-btn--sm" onClick={startEdit}>
                <Icon name="check" />
                Record how it went
              </button>
            ) : onUpdate ? (
              <button
                className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                aria-label="Edit this entry"
                onClick={startEdit}
              >
                <Icon name="edit" />
              </button>
            ) : null}
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
              aria-label="Remove from history"
              onClick={() => run((onErrors) => onRemove(i.id, onErrors))}
            >
              <Icon name="trash" />
            </button>
          </div>
          );
        })}
      </div>
    </Section>
  );
}
