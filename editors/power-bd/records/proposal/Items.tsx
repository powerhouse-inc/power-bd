import { createContext, useContext, useState, type ReactNode } from "react";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useRun, type OnErrors } from "../../components/shared/useRun.js";

export type Field = {
  key: string;
  label: string;
  kind: "text" | "area" | "select" | "check" | "date" | "number";
  options?: { value: string; label: string }[];
  /** Asked when adding, shown but not changed in the row. */
  fixed?: boolean;
  /** Needed to add. */
  required?: boolean;
  /** How much room a text takes: a code is short, a title on its own line fills it. */
  size?: "short" | "fill";
};
/** The check's findings by `list:id`, shown under the item they concern. */
export const FindingsContext = createContext<Map<string, string[]>>(new Map());

export type Row = { id: string } & Record<string, unknown>;

const str = (v: unknown) =>
  typeof v === "string" || typeof v === "number" ? String(v) : "";

export const dayOf = (iso: unknown) =>
  typeof iso === "string" ? iso.slice(0, 10) : "";
export const toIso = (day: string) =>
  day ? `${day}T00:00:00.000Z` : undefined;

/** Turns what a field holds into what the action takes. */
export function convert(f: Field, raw: unknown): unknown {
  if (f.kind === "check") return !!raw;
  const text = str(raw);
  if (f.kind === "date") return toIso(text);
  if (f.kind === "number") return text === "" ? undefined : Number(text);
  if (f.kind === "select") return text === "" ? undefined : text;
  return text;
}

/**
 * One input that saves when it loses focus. `onType` hears every keystroke:
 * a form to add a row uses it so its button reads what is typed, not only
 * what was left.
 */
export function Cell({
  field,
  value,
  disabled,
  onCommit,
  onType,
}: {
  field: Field;
  value: unknown;
  disabled?: boolean;
  onCommit: (raw: unknown) => void;
  onType?: (raw: string) => void;
}) {
  const label = field.label;
  if (field.kind === "check")
    return (
      <label className="pb-row pb-gap-6">
        <input
          type="checkbox"
          checked={!!value}
          disabled={disabled}
          onChange={(e) => onCommit(e.target.checked)}
        />
        <span className="pb-small">{label}</span>
      </label>
    );
  if (field.kind === "select")
    return (
      <select
        className="pb-select pb-input--auto"
        data-field={field.key}
        aria-label={label}
        disabled={disabled}
        value={str(value)}
        onChange={(e) => onCommit(e.target.value)}
      >
        <option value="">{label}…</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  const shown = field.kind === "date" ? dayOf(value) : str(value);
  const common = {
    "data-field": field.key,
    "aria-label": label,
    placeholder: label,
    disabled,
    defaultValue: shown,
    onChange: (e: { target: { value: string } }) => onType?.(e.target.value),
    onBlur: (e: { target: { value: string } }) =>
      e.target.value !== shown && onCommit(e.target.value),
  };
  return field.kind === "area" ? (
    <textarea key={shown} className="pb-textarea pb-cell--area" {...common} />
  ) : (
    <input
      key={shown}
      className={`pb-input ${
        field.kind !== "text"
          ? "pb-w-130"
          : field.size
            ? `pb-cell--${field.size}`
            : "pb-cell--text"
      }`}
      type={
        field.kind === "date"
          ? "date"
          : field.kind === "number"
            ? "number"
            : "text"
      }
      {...common}
    />
  );
}

/**
 * A list of rows with their fields, a way to add one, and a way to remove one.
 * `error` shows the reducer's message beside the list.
 */
export function Items<R extends Row>({
  title,
  items,
  fields,
  disabled,
  noun,
  onAdd,
  onUpdate,
  onRemove,
  extra,
  moves,
  heading,
  list,
}: {
  title?: string;
  items: readonly R[];
  fields: Field[];
  disabled: boolean;
  noun: string;
  onAdd?: (values: Record<string, unknown>, e: OnErrors) => void;
  onUpdate: (id: string, patch: Record<string, unknown>, e: OnErrors) => void;
  onRemove: (id: string, e: OnErrors) => void;
  extra?: (row: R) => ReactNode;
  moves?: (ids: string[], e: OnErrors) => void;
  heading?: (row: R) => ReactNode;
  /** The check's name for this list, to show findings beside its rows. */
  list?: string;
}) {
  const flags = useContext(FindingsContext);
  const run = useRun();
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  // What is typed in the add form, before it is left: the button reads it,
  // so a name typed and then "Add" clicked adds the row on the first click.
  const [typed, setTyped] = useState<Record<string, unknown>>({});
  const [formKey, setFormKey] = useState(0);
  const current = { ...draft, ...typed };
  const ready = fields.every(
    (f) => !f.required || str(current[f.key]).trim() !== "",
  );
  const move = (i: number, d: number) => {
    const ids = items.map((r) => r.id);
    const j = i + d;
    if (j < 0 || j >= ids.length || !moves) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    run.run((e) => moves(ids, e));
  };
  return (
    <div className="pb-stack" data-find={list ? `field:${list}` : undefined}>
      {title ? <h3 className="pb-overline">{title}</h3> : null}
      {items.length === 0 ? (
        <p className="pb-faint pb-small">None yet.</p>
      ) : null}
      <div className="pb-list">
        {items.map((row, i) => (
          <div
            key={row.id}
            className="pb-list__item pb-align-start"
            data-find={list ? `${list}:${row.id}` : undefined}
          >
            <div className="pb-list__main pb-grid pb-gap-6">
              {heading ? heading(row) : null}
              {(list ? (flags.get(`${list}:${row.id}`) ?? []) : []).map(
                (m, k) => (
                  <ErrorLine key={k} message={m} />
                ),
              )}
              <div className="pb-row">
                {fields
                  .filter((f) => !(f.fixed && f.kind === "check"))
                  .map((f) =>
                    f.fixed ? (
                      <span key={f.key} className="pb-tag pb-tag--outline">
                        {f.options?.find((o) => o.value === row[f.key])
                          ?.label ?? str(row[f.key])}
                      </span>
                    ) : (
                      <Cell
                        key={f.key}
                        field={f}
                        value={row[f.key]}
                        disabled={disabled}
                        onCommit={(raw) =>
                          run.run((e) =>
                            onUpdate(row.id, { [f.key]: convert(f, raw) }, e),
                          )
                        }
                      />
                    ),
                  )}
              </div>
              {extra ? extra(row) : null}
            </div>
            <div className="pb-list__end">
              {moves ? (
                <>
                  <button
                    className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                    aria-label={`Move this ${noun} up`}
                    disabled={disabled || i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <span className="pb-flip">
                      <Icon name="chevron-down" />
                    </span>
                  </button>
                  <button
                    className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                    aria-label={`Move this ${noun} down`}
                    disabled={disabled || i === items.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <Icon name="chevron-down" />
                  </button>
                </>
              ) : null}
              <button
                className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                aria-label={`Remove this ${noun}`}
                disabled={disabled}
                onClick={() => run.run((e) => onRemove(row.id, e))}
              >
                <Icon name="trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {onAdd ? (
        <div className="pb-row">
          {fields.map((f) => (
            <Cell
              key={`${f.key}-${formKey}`}
              field={f}
              value={draft[f.key]}
              disabled={disabled}
              onCommit={(raw) => setDraft((d) => ({ ...d, [f.key]: raw }))}
              onType={(raw) => setTyped((t) => ({ ...t, [f.key]: raw }))}
            />
          ))}
          <button
            className="pb-btn pb-btn--sm"
            disabled={disabled || !ready}
            onClick={() =>
              run.run(
                (e) =>
                  onAdd(
                    Object.fromEntries(
                      fields.map((f) => [f.key, convert(f, current[f.key])]),
                    ),
                    e,
                  ),
                // Cleared once the row is added; a refused one keeps what was typed.
                () => {
                  setDraft({});
                  setTyped({});
                  setFormKey((k) => k + 1);
                },
              )
            }
          >
            <Icon name="plus" />
            Add {noun}
          </button>
        </div>
      ) : null}
      <ErrorLine message={run.error} />
    </div>
  );
}
