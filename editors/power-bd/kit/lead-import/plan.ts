import type { LeadState } from "document-models/lead";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import type { CsvTable } from "./csv.js";

type LeadKind = NonNullable<LeadState["kind"]>;
type LeadStatus = LeadState["status"];
type LeadSource = NonNullable<LeadState["source"]>;

const SOURCE_WORDS: readonly [LeadSource, RegExp][] = [
  ["EVENT", /\b(event|week|conference|summit|expo|fair|meetup|forum|congress|webinar|festival)\b/],
  ["REFERRAL", /\b(referral|referred|introduction|introduced|intro)\b/],
  ["PARTNER", /\bpartner/],
  ["INBOUND", /\b(inbound|website|web form|contact form|newsletter|signup|sign up)\b/],
  ["OUTBOUND", /\b(outbound|cold|outreach|prospecting)\b/],
];

/**
 * Where a lead came from, read from a spreadsheet cell: a source's own name
 * ("Referral") is that source; otherwise words such as "week" or "conference"
 * point to an event, "referred" to a referral, and so on, and the cell is kept
 * as the detail ("HARBOUR WEEK 2026"). Anything else is Other, with the cell as
 * its detail.
 */
export function parseSource(text: string): { source: LeadSource; detail: string | null } {
  const t = text.trim();
  const named = VOCABULARY.leadSource.find((s) => s.label.toLowerCase() === t.toLowerCase() || s.value === t.toUpperCase());
  if (named) return { source: named.value as LeadSource, detail: null };
  const lower = t.toLowerCase();
  const hit = SOURCE_WORDS.find(([, words]) => words.test(lower));
  return { source: hit ? hit[0] : "OTHER", detail: t };
}

/** What a column of the file fills in. */
export type ImportField =
  | "ignore"
  | "organisation"
  | "leadName"
  | "person"
  | "role"
  | "email"
  | "phone"
  | "website"
  | "kind"
  | "status"
  | "owner"
  | "nextStep"
  | "nextStepDue"
  | "source"
  | "notes";

/** The fields in the order the matching step lists them, with their labels. */
export const IMPORT_FIELDS: { value: ImportField; label: string }[] = [
  { value: "ignore", label: "Leave out" },
  { value: "organisation", label: "Organisation" },
  { value: "leadName", label: "Lead name" },
  { value: "person", label: "Contact person" },
  { value: "role", label: "Their role" },
  { value: "email", label: "Their email" },
  { value: "phone", label: "Their phone" },
  { value: "website", label: "Organisation website" },
  { value: "kind", label: "Kind of lead" },
  { value: "status", label: "Status" },
  { value: "owner", label: "Owner" },
  { value: "nextStep", label: "Next step" },
  { value: "nextStepDue", label: "Next step due" },
  { value: "source", label: "Where it came from" },
  { value: "notes", label: "Add to notes" },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const SYNONYMS: [ImportField, string[]][] = [
  ["organisation", ["company", "organisation", "organization", "org", "account", "firm"]],
  ["leadName", ["lead", "lead name", "deal", "opportunity", "title of lead"]],
  ["role", ["role", "position", "job title", "title"]],
  ["email", ["email", "e mail", "mail", "contact", "contact email"]],
  ["phone", ["phone", "telephone", "mobile", "tel"]],
  ["website", ["website", "web", "url", "domain", "site"]],
  ["kind", ["type", "kind", "lead type", "category"]],
  ["status", ["status", "stage"]],
  ["owner", ["owner", "assigned to", "responsible"]],
  ["nextStep", ["next step", "next action", "to do", "todo"]],
  ["nextStepDue", ["next step due", "due", "due date", "follow up date", "follow up"]],
  ["source", ["source", "lead source", "channel", "came from", "origin"]],
  ["notes", ["notes", "note", "comments", "comment", "meeting date"]],
];

/**
 * A field for each header, guessed from its words. "Name" is the contact
 * person when the file also has an organisation column (a list of people at
 * companies), and the organisation otherwise. Each field but "Add to notes"
 * is guessed for one column at most.
 */
export function guessMapping(headers: readonly string[]): ImportField[] {
  const hasOrganisation = headers.some((h) => SYNONYMS[0][1].includes(norm(h)));
  const taken = new Set<ImportField>();
  return headers.map((h) => {
    const n = norm(h);
    let field: ImportField = "ignore";
    if (n === "name" || n === "full name" || n === "contact name" || n === "person")
      field = hasOrganisation || n !== "name" ? "person" : "organisation";
    else field = SYNONYMS.find(([, words]) => words.includes(n))?.[0] ?? "ignore";
    if (field !== "notes" && field !== "ignore") {
      if (taken.has(field)) return "ignore";
      taken.add(field);
    }
    return field;
  });
}

/** What the run needs to know about the drive. */
export type ImportContext = {
  organisations: readonly { id: string; name: string; website?: string | null; notes?: string | null }[];
  leads: readonly { id: string; name: string; organisationId: string | null }[];
  team: readonly { name: string; address: string }[];
};

export type PlannedOrganisation =
  | { kind: "new"; name: string; website: string | null; notes: string | null }
  | { kind: "existing"; id: string; name: string; notes: string | null; existingNotes: string | null }
  | { kind: "earlier"; row: number; name: string; notes: string | null };

/** One row of the file, as it will be imported, with what is wrong or changed. */
export type PlannedRow = {
  /** The row's number in the file, counting the header as row 1. */
  row: number;
  leadName: string;
  organisation: PlannedOrganisation | null;
  person: { name: string; role: string | null; email: string | null; phone: string | null } | null;
  kind: LeadKind | null;
  status: LeadStatus;
  owner: string | null;
  nextStep: { text: string; dueDate: string | null } | null;
  /** Where it came from, read from the file's words. */
  source: { source: LeadSource; detail: string | null } | null;
  /** What was changed or left out, said for the person checking. */
  problems: string[];
  /** True when the row can't be imported at all. */
  blocked: boolean;
  /** An existing lead with the same name for the same organisation: skipped unless the person says otherwise. */
  duplicateOf: { id: string; name: string } | null;
};

const LEGAL = /\b(d o o|doo|ltd|limited|gmbh|inc|llc|s r l|srl|ag|sa|bv|plc|oy|ab|as)\b/g;
/** An organisation's name as compared: lower case, without punctuation or legal forms. */
export const sameName = (s: string) => norm(s).replace(LEGAL, " ").replace(/\s+/g, " ").trim();
/** A website as compared: its host, without "www.". */
export function hostOf(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const raw = url.trim().includes("://") ? url.trim() : `https://${url.trim()}`;
  try {
    return new URL(raw).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

const fromLabel = <V extends string>(list: readonly { value: string; label: string }[], text: string): V | null => {
  const t = norm(text);
  if (!t) return null;
  const hit = list.find((x) => norm(x.label) === t || norm(x.value) === t);
  return hit ? (hit.value as V) : null;
};

/** A day from "2026-11-20", "20.11.2026" or "20/11/2026"; null when it isn't one. */
export function parseDay(text: string): string | null {
  const t = text.trim();
  let y: number, m: number, d: number;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  const eu = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(t);
  if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else if (eu) [d, m, y] = [Number(eu[1]), Number(eu[2]), Number(eu[3])];
  else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
    ? date.toISOString().slice(0, 10)
    : null;
}

const ACTIVE: LeadStatus[] = ["IN_TOUCH", "MEETING_SET", "MET", "PROPOSAL"];
const nullIfEmpty = (s: string | undefined) => (s?.trim() ? s.trim() : null);

/**
 * Each row of the file as it will be imported. Organisations are matched to
 * existing ones by name (ignoring case, punctuation and legal forms) or by
 * website, and to earlier rows of the same file, so nothing is created twice.
 * What the records' rules refuse is changed and said, never failed later:
 * past "to contact" a lead needs an owner and an organisation, won, lost and
 * parked need a reason the file doesn't have, and an investor lead stops at
 * met.
 */
export function planImport(table: CsvTable, mapping: readonly ImportField[], ctx: ImportContext): PlannedRow[] {
  const earlier = new Map<string, number>();
  return table.rows.map((cells, index) => {
    const row = index + 2;
    const get = (field: ImportField) => nullIfEmpty(cells[mapping.indexOf(field)]);
    const problems: string[] = [];
    const orgName = get("organisation");
    const leadName = get("leadName") ?? orgName ?? "";
    const website = get("website");
    const notes =
      mapping
        .map((f, i) => (f === "notes" && cells[i]?.trim() ? `${table.headers[i]}: ${cells[i].trim()}` : null))
        .filter((n): n is string => n !== null)
        .join("\n") || null;

    let organisation: PlannedOrganisation | null = null;
    if (orgName) {
      const key = sameName(orgName);
      const host = hostOf(website);
      const existing = ctx.organisations.find((o) => sameName(o.name) === key || (host !== null && hostOf(o.website) === host));
      const before = earlier.get(key);
      if (existing) organisation = { kind: "existing", id: existing.id, name: existing.name, notes, existingNotes: existing.notes ?? null };
      else if (before !== undefined) organisation = { kind: "earlier", row: before, name: orgName, notes };
      else {
        organisation = { kind: "new", name: orgName, website, notes };
        earlier.set(key, row);
      }
    } else if (notes) problems.push("Notes are kept on the organisation, and this row has none: they are left out");

    const personName = get("person");
    const person = personName
      ? { name: personName, role: get("role"), email: get("email"), phone: get("phone") }
      : null;
    if (!person && (get("role") || get("email") || get("phone")))
      problems.push("A role, email or phone without a contact person's name is left out");
    if (person && !orgName) problems.push("A contact person is kept on the organisation, and this row has none: left out");

    const kindText = get("kind");
    const kind = kindText ? fromLabel<LeadKind>(VOCABULARY.relationshipKind, kindText) : null;
    if (kindText && !kind) problems.push(`"${kindText}" is not a kind of lead: left unset`);

    const ownerText = get("owner");
    const owner = ownerText
      ? (ctx.team.find((m) => norm(m.name) === norm(ownerText) || m.address.toLowerCase() === ownerText.toLowerCase())?.address ?? null)
      : null;
    if (ownerText && !owner) problems.push(`"${ownerText}" is not in the team: imported without an owner`);

    const statusText = get("status");
    let status: LeadStatus = "TO_CONTACT";
    const asked = statusText ? fromLabel<LeadStatus>(VOCABULARY.leadStatus, statusText) : null;
    if (statusText && !asked) problems.push(`"${statusText}" is not a status: imported as To contact`);
    else if (asked === "WON" || asked === "LOST" || asked === "PARKED")
      problems.push(`${statusText} needs a reason: imported as To contact; set it on the lead page`);
    else if (asked && asked !== "TO_CONTACT") {
      if (!owner || !organisation) problems.push(`Past To contact a lead needs an owner and an organisation: imported as To contact`);
      else if (kind === "INVESTOR" && asked === "PROPOSAL") {
        status = "MET";
        problems.push("An investor lead goes no further than met: imported as Met");
      } else status = ACTIVE.includes(asked) ? asked : "TO_CONTACT";
    }

    const stepText = get("nextStep");
    const dueText = get("nextStepDue");
    const due = dueText ? parseDay(dueText) : null;
    if (dueText && !due) problems.push(`"${dueText}" is not a date: the next step has no due date`);
    if (!stepText && dueText) problems.push("A due date without a next step is left out");
    const nextStep = stepText ? { text: stepText, dueDate: due ? `${due}T00:00:00.000Z` : null } : null;

    const sourceText = get("source");
    const source = sourceText ? parseSource(sourceText) : null;

    const blocked = leadName === "";
    if (blocked) problems.unshift("No organisation or lead name: this row can't be imported");
    const orgId = organisation?.kind === "existing" ? organisation.id : null;
    const dup = orgId ? ctx.leads.find((l) => l.organisationId === orgId && sameName(l.name) === sameName(leadName)) : undefined;
    return {
      row,
      leadName,
      organisation,
      person: orgName ? person : null,
      kind,
      status,
      owner,
      nextStep,
      source,
      problems,
      blocked,
      duplicateOf: dup ? { id: dup.id, name: dup.name } : null,
    };
  });
}

/** The notes an organisation ends up with: its own, then the imported ones, never replaced. */
export function mergedNotes(existing: string | null, imported: string | null): string | null {
  if (!imported) return existing;
  return existing?.trim() ? `${existing.trim()}\n\n${imported}` : imported;
}
