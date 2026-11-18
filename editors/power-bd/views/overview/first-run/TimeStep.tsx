import {
  actions,
  isBdSettingsDocument,
} from "document-models/bd-settings";
import { useMemo, useState } from "react";
import { Icon } from "../../../components/Icon.js";
import { ErrorLine } from "../../../components/shared/ErrorLine.js";
import { dispatchWith, useRun } from "../../../components/shared/useRun.js";
import { browserTimeZone } from "../../../kit/first-run/index.js";
import {
  parseWholeNumber,
  runtimeTimeZones,
} from "../../../kit/settings/index.js";
import { useRecordById } from "../../../components/data/driveData.js";

/** The time zone this browser reports, if it reports one. */
function resolvedTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/** Step 2: the team's time zone, taken from the browser, and the due window. */
export function TimeStep({
  settingsId,
  onNext,
}: {
  settingsId: string;
  onNext: () => void;
}) {
  const [document, dispatch] = useRecordById(settingsId, isBdSettingsDocument);
  const zones = useMemo(() => runtimeTimeZones(), []);
  const guess = useMemo(
    () => browserTimeZone(resolvedTimeZone(), zones),
    [zones],
  );
  const [pickedZone, setPickedZone] = useState<string>();
  const [typedDays, setTypedDays] = useState<string>();
  const [daysError, setDaysError] = useState<string | null>(null);
  const zoneRun = useRun();
  const daysRun = useRun();
  if (!document) return null;
  const state = document.state.global;
  const saved = state.timeZone ?? "";
  const zone = pickedZone ?? (saved || guess);
  const days = typedDays ?? String(state.dueWindowDays);
  const options = zones.includes(zone) ? zones : [zone, ...zones];

  const confirm = () => {
    setDaysError(null);
    daysRun.clear();
    const n = parseWholeNumber(days);
    if (n === undefined) return setDaysError("Enter a whole number.");
    const saveDays = () =>
      n === state.dueWindowDays
        ? onNext()
        : daysRun.run(
            (onErrors) =>
              dispatchWith(
                dispatch,
                actions.setDueWindow({ days: n }),
                onErrors,
              ),
            onNext,
          );
    if (zone === saved) return saveDays();
    zoneRun.run(
      (onErrors) =>
        dispatchWith(
          dispatch,
          actions.setTimeZone({ timeZone: zone }),
          onErrors,
        ),
      saveDays,
    );
  };

  return (
    <div className="pb-guide__form">
      <div className="pb-guide__fields">
        <label className="pb-field">
          <span className="pb-field__label">Our time zone</span>
          <select
            className={`pb-input${zoneRun.error ? " is-invalid" : ""}`}
            value={zone}
            aria-invalid={zoneRun.error ? true : undefined}
            onChange={(e) => setPickedZone(e.target.value)}
          >
            {options.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <ErrorLine message={zoneRun.error} />
          <span className="pb-field__help">
            {saved || pickedZone
              ? "Zones are named by region and city, such as "
              : "Taken from this browser. Zones are named by region and city, such as "}
            <span className="pb-eg">Europe/Zurich</span>. Pick the city nearest
            to where the team works.
          </span>
        </label>
        <label className="pb-field">
          <span className="pb-field__label">Due window</span>
          <span className="pb-flex pb-flex--center pb-gap-8">
            <input
              className={`pb-input pb-maxw-160${daysError || daysRun.error ? " is-invalid" : ""}`}
              inputMode="numeric"
              value={days}
              aria-invalid={daysError || daysRun.error ? true : undefined}
              onChange={(e) => setTypedDays(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
            />
            <span className="pb-muted pb-small">days</span>
          </span>
          <ErrorLine message={daysError ?? daysRun.error} />
          <span className="pb-field__help">
            How far ahead something counts as coming up. Most teams keep{" "}
            <span className="pb-eg">14</span>; anything from 1 to 90 works.
          </span>
        </label>
      </div>
      <div className="pb-guide__actions">
        <button
          type="button"
          className="pb-btn pb-btn--primary"
          onClick={confirm}
        >
          <Icon name="check" />
          {saved ? "Save" : "Confirm"}
        </button>
      </div>
      <p className="pb-reassure">
        <Icon name="shield" />
        Changing the time zone later changes how times read, never the moments
        themselves. A funder's deadline stays the funder's deadline.
      </p>
    </div>
  );
}
