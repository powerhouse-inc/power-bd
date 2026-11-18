import { generateId } from "document-model";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { useDriveWrite } from "../../components/data/driveData.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useCreateRecord } from "../../components/shared/useCreateRecord.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { useContactDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import {
  IMPORT_FIELDS,
  guessMapping,
  leadActionsFor,
  organisationActions,
  parseCsv,
  planImport,
  runImport,
  type ImportField,
  type PlannedRow,
  type RowResult,
} from "../../kit/lead-import/index.js";

type Phase = "source" | "map" | "check" | "running" | "done";
const STEPS: { phase: Phase; label: string }[] = [
  { phase: "source", label: "Paste or choose a file" },
  { phase: "map", label: "Match the columns" },
  { phase: "check", label: "Check the rows" },
  { phase: "done", label: "Import" },
];
const ORDER: Phase[] = ["source", "map", "check", "running", "done"];
const statusLabel = (v: string) => VOCABULARY.leadStatus.find((t) => t.value === v)?.label ?? v;

/** Where a planned row's organisation comes from, in words. */
function organisationText(r: PlannedRow): string {
  const o = r.organisation;
  if (!o) return "None";
  if (o.kind === "existing") return `Links to ${o.name}`;
  if (o.kind === "earlier") return `Same as row ${o.row}`;
  return `New: ${o.name}`;
}

/**
 * Importing leads and their organisations from a spreadsheet: paste or choose
 * a CSV, match its columns, check each row as it will be imported (what is
 * changed, what already exists), then import with progress and a result per
 * row. Nothing is created before Import.
 */
export function ImportLeads({ driveId, onClose, onOpen }: { driveId: string; onClose: () => void; onOpen: (id: string) => void }) {
  const contacts = useContactDocumentsInSelectedDrive() ?? [];
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const team = useTeam();
  const { dispatchTo } = useDriveWrite();
  const orgs = useCreateRecord(driveId, "Organisations", "powerbd/contact", "The organisation could not be created.");
  const leadRecords = useCreateRecord(driveId, "Leads", "powerbd/lead", "The lead could not be created.");
  const [phase, setPhase] = useState<Phase>("source");
  const [text, setText] = useState("");
  const [mapping, setMapping] = useState<ImportField[]>([]);
  const [anyway, setAnyway] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState<RowResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const table = parseCsv(text);
  const ready = table.headers.length > 0 && table.rows.length > 0;
  const plan = phase === "source" ? [] : planImport(table, mapping, {
    organisations: contacts.map((c) => ({ id: c.header.id, name: c.state.global.name ?? "", website: c.state.global.website, notes: c.state.global.notes })),
    leads: leads.map((l) => ({ id: l.header.id, name: l.state.global.name ?? "", organisationId: l.state.global.organisationId ?? null })),
    team: team.active.map((m) => ({ name: m.name, address: m.address })),
  });
  const include = (r: PlannedRow) => r.duplicateOf === null || anyway.has(r.row);
  const importable = plan.filter((r) => !r.blocked && include(r));
  const newOrgs = new Set(importable.filter((r) => r.organisation?.kind === "new").map((r) => r.row)).size;
  const linked = importable.filter((r) => r.organisation?.kind === "existing").length;

  const readFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    file.text().then(setText, () => setError("The file could not be read."));
  };
  const toMapping = () => {
    setMapping(guessMapping(table.headers));
    setPhase("map");
  };
  /** Sends actions to one record and rejects with the record's reason when one is refused. */
  const send = async (documentId: string, actions: Parameters<typeof dispatchTo>[0]) => {
    const outcome: { refused: string | null } = { refused: null };
    await dispatchTo(actions, documentId, (errors) => {
      outcome.refused = errors.at(0)?.message ?? "That was not accepted.";
    });
    if (outcome.refused !== null) throw new Error(outcome.refused);
  };
  const created = async (create: (name: string, o: { open: boolean }) => Promise<string | undefined>, name: string, failure: string) => {
    const id = await create(name, { open: false });
    if (!id) throw new Error(failure);
    return id;
  };
  const start = async () => {
    setPhase("running");
    setError(null);
    const out = await runImport(
      plan,
      include,
      {
        newId: generateId,
        createOrganisation: (name) => created(orgs.create, name, orgs.error ?? "The organisation could not be created."),
        changeOrganisation: (id, change) => send(id, organisationActions(change)),
        createLead: (name) => created(leadRecords.create, name, leadRecords.error ?? "The lead could not be created."),
        changeLead: (id, change) => send(id, leadActionsFor(change, new Date().toISOString())),
      },
      (done, total) => setProgress({ done, total }),
    );
    setResults(out);
    setPhase("done");
  };
  const reset = () => {
    setText("");
    setMapping([]);
    setAnyway(new Set());
    setResults([]);
    setPhase("source");
  };

  const at = ORDER.indexOf(phase);
  return (
    <section className="pb-import" aria-label="Import leads from a spreadsheet">
      <div className="pb-import__head">
        <h2 className="pb-import__title">Import leads from a spreadsheet</h2>
        <span className="pb-toolbar__spacer" />
        <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={onClose} disabled={phase === "running"}>
          <Icon name="close" />
          Close
        </button>
      </div>
      <ol className="pb-path">
        {STEPS.map((s) => {
          const i = ORDER.indexOf(s.phase);
          const done = i < at || phase === "done";
          return (
            <li key={s.phase} className={`pb-path__step${done ? " is-done" : i === at || (s.phase === "done" && phase === "running") ? " is-current" : ""}`}>
              <span className="pb-path__dot">{done ? <Icon name="check" /> : null}</span>
              {s.label}
            </li>
          );
        })}
      </ol>

      {phase === "source" ? (
        <>
          <label className="pb-field">
            <span className="pb-field__label">Choose a file</span>
            <input type="file" accept=".csv,text/csv,text/plain" onChange={(e) => readFile(e.target.files?.[0])} />
          </label>
          <label className="pb-field">
            <span className="pb-field__label">Or paste it</span>
            <textarea
              className="pb-textarea"
              rows={6}
              value={text}
              placeholder={"Company,Name,Role,Type,Status,Owner,Next step\nKelvar Institute,Ana Novak,CTO,Sales,In touch,Mara Lind,Send the pilot outline"}
              onChange={(e) => setText(e.target.value)}
            />
            <span className="pb-field__help">
              A CSV saved from Excel, Numbers or Google Sheets, commas or semicolons. The first row names the columns.
            </span>
          </label>
          <ErrorLine message={error} />
          {text.trim() !== "" && !ready ? <p className="pb-field__help">This needs a row of column names and at least one row under it.</p> : null}
          <div className="pb-import__foot">
            <button type="button" className="pb-btn pb-btn--primary pb-btn--sm" disabled={!ready} onClick={toMapping}>
              Match the columns
            </button>
            {ready ? <span className="pb-small pb-faint">{table.rows.length} rows, {table.headers.length} columns</span> : null}
          </div>
        </>
      ) : null}

      {phase === "map" ? (
        <>
          <div className="pb-table-wrap">
            <table className="pb-table">
              <thead>
                <tr><th>Column in the file</th><th>First value</th><th>Fills in</th></tr>
              </thead>
              <tbody>
                {table.headers.map((h, i) => (
                  <tr key={`${h}-${i}`}>
                    <td>{h || `Column ${i + 1}`}</td>
                    <td><span className="pb-import__example">{table.rows.find((r) => r[i]?.trim())?.[i] ?? ""}</span></td>
                    <td>
                      <select
                        className="pb-select pb-select--inline"
                        aria-label={`What ${h || `column ${i + 1}`} fills in`}
                        value={mapping[i] ?? "ignore"}
                        onChange={(e) => setMapping(mapping.map((m, j) => (j === i ? (e.target.value as ImportField) : m)))}
                      >
                        {IMPORT_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pb-field__help">An organisation or a lead name is needed for each row. Columns marked "Add to notes" go into the organisation's notes, after what is there.</p>
          <div className="pb-import__foot">
            <button type="button" className="pb-btn pb-btn--sm" onClick={() => setPhase("source")}>Back</button>
            <button
              type="button"
              className="pb-btn pb-btn--primary pb-btn--sm"
              disabled={!mapping.includes("organisation") && !mapping.includes("leadName")}
              onClick={() => setPhase("check")}
            >
              Check the rows
            </button>
          </div>
        </>
      ) : null}

      {phase === "check" ? (
        <>
          <p className="pb-small" aria-live="polite">
            {importable.length} of {plan.length} rows to import: {newOrgs} new organisations, {linked} linked to existing ones.
            {plan.some((r) => r.blocked) ? ` ${plan.filter((r) => r.blocked).length} can't be imported.` : ""}
            {plan.some((r) => r.duplicateOf && !anyway.has(r.row)) ? ` ${plan.filter((r) => r.duplicateOf && !anyway.has(r.row)).length} already exist and are skipped.` : ""}
          </p>
          <div className="pb-table-wrap">
            <table className="pb-table">
              <thead>
                <tr><th>Row</th><th>Lead</th><th>Organisation</th><th>Status</th><th>Owner</th><th>What changes</th></tr>
              </thead>
              <tbody>
                {plan.map((r) => (
                  <tr key={r.row} className={`pb-import__row${r.blocked || !include(r) ? " is-blocked" : ""}`}>
                    <td>{r.row}</td>
                    <td>{r.leadName || "–"}</td>
                    <td>{organisationText(r)}</td>
                    <td>{statusLabel(r.status)}</td>
                    <td>{r.owner ? team.ownerName(r.owner) : <span className="pb-faint">No owner</span>}</td>
                    <td>
                      {r.problems.length > 0 ? (
                        <ul className="pb-import__problems">{r.problems.map((p) => <li key={p}>{p}</li>)}</ul>
                      ) : null}
                      {r.duplicateOf ? (
                        <label className="pb-small">
                          <input
                            type="checkbox"
                            checked={anyway.has(r.row)}
                            onChange={(e) => {
                              const next = new Set(anyway);
                              if (e.target.checked) next.add(r.row);
                              else next.delete(r.row);
                              setAnyway(next);
                            }}
                          />{" "}
                          "{r.duplicateOf.name}" already exists: import anyway
                        </label>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pb-reassure">
            <Icon name="shield" />
            Nothing is created until you press Import. Existing organisations are linked, not changed, except that imported notes are added after theirs.
          </p>
          <div className="pb-import__foot">
            <button type="button" className="pb-btn pb-btn--sm" onClick={() => setPhase("map")}>Back</button>
            <button type="button" className="pb-btn pb-btn--primary pb-btn--sm" disabled={importable.length === 0} onClick={() => void start()}>
              Import {importable.length} {importable.length === 1 ? "lead" : "leads"}
            </button>
          </div>
        </>
      ) : null}

      {phase === "running" ? (
        <p className="pb-small" aria-live="polite">Importing {Math.min(progress.done + 1, progress.total)} of {progress.total}…</p>
      ) : null}

      {phase === "done" ? (
        <>
          <p className="pb-small" aria-live="polite">
            {results.filter((r) => r.outcome === "created").length} created, {results.filter((r) => r.outcome === "failed").length} failed, {results.filter((r) => r.outcome === "skipped").length} skipped.
          </p>
          <ul className="pb-stack pb-gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {results.map((r) => {
              const lead = plan.find((p) => p.row === r.row)?.leadName ?? "";
              return (
                <li key={r.row} className={`pb-import__result pb-import__result--${r.outcome}`}>
                  <Icon name={r.outcome === "created" ? "check-circle" : r.outcome === "failed" ? "alert-circle" : "info"} />
                  <span>
                    Row {r.row}:{" "}
                    {r.outcome === "created" ? (
                      <>
                        <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={() => onOpen(r.leadId)}>{lead}</button>
                        {r.organisationNew ? " with a new organisation" : r.organisationId ? " linked to its organisation" : ""}
                      </>
                    ) : r.outcome === "skipped" ? (
                      r.why
                    ) : (
                      `${r.step === "organisation" ? "the organisation" : "the lead"} failed: ${r.message}${r.organisationId ? " (its organisation exists)" : ""}${r.leadId ? " (the lead was created; open it to finish)" : ""}`
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="pb-import__foot">
            <button type="button" className="pb-btn pb-btn--sm" onClick={reset}>Import another file</button>
            <button type="button" className="pb-btn pb-btn--primary pb-btn--sm" onClick={onClose}>Done</button>
          </div>
        </>
      ) : null}
    </section>
  );
}
