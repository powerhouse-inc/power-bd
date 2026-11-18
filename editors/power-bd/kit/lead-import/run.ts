import type { LeadState } from "document-models/lead";
import { mergedNotes, type PlannedRow } from "./plan.js";

/** What to change on an organisation: a new one's profile, notes (already merged), a contact person. */
export type OrganisationChange = {
  profile: { name: string; website: string | null } | null;
  notes: string | null;
  person: { id: string; name: string; role: string | null; email: string | null; phone: string | null } | null;
};

/** What to set on a new lead, in the order the lead's rules need: details and owner before the status. */
export type LeadChange = {
  name: string;
  kind: NonNullable<LeadState["kind"]> | null;
  organisationId: string | null;
  owner: string | null;
  status: LeadState["status"];
  nextStep: { id: string; text: string; owner: string | null; dueDate: string | null } | null;
  source: { source: NonNullable<LeadState["source"]>; detail: string | null } | null;
  contact: { id: string; contactId: string; personId: string; role: string | null } | null;
};

/** How the run reaches the drive; each call rejects with the record's reason when it is refused. */
export type ImportDeps = {
  newId: () => string;
  createOrganisation: (name: string) => Promise<string>;
  changeOrganisation: (id: string, change: OrganisationChange) => Promise<void>;
  createLead: (name: string) => Promise<string>;
  changeLead: (id: string, change: LeadChange) => Promise<void>;
};

export type RowResult =
  | { row: number; outcome: "created"; leadId: string; organisationId: string | null; organisationNew: boolean }
  | { row: number; outcome: "skipped"; why: string }
  | { row: number; outcome: "failed"; step: "organisation" | "lead"; message: string; leadId?: string; organisationId?: string };

const messageOf = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Imports the planned rows one at a time, in file order: the organisation
 * (created, or the existing one, or the one an earlier row created), then the
 * lead. A failure ends that row only and says which step failed and what was
 * already created. Notes are added to an organisation's notes, never replace
 * them, across every row that names it.
 */
export async function runImport(
  rows: readonly PlannedRow[],
  include: (row: PlannedRow) => boolean,
  deps: ImportDeps,
  onProgress: (done: number, total: number) => void = () => undefined,
): Promise<RowResult[]> {
  const chosen = rows.filter((r) => !r.blocked && include(r));
  const createdByRow = new Map<number, string>();
  const notesById = new Map<string, string | null>();
  const results: RowResult[] = [];
  for (const r of rows) {
    if (r.blocked) results.push({ row: r.row, outcome: "skipped", why: r.problems[0] ?? "Can't be imported" });
    else if (!include(r)) results.push({ row: r.row, outcome: "skipped", why: `Lead "${r.duplicateOf?.name ?? r.leadName}" already exists` });
  }
  let done = 0;
  onProgress(0, chosen.length);
  for (const r of chosen) {
    let organisationId: string | null = null;
    let organisationNew = false;
    const personId = r.person ? deps.newId() : null;
    try {
      const o = r.organisation;
      if (o) {
        if (o.kind === "existing") {
          organisationId = o.id;
          if (!notesById.has(o.id)) notesById.set(o.id, o.existingNotes);
        } else if (o.kind === "earlier") {
          const id = createdByRow.get(o.row);
          if (!id) throw new Error(`Its organisation, from row ${o.row}, wasn't created`);
          organisationId = id;
        } else {
          organisationId = await deps.createOrganisation(o.name);
          organisationNew = true;
          createdByRow.set(r.row, organisationId);
          notesById.set(organisationId, null);
        }
        const imported = o.notes;
        const notes = imported ? mergedNotes(notesById.get(organisationId) ?? null, imported) : null;
        if (notes !== null) notesById.set(organisationId, notes);
        if (o.kind === "new" || notes !== null || r.person) {
          await deps.changeOrganisation(organisationId, {
            profile: o.kind === "new" ? { name: o.name, website: o.website } : null,
            notes,
            person: r.person && personId ? { id: personId, ...r.person } : null,
          });
        }
      }
    } catch (e) {
      results.push({ row: r.row, outcome: "failed", step: "organisation", message: messageOf(e), ...(organisationId ? { organisationId } : {}) });
      onProgress(++done, chosen.length);
      continue;
    }
    let leadId: string | undefined;
    try {
      leadId = await deps.createLead(r.leadName);
      await deps.changeLead(leadId, {
        name: r.leadName,
        kind: r.kind,
        organisationId,
        owner: r.owner,
        status: r.status,
        nextStep: r.nextStep ? { id: deps.newId(), text: r.nextStep.text, owner: r.owner, dueDate: r.nextStep.dueDate } : null,
        source: r.source,
        contact: r.person && personId && organisationId ? { id: deps.newId(), contactId: organisationId, personId, role: r.person.role } : null,
      });
      results.push({ row: r.row, outcome: "created", leadId, organisationId, organisationNew });
    } catch (e) {
      results.push({ row: r.row, outcome: "failed", step: "lead", message: messageOf(e), ...(leadId ? { leadId } : {}), ...(organisationId ? { organisationId } : {}) });
    }
    onProgress(++done, chosen.length);
  }
  return results.sort((a, b) => a.row - b.row);
}
