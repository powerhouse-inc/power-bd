import { generateId } from "document-model";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import {
  actions,
  isBdSettingsDocument,
  type BdSettingsAction,
} from "document-models/bd-settings";
import { useMemo, useState, type ReactNode } from "react";
import { AccessSection } from "../../components/access/AccessSection.js";
import { Icon } from "../../components/Icon.js";
import { dispatchWith, type OnErrors } from "../../components/shared/useRun.js";
import {
  ADDRESS_FORMAT,
  initials,
  isAddress,
  parseWholeNumber,
  runtimeTimeZones,
} from "../../kit/settings/settings.js";
import { CommitField } from "./CommitField.js";
import { VaultField } from "./VaultField.js";
import "../../kit/design.js";
import { useRecordById } from "../../components/data/driveData.js";
import { useToday } from "../../components/shared/useToday.js";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { METRICS, quarterLabel, quartersFrom, targetsOf } from "../../kit/targets/index.js";

type Errors = Record<string, string | undefined>;

/** The settings page: team, time zone and three rules. Shown in the Settings place and in the thin editor. */
export function SettingsDetail({
  documentId,
  children,
}: {
  documentId: string;
  /** Further sections, shown after the rules (the Settings place adds the set-up guide's). */
  children?: ReactNode;
}) {
  const [document, dispatch] = useRecordById(documentId, isBdSettingsDocument);
  const [errors, setErrors] = useState<Errors>({});
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const today = useToday();
  const [targetQuarter, setTargetQuarter] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string>();
  const [renameDraft, setRenameDraft] = useState("");
  const zones = useMemo(() => runtimeTimeZones(), []);
  if (!document || !dispatch) return null;
  const state = document.state.global;

  const fail = (key: string, message: string | undefined) =>
    setErrors((e) => ({ ...e, [key]: message }));
  /** Sends one action; the reducer's message shows beside the control `key`. */
  const send = (key: string, action: BdSettingsAction, onDone?: () => void) => {
    fail(key, undefined);
    const onErrors: OnErrors = (rejected) =>
      fail(key, rejected[0]?.message ?? "That change was refused.");
    onErrors.onDone = onDone;
    dispatchWith(dispatch, action, onErrors);
  };

  const add = () => {
    if (!isAddress(address))
      return fail("add", ADDRESS_FORMAT);
    send(
      "add",
      actions.addTeamMember({
        id: generateId(),
        name: name.trim(),
        address: address.trim(),
      }),
      () => {
        setName("");
        setAddress("");
      },
    );
  };
  const timeZone = state.timeZone ?? "";
  const zoneOptions =
    timeZone && !zones.includes(timeZone) ? [timeZone, ...zones] : zones;
  const number = (
    key: string,
    text: string,
    make: (n: number) => BdSettingsAction,
  ) => {
    const n = parseWholeNumber(text);
    if (n === undefined) return fail(key, "Enter a whole number.");
    send(key, make(n));
  };

  return (
    <div className="pb-page">
      <div className="pb-page__head">
        <span className="pb-page__icon pb-page__icon--purple">
          <Icon name="settings" />
        </span>
        <h1 className="pb-page__title">Settings</h1>
      </div>

      <div className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">
            Team
            <span className="pb-count">
              {state.teamMembers.filter((m) => m.active).length}
            </span>
          </h2>
        </div>
        {state.teamMembers.length === 0 ? (
          <p className="pb-muted">
            No one is on the team yet. Add the first person below.
          </p>
        ) : (
          <div className="pb-list">
            {state.teamMembers.map((m) => (
              <div
                className={`pb-list__item${m.active ? "" : " pb-inactive"}`}
                key={m.id}
              >
                <span className="pb-list__lead">
                  <span className="pb-avatar pb-avatar--blue">
                    {initials(m.name)}
                  </span>
                </span>
                <div className="pb-list__main">
                  {renaming === m.id ? (
                    <input
                      className={`pb-input${errors[m.id] ? " is-invalid" : ""}`}
                      autoFocus
                      aria-label={`New name for ${m.name}`}
                      value={renameDraft}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setRenaming(undefined);
                        if (e.key === "Enter")
                          send(
                            m.id,
                            actions.updateTeamMember({
                              id: m.id,
                              name: renameDraft.trim(),
                            }),
                            () => setRenaming(undefined),
                          );
                      }}
                    />
                  ) : (
                    <span className="pb-list__title">{m.name}</span>
                  )}
                  <span className="pb-list__sub pb-mono">{m.address}</span>
                  {errors[m.id] && (
                    <span className="pb-field__error">{errors[m.id]}</span>
                  )}
                </div>
                <div className="pb-list__end">
                  {!m.active && (
                    <span className="pb-tag pb-tag--gray">Inactive</span>
                  )}
                  {renaming === m.id ? (
                    <>
                      <button
                        className="pb-btn pb-btn--sm"
                        onClick={() =>
                          send(
                            m.id,
                            actions.updateTeamMember({
                              id: m.id,
                              name: renameDraft.trim(),
                            }),
                            () => setRenaming(undefined),
                          )
                        }
                      >
                        Save name
                      </button>
                      <button
                        className="pb-btn pb-btn--ghost pb-btn--sm"
                        onClick={() => setRenaming(undefined)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="pb-btn pb-btn--ghost pb-btn--sm"
                      onClick={() => {
                        fail(m.id, undefined);
                        setRenameDraft(m.name);
                        setRenaming(m.id);
                      }}
                    >
                      Rename
                    </button>
                  )}
                  {m.active ? (
                    <button
                      className="pb-btn pb-btn--ghost pb-btn--sm"
                      onClick={() =>
                        send(m.id, actions.deactivateTeamMember({ id: m.id }))
                      }
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className="pb-btn pb-btn--sm"
                      onClick={() =>
                        send(m.id, actions.reactivateTeamMember({ id: m.id }))
                      }
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="pb-reassure">
          <Icon name="shield" />
          Deactivating keeps a person's name on everything they did. They just
          stop appearing when you choose an owner, and you can bring them back.
        </p>

        <div className="pb-grid-2 pb-mt-12">
          <label className="pb-field">
            <span className="pb-field__label">Name</span>
            <input
              className="pb-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mara Lind"
            />
          </label>
          <label className="pb-field">
            <span className="pb-field__label">Vault address</span>
            <input
              className={`pb-input pb-mono${errors.add ? " is-invalid" : ""}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x…"
              aria-invalid={errors.add ? true : undefined}
            />
          </label>
        </div>
        <ErrorLine message={errors.add} />
        <div className="pb-mt-8">
          <button className="pb-btn pb-btn--primary" onClick={add}>
            <Icon name="plus" />
            Add to the team
          </button>
        </div>
      </div>

      <div className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">Targets</h2>
          <select
            className="pb-select pb-select--inline"
            aria-label="Quarter"
            value={targetQuarter ?? quartersFrom(today, 1)[0]}
            onChange={(e) => setTargetQuarter(e.target.value)}
          >
            {quartersFrom(today, 4).map((q) => (
              <option key={q} value={q}>
                {quarterLabel(q)}
              </option>
            ))}
          </select>
        </div>
        <p className="pb-faint pb-small">
          What the team aims for in the quarter. The Overview sets this quarter's records against it. Leave a field empty for no target.
        </p>
        <div className="pb-grid-2">
          {METRICS.map((metric) => {
            const quarter = targetQuarter ?? quartersFrom(today, 1)[0];
            const target = targetsOf(state).find((t) => t.quarter === quarter && t.metric === metric);
            const key = `target-${metric}`;
            return (
              <label className="pb-field" key={`${quarter}-${metric}`}>
                <span className="pb-field__label">
                  {VOCABULARY.targetMetric.find((t) => t.value === metric)?.label}
                  {metric === "VALUE_PROPOSED" ? ", in the currency you quote in" : ""}
                </span>
                <input
                  className={`pb-input${errors[key] ? " is-invalid" : ""}`}
                  inputMode="decimal"
                  defaultValue={target ? String(target.value) : ""}
                  key={`${quarter}-${target?.value ?? ""}`}
                  onBlur={(e) => {
                    const text = e.target.value.trim();
                    if (text === "") {
                      if (target) send(key, actions.removeTarget({ id: target.id }));
                      return;
                    }
                    const value = Number(text.replace(",", "."));
                    if (!Number.isFinite(value)) return fail(key, "Enter a number.");
                    if (value !== target?.value)
                      send(key, actions.setTarget({ id: target?.id ?? generateId(), quarter, metric, value }));
                  }}
                />
                {errors[key] ? <span className="pb-field__error">{errors[key]}</span> : null}
              </label>
            );
          })}
        </div>
      </div>

      <div className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">Our time zone</h2>
        </div>
        <label className="pb-field">
          <span className="pb-field__label">Time zone</span>
          <select
            className={`pb-input${errors.timeZone ? " is-invalid" : ""}`}
            value={timeZone}
            onChange={(e) =>
              e.target.value &&
              send(
                "timeZone",
                actions.setTimeZone({ timeZone: e.target.value }),
              )
            }
          >
            {!timeZone && <option value="">Choose a time zone</option>}
            {zoneOptions.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          {errors.timeZone && (
            <span className="pb-field__error">{errors.timeZone}</span>
          )}
        </label>
        <p className="pb-reassure">
          <Icon name="shield" />
          Every funder's date and every meeting is shown in this time zone.
          Changing it changes how times read, never the moments themselves.
        </p>
      </div>

      <div className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">Rules</h2>
        </div>
        <CommitField
          label="Due window"
          suffix="days"
          inputMode="numeric"
          value={String(state.dueWindowDays)}
          error={errors.due}
          help="How far ahead something counts as coming up."
          onCommit={(v) =>
            number("due", v, (days) => actions.setDueWindow({ days }))
          }
        />
        <VaultField
          saved={state.vaultDriveId}
          error={errors.vault}
          onChoose={(driveId) =>
            send("vault", actions.setVaultDrive({ driveId }))
          }
        />
        <CommitField
          label="Keep personal data for"
          suffix="months"
          inputMode="numeric"
          value={String(state.retentionMonths)}
          error={errors.retention}
          help="After a relationship closes, the people linked only to it come up for deletion."
          onCommit={(v) =>
            number("retention", v, (months) => actions.setRetention({ months }))
          }
        />
        <p className="pb-reassure">
          <Icon name="shield" />
          Nothing is deleted automatically. When the period passes, the people
          due for deletion are listed for you to review.
        </p>
      </div>
      <AccessSection team={state.teamMembers} />
      {children}
    </div>
  );
}
