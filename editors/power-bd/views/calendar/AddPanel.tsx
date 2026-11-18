import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { useDriveWrite } from "../../components/data/driveData.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import type { Addable } from "../../kit/calendar/index.js";
import { addMeetingAction, addStepAction } from "./actions.js";

/**
 * Adding a next step or a meeting on a day, for an open lead or funding
 * opportunity, as its own page would add it. Escape or Cancel closes it and
 * nothing is added.
 */
export function AddPanel({
  day,
  zone,
  records,
  me,
  onClose,
}: {
  day: string;
  /** The team's time zone: a meeting's time is read in it. */
  zone: string;
  records: Addable[];
  /** The person adding: the step's owner, the meeting's team member. */
  me: string | null;
  onClose: () => void;
}) {
  const [what, setWhat] = useState<"step" | "meeting">("step");
  const [recordId, setRecordId] = useState("");
  const [text, setText] = useState("");
  const [time, setTime] = useState("10:00");
  const { dispatchTo } = useDriveWrite();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const record = records.find((r) => r.id === recordId);
  const ready = !!record && text.trim() !== "" && (what === "step" || /^\d\d:\d\d$/.test(time));
  const title = `Add on ${fmtDay(`${day}T00:00:00.000Z`)}`;

  const add = () => {
    if (!record || !ready) return;
    setBusy(true);
    setError(null);
    const action =
      what === "step"
        ? addStepAction(record, day, text.trim(), me)
        : addMeetingAction(record, day, time, zone, text.trim(), me);
    let refused = false;
    dispatchTo(action, record.id, (errors) => {
      refused = true;
      setError(errors.at(0)?.message ?? "That was not accepted.");
    })
      .then(() => {
        if (!refused) onClose();
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "That was not accepted."),
      )
      .finally(() => setBusy(false));
  };

  const group = (kind: Addable["kind"]) => records.filter((r) => r.kind === kind);
  return (
    <form
      className="pb-ask"
      role="dialog"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        onClose();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        add();
      }}
    >
      <div className="pb-ask__title">{title}</div>
      <div className="pb-segmented" role="group" aria-label="What to add">
        {(
          [
            ["step", "Next step", "checklist"],
            ["meeting", "Meeting", "meeting"],
          ] as const
        ).map(([value, label, icon]) => (
          <button
            key={value}
            type="button"
            className={`pb-segmented__item${what === value ? " is-active" : ""}`}
            aria-pressed={what === value}
            onClick={() => setWhat(value)}
          >
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </div>
      <label className="pb-field">
        <span className="pb-field__label">For</span>
        <select
          className="pb-select"
          value={recordId}
          autoFocus
          onChange={(e) => setRecordId(e.target.value)}
        >
          <option value="">Choose a lead or funding opportunity</option>
          {group("lead").length > 0 ? (
            <optgroup label="Leads">
              {group("lead").map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
          ) : null}
          {group("opportunity").length > 0 ? (
            <optgroup label="Funding">
              {group("opportunity").map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </label>
      <label className="pb-field">
        <span className="pb-field__label">
          {what === "step" ? "Next step" : "What it is about"}
        </span>
        <input
          className="pb-input"
          value={text}
          placeholder={what === "step" ? "Send the pilot outline" : "Kick-off call"}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {what === "meeting" ? (
        <label className="pb-field">
          <span className="pb-field__label">Time, {zone}</span>
          <input
            className="pb-input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      ) : null}
      {what === "meeting" ? (
        <p className="pb-reassure">
          <Icon name="shield" />
          Nothing is sent from Power BD: the meeting is recorded, no invitation goes out.
        </p>
      ) : null}
      <ErrorLine message={error} />
      <div className="pb-ask__foot">
        <button type="button" className="pb-btn pb-btn--sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="pb-btn pb-btn--primary pb-btn--sm"
          disabled={!ready || busy}
        >
          Add
        </button>
      </div>
    </form>
  );
}
