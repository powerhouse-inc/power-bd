import type { ProposalState } from "document-models/proposal";
import type { PlaybookState } from "document-models/playbook";
import type { DecisionStatus } from "document-models/decision";
import {
  checkSensitivity,
  type ConfidentialText,
} from "../sensitivity/sensitivity.js";

export type CheckCode =
  | "NEVER_CLAIM_PHRASE"
  | "CONFIDENTIAL_QUOTED"
  | "PLACEHOLDER_LEFT"
  | "OTHER_CURRENCY_IN_TEXT"
  | "OPTION_MISSING_REQUIRED_PACKAGE"
  | "PACKAGE_WITHOUT_PRICE"
  | "PACKAGE_WITHOUT_DELIVERABLE"
  | "FIXED_PRICE_OUTSIDE_OPTIONS"
  | "PAYMENT_NOT_100"
  | "CLAUSE_MISSING"
  | "DATA_ANNEX_MISSING"
  | "POSITIONING_NOT_APPROVED"
  | "VALID_UNTIL_PASSED"
  | "DECISION_OPEN";

/** An item of a list (and, for a text, which of its fields), or a field of the proposal. */
export type Concern =
  | { list: string; id: string; field?: string }
  | { field: string };

export type CheckFinding = {
  code: CheckCode;
  concerns: Concern;
  sentence: string;
  /** The playbook's never-claim or the lead's confidential item behind a sensitivity finding. */
  sourceItemId?: string;
};

export type CheckInput = {
  proposal: ProposalState;
  playbook: Pick<PlaybookState, "positioning" | "neverClaims">;
  confidentialItems: readonly ConfidentialText[];
  /** The decisions the proposal references. */
  decisions: readonly { id: string; status: DecisionStatus }[];
  /** `YYYY-MM-DD`. */
  today: string;
};

type TextEntry = { concerns: Concern; text: string };

function textsOf(p: ProposalState): TextEntry[] {
  const out: TextEntry[] = [];
  const add = (concerns: Concern, text: string | null | undefined) => {
    if (text) out.push({ concerns, text });
  };
  const item = <T extends { id: string }>(
    list: string,
    rows: readonly T[],
    fields: (keyof T & string)[],
  ) => {
    for (const row of rows) {
      for (const field of fields) {
        add({ list, id: row.id, field }, row[field] as string | null);
      }
    }
  };
  add({ field: "title" }, p.title);
  item("references", p.references, ["title"]);
  item("packages", p.packages, ["name", "summary"]);
  item("deliverables", p.deliverables, ["title", "body"]);
  for (const d of p.deliverables) {
    add({ list: "deliverables", id: d.id, field: "note" }, d.price?.note);
  }
  item("options", p.options, ["label"]);
  item(
    "adjustments",
    p.options.flatMap((o) => o.adjustments),
    ["label", "condition"],
  );
  item("paymentSteps", p.paymentSteps, ["label"]);
  item("actors", p.actors, ["name", "description"]);
  item("useCases", p.useCases, ["title", "body"]);
  item("boundaries", p.boundaries, ["text", "value"]);
  item("sections", p.sections, ["title", "body"]);
  item("clauses", p.clauses, ["title", "body"]);
  item("annexes", p.annexes, ["title", "body"]);
  item("figures", p.figures, ["caption"]);
  return out;
}

/** The codes a text may quote in square brackets without it being a placeholder. */
export function proposalCodes(p: ProposalState): Set<string> {
  return new Set(
    [
      p.code,
      ...p.packages.map((x) => x.code),
      ...p.deliverables.map((x) => x.code),
      ...p.actors.map((x) => x.code),
      ...p.useCases.map((x) => x.code),
    ].filter((c): c is string => !!c),
  );
}

type Range = { start: number; end: number };

/** Every placeholder in a text, kind by kind: `[•]`, then words, underscores and brackets. */
function placeholderRanges(text: string, codes: Set<string>): Range[] {
  const found: Range[] = [];
  const all = (pattern: RegExp) => {
    for (const m of text.matchAll(pattern))
      found.push({ start: m.index, end: m.index + m[0].length });
  };
  all(/\[•\]/g);
  all(/\b(?:TBD|TODO|XXX)\b/g);
  all(/_{3,}/g);
  for (const m of text.matchAll(/\[([^[\]]+)\]/g)) {
    const inner = m[1];
    const next = text[m.index + m[0].length];
    if (codes.has(inner)) continue;
    if (next === "(" || next === "[") continue;
    if (text[m.index - 1] === "]") continue; // the label of a reference link
    if (inner === " " || inner === "x" || inner === "X") continue;
    if (inner.startsWith("^")) continue;
    found.push({ start: m.index, end: m.index + m[0].length });
  }
  return found;
}

/** The first placeholder in a text, or null. */
function findPlaceholder(text: string, codes: Set<string>): string | null {
  const first = placeholderRanges(text, codes).at(0);
  return first ? text.slice(first.start, first.end) : null;
}

/**
 * A text cut into pieces, each marked as a placeholder or not: what the
 * preview highlights is exactly what the check reports.
 */
export function markPlaceholders(
  text: string,
  codes: Set<string>,
): { text: string; placeholder: boolean }[] {
  const pieces: { text: string; placeholder: boolean }[] = [];
  let at = 0;
  const ranges = placeholderRanges(text, codes).sort(
    (a, b) => a.start - b.start || b.end - a.end,
  );
  for (const r of ranges) {
    if (r.end <= at) continue; // inside one already marked
    const start = Math.max(r.start, at);
    if (start > at)
      pieces.push({ text: text.slice(at, start), placeholder: false });
    pieces.push({ text: text.slice(start, r.end), placeholder: true });
    at = r.end;
  }
  if (at < text.length)
    pieces.push({ text: text.slice(at), placeholder: false });
  return pieces;
}

const ISO_CODES = new Set(
  (
    "AED AFN ALL AMD ANG AOA ARS AUD AWG AZN BAM BBD BDT BGN BHD BIF BMD BND BOB BRL BSD BTN BWP BYN BZD " +
    "CAD CDF CHF CLP CNY COP CRC CUP CVE CZK DJF DKK DOP DZD EGP ERN ETB EUR FJD FKP GBP GEL GHS GIP GMD " +
    "GNF GTQ GYD HKD HNL HTG HUF IDR ILS INR IQD IRR ISK JMD JOD JPY KES KGS KHR KMF KPW KRW KWD KYD KZT " +
    "LAK LBP LKR LRD LSL LYD MAD MDL MGA MKD MMK MNT MOP MRU MUR MVR MWK MXN MYR MZN NAD NGN NIO NOK NPR " +
    "NZD OMR PAB PEN PGK PHP PKR PLN PYG QAR RON RSD RUB RWF SAR SBD SCR SDG SEK SGD SHP SLE SOS SRD SSP " +
    "STN SYP SZL THB TJS TMT TND TOP TRY TTD TWD TZS UAH UGX USD UYU UZS VES VND VUV WST XAF XCD XOF XPF " +
    "YER ZAR ZMW ZWL"
  ).split(" "),
);

const SYMBOL_FITS: Record<string, string[]> = {
  "€": ["EUR"],
  "£": ["GBP"],
  "¥": ["JPY", "CNY"],
  $: ["USD", "CAD", "AUD", "NZD", "SGD", "HKD"],
};

/** The first amount in a currency other than `currency`, or null. */
function findOtherCurrency(text: string, currency: string): string | null {
  for (const [code] of text.matchAll(
    /(?<=\d\s?)[A-Z]{3}\b|\b[A-Z]{3}(?=\s?\d)/g,
  ))
    if (ISO_CODES.has(code) && code !== currency) return code;
  for (const [symbol] of text.matchAll(/(?<=\d\s?)[€£¥$]|[€£¥$](?=\s?\d)/g))
    if (!SYMBOL_FITS[symbol].includes(currency)) return symbol;
  return null;
}

const NOUN: Record<string, string> = {
  references: "Reference",
  packages: "Package",
  deliverables: "Deliverable",
  options: "Option",
  adjustments: "Adjustment",
  paymentSteps: "Payment step",
  actors: "Actor",
  useCases: "Use case",
  boundaries: "Boundary",
  sections: "Section",
  clauses: "Clause",
  annexes: "Annex",
  figures: "Figure",
};

type Named = {
  code?: string | null;
  title?: string | null;
  name?: string | null;
  label?: string | null;
  text?: string | null;
  caption?: string | null;
};

/** `Deliverable BL-P1-D2 "Signing flow"`: an item by its code and title, never its id. */
function describeItem(noun: string, row: Named | undefined): string {
  const title =
    row?.title || row?.name || row?.label || row?.text || row?.caption;
  return [noun, row?.code, title ? `"${title}"` : null]
    .filter(Boolean)
    .join(" ");
}

function itemOf(p: ProposalState, list: string, id: string): Named | undefined {
  const rows =
    list === "adjustments"
      ? p.options.flatMap((o) => o.adjustments)
      : ((p as unknown as Record<string, (Named & { id: string })[]>)[list] ??
        []);
  return rows.find((r) => r.id === id);
}

/** What a finding about a text calls the place it was found. */
const where = (p: ProposalState, c: Concern) =>
  "list" in c
    ? describeItem(NOUN[c.list] ?? "Item", itemOf(p, c.list, c.id))
    : c.field === "title"
      ? "The proposal title"
      : `The ${c.field}`;

const REQUIRED_CLAUSES = [
  ["LIABILITY", "liability"],
  ["TERMINATION", "termination"],
  ["GOVERNING_LAW", "governing-law"],
] as const;

/**
 * The findings a proposal must clear before approval. Pure: today's date is
 * an input. Order: texts first (in the proposal's order), then structure.
 */
export function checkProposal(input: CheckInput): CheckFinding[] {
  const { proposal: p, playbook, confidentialItems, decisions, today } = input;
  const found: CheckFinding[] = [];
  const codes = proposalCodes(p);

  for (const { concerns, text } of textsOf(p)) {
    for (const s of checkSensitivity(
      text,
      playbook.neverClaims,
      confidentialItems,
    )) {
      found.push(
        s.kind === "never-claim"
          ? {
              code: "NEVER_CLAIM_PHRASE",
              concerns,
              sourceItemId: s.itemId,
              sentence: `${where(p, concerns)} says "${s.phrase}", which the playbook says never to claim.`,
            }
          : {
              code: "CONFIDENTIAL_QUOTED",
              concerns,
              sourceItemId: s.itemId,
              sentence: `${where(p, concerns)} quotes ${s.words} words of a confidential note.`,
            },
      );
    }
    const placeholder = findPlaceholder(text, codes);
    if (placeholder) {
      found.push({
        code: "PLACEHOLDER_LEFT",
        concerns,
        sentence: `${where(p, concerns)} still holds a placeholder: ${placeholder}.`,
      });
    }
    const other = p.currency ? findOtherCurrency(text, p.currency) : null;
    if (other) {
      found.push({
        code: "OTHER_CURRENCY_IN_TEXT",
        concerns,
        sentence: `${where(p, concerns)} mentions an amount in ${other}, but the proposal is in ${p.currency}.`,
      });
    }
  }

  const inOption = new Set(p.options.flatMap((o) => o.packageIds));
  for (const o of p.options) {
    for (const pkgId of o.packageIds) {
      const pkg = p.packages.find((x) => x.id === pkgId);
      for (const req of pkg?.requires ?? []) {
        if (!o.packageIds.includes(req)) {
          found.push({
            code: "OPTION_MISSING_REQUIRED_PACKAGE",
            concerns: { list: "options", id: o.id },
            sentence: `Option "${o.label}" needs ${describeItem("package", itemOf(p, "packages", req))}, which it does not include.`,
          });
        }
      }
    }
  }
  for (const pkg of p.packages) {
    const own = p.deliverables.filter((d) => d.packageId === pkg.id);
    const concerns = { list: "packages", id: pkg.id };
    if (
      inOption.has(pkg.id) &&
      pkg.price == null &&
      !own.some((d) => d.price?.pricing === "FIXED")
    ) {
      found.push({
        code: "PACKAGE_WITHOUT_PRICE",
        concerns,
        sentence: `Package "${pkg.name}" is in an option but has neither a price nor a fixed-price deliverable.`,
      });
    }
    if (own.length === 0) {
      found.push({
        code: "PACKAGE_WITHOUT_DELIVERABLE",
        concerns,
        sentence: `Package "${pkg.name}" has no deliverable.`,
      });
    }
    if (pkg.price != null && !inOption.has(pkg.id)) {
      found.push({
        code: "FIXED_PRICE_OUTSIDE_OPTIONS",
        concerns,
        sentence: `Package "${pkg.name}" has a price but is in no option.`,
      });
    }
  }
  for (const d of p.deliverables) {
    if (d.price?.pricing === "FIXED" && !inOption.has(d.packageId)) {
      found.push({
        code: "FIXED_PRICE_OUTSIDE_OPTIONS",
        concerns: { list: "deliverables", id: d.id },
        sentence: `Deliverable "${d.title}" has a fixed price but its package is in no option.`,
      });
    }
  }

  const percent = p.paymentSteps.reduce((sum, s) => sum + s.percentage, 0);
  if (Math.abs(percent - 100) > 1e-6) {
    found.push({
      code: "PAYMENT_NOT_100",
      concerns: { field: "paymentSteps" },
      sentence: `The payment steps add up to ${Number(percent.toFixed(4))} %, not 100 %.`,
    });
  }

  if (p.bindingOnSignature) {
    for (const [kind, name] of REQUIRED_CLAUSES) {
      if (!p.clauses.some((c) => c.kind === kind)) {
        found.push({
          code: "CLAUSE_MISSING",
          concerns: { field: "clauses" },
          sentence: `Signing makes this proposal binding, but it has no ${name} clause.`,
        });
      }
    }
  }
  if (
    p.processesPersonalData &&
    !p.annexes.some((a) => a.kind === "DATA_PROCESSING")
  ) {
    found.push({
      code: "DATA_ANNEX_MISSING",
      concerns: { field: "annexes" },
      sentence:
        "Personal data is processed, but there is no data-processing annex.",
    });
  }

  for (const s of p.sections) {
    if (!s.positioningId) continue;
    const pos = playbook.positioning.find((x) => x.id === s.positioningId);
    if (pos?.status !== "APPROVED") {
      found.push({
        code: "POSITIONING_NOT_APPROVED",
        concerns: { list: "sections", id: s.id },
        sentence: `${describeItem("Section", s)} was taken from a positioning that is no longer approved.`,
      });
    }
  }

  if (p.validUntil && p.validUntil.slice(0, 10) < today) {
    found.push({
      code: "VALID_UNTIL_PASSED",
      concerns: { field: "validUntil" },
      sentence: `The valid-until date, ${p.validUntil}, is already past.`,
    });
  }

  for (const r of p.references) {
    if (
      r.kind === "DECISION" &&
      decisions.some((d) => d.id === r.documentId && d.status === "OPEN")
    ) {
      found.push({
        code: "DECISION_OPEN",
        concerns: { list: "references", id: r.id },
        sentence: `The decision "${r.title}" is still open.`,
      });
    }
  }
  return found;
}
