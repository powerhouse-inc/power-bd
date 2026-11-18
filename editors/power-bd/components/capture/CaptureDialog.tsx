import { useUser } from "@powerhousedao/reactor-browser";
import { useSetSelectedNode } from "../shared/useOpenRecord.js";
import { generateId } from "document-model";
import { actions as leadActions } from "document-models/lead";
import { actions as opportunityActions } from "document-models/opportunity";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { useDriveWrite } from "../data/driveData.js";
import { Icon } from "../Icon.js";
import { ErrorLine } from "../shared/ErrorLine.js";
import { useNow } from "../shared/useNow.js";
import {
  useBdSettingsDocumentsInSelectedDrive,
  useLeadDocumentsInSelectedDrive,
  useOpportunityDocumentsInSelectedDrive,
} from "../useDriveDocuments.js";
import {
  CAPTURE_KINDS,
  captureCandidates,
  captureInputs,
  captureMissing,
  captureNow,
  captureRecords,
  type CaptureForm,
  type CaptureRecord,
} from "../../kit/capture/index.js";

const record = <S,>(d: { header: { id: string; lastModifiedAtUtcIso: string }; state: { global: S } }) => ({
  id: d.header.id,
  changedAt: d.header.lastModifiedAtUtcIso,
  state: d.state.global,
});

/**
 * Logging what just happened, from anywhere and on a phone: on which lead or
 * funding opportunity, what it was, when (now unless changed), one line of
 * what happened, and the next step if there is one. Saved as a held entry in
 * its history and a next step, as the record page adds them.
 */
export function CaptureDialog({ onClose }: { onClose: () => void }) {
  const me = useUser()?.address ?? null;
  const open = useSetSelectedNode();
  const { dispatchTo } = useDriveWrite();
  const settings = useBdSettingsDocumentsInSelectedDrive()?.[0];
  const zone = settings?.state.global.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = captureNow(useNow(), zone);
  const records = captureRecords({
    leads: (useLeadDocumentsInSelectedDrive() ?? []).map(record),
    opportunities: (useOpportunityDocumentsInSelectedDrive() ?? []).map(record),
  });
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CaptureForm>({ recordId: null, kind: "MEETING", day: now.day, time: now.time, what: "", nextStep: "", nextDay: "", outcome: null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logged, setLogged] = useState<{ record: CaptureRecord; step: boolean } | null>(null);
  const set = (patch: Partial<CaptureForm>) => setForm((f) => ({ ...f, ...patch }));
  const picked = records.find((r) => r.id === form.recordId);
  const missing = captureMissing(form);

  const save = () => {
    if (!picked || missing.length > 0 || busy) return;
    const { interaction, step, outcome } = captureInputs(form, zone, me, { interaction: generateId(), step: generateId() });
    const made =
      picked.kind === "lead"
        ? [
            leadActions.addInteraction(interaction),
            ...(outcome ? [leadActions.setInteractionOutcome(outcome)] : []),
            ...(step ? [leadActions.addNextStep(step)] : []),
          ]
        : [
            opportunityActions.addInteraction(interaction),
            ...(outcome ? [opportunityActions.setInteractionOutcome(outcome)] : []),
            ...(step ? [opportunityActions.addNextStep(step)] : []),
          ];
    setBusy(true);
    setError(null);
    let refused = false;
    dispatchTo(made, picked.id, (errors) => {
      refused = true;
      setError(errors.at(0)?.message ?? "That was not saved.");
    })
      .then(() => {
        if (!refused) setLogged({ record: picked, step: !!step });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "That was not saved."))
      .finally(() => setBusy(false));
  };

  const again = () => {
    setLogged(null);
    setQuery("");
    setForm({ recordId: null, kind: "MEETING", day: now.day, time: now.time, what: "", nextStep: "", nextDay: "", outcome: null });
  };

  return (
    <div className="pb-backdrop pb-backdrop--sheet" onClick={onClose}>
      <div
        className="pb-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Log what happened"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="pb-dialog__head">
          <Icon name="history" />
          Log what happened
        </div>
        {logged ? (
          <>
            <div className="pb-dialog__body">
              <p className="pb-reassure" role="status">
                <Icon name="check" />
                Logged on {logged.record.name}
                {logged.step ? ", with its next step." : "."}
              </p>
            </div>
            <div className="pb-dialog__foot">
              <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={again}>
                Log another
              </button>
              <button
                type="button"
                className="pb-btn pb-btn--sm"
                onClick={() => {
                  open(logged.record.id);
                  onClose();
                }}
              >
                Open {logged.record.kind === "lead" ? "the lead" : "the opportunity"}
              </button>
              <button type="button" className="pb-btn pb-btn--primary pb-btn--sm" autoFocus onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="pb-dialog__body">
              <div className="pb-field">
                <span className="pb-field__label">On</span>
                {picked ? (
                  <button type="button" className="pb-capture__pick is-active" onClick={() => set({ recordId: null })}>
                    <Icon name={picked.kind === "lead" ? "leads" : "funding"} />
                    {picked.name}
                    <span className="pb-capture__pick-kind">Change</span>
                  </button>
                ) : (
                  <>
                    <input
                      className="pb-input"
                      autoFocus
                      aria-label="Find a lead or funding opportunity"
                      placeholder="Find a lead or funding opportunity"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="pb-capture__picks" role="listbox" aria-label="Leads and funding opportunities">
                      {captureCandidates(records, me, query).map((r) => (
                        <button
                          type="button"
                          role="option"
                          aria-selected={false}
                          key={r.id}
                          className="pb-capture__pick"
                          onClick={() => set({ recordId: r.id })}
                        >
                          <Icon name={r.kind === "lead" ? "leads" : "funding"} />
                          {r.name}
                          <span className="pb-capture__pick-kind">{r.kind === "lead" ? "Lead" : "Funding"}</span>
                        </button>
                      ))}
                      {records.length === 0 ? <p className="pb-capture__wait">No open lead or funding opportunity yet.</p> : null}
                    </div>
                  </>
                )}
              </div>
              <div className="pb-segmented" role="group" aria-label="What it was">
                {CAPTURE_KINDS.map((k) => {
                  const term = VOCABULARY.interactionKind.find((t) => t.value === k);
                  return (
                    <button
                      type="button"
                      key={k}
                      className={`pb-segmented__item${form.kind === k ? " is-active" : ""}`}
                      aria-pressed={form.kind === k}
                      onClick={() => set({ kind: k })}
                    >
                      {term?.icon ? <Icon name={term.icon} /> : null}
                      {term?.label}
                    </button>
                  );
                })}
              </div>
              <div className="pb-segmented" role="group" aria-label="How did it go?">
                {VOCABULARY.interactionOutcome.map((o) => (
                  <button
                    type="button"
                    key={o.value}
                    className={`pb-segmented__item${form.outcome === o.value ? " is-active" : ""}`}
                    aria-pressed={form.outcome === o.value}
                    onClick={() => set({ outcome: form.outcome === o.value ? null : (o.value as CaptureForm["outcome"]) })}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="pb-capture__row">
                <label className="pb-field">
                  <span className="pb-field__label">Day</span>
                  <input className="pb-input" type="date" value={form.day} onChange={(e) => set({ day: e.target.value })} />
                </label>
                <label className="pb-field">
                  <span className="pb-field__label">Time, {zone}</span>
                  <input className="pb-input" type="time" value={form.time} onChange={(e) => set({ time: e.target.value })} />
                </label>
              </div>
              <label className="pb-field">
                <span className="pb-field__label">What happened</span>
                <input className="pb-input" placeholder="They want a pilot in January" value={form.what} onChange={(e) => set({ what: e.target.value })} />
              </label>
              <div className="pb-capture__row">
                <label className="pb-field">
                  <span className="pb-field__label">Next step, if any</span>
                  <input className="pb-input" placeholder="Send the pilot outline" value={form.nextStep} onChange={(e) => set({ nextStep: e.target.value })} />
                </label>
                <label className="pb-field">
                  <span className="pb-field__label">By</span>
                  <input className="pb-input" type="date" value={form.nextDay} onChange={(e) => set({ nextDay: e.target.value })} />
                </label>
              </div>
              {missing.length > 0 ? <p className="pb-capture__wait">{missing[0]}.</p> : null}
              <ErrorLine message={error} />
            </div>
            <div className="pb-dialog__foot">
              <p className="pb-reassure">
                <Icon name="shield" />
                Nothing is sent from Power BD: this only records it.
              </p>
              <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="pb-btn pb-btn--primary pb-btn--sm" disabled={missing.length > 0 || busy}>
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
