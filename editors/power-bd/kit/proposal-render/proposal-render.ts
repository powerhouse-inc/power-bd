import type { ProposalState } from "document-models/proposal";
import { formatMoney, periodWord } from "../format/index.js";
import {
  computeProposalTotals,
  type ProposalTotals,
} from "../proposal-totals/proposal-totals.js";
import {
  blocksToMarkdown,
  prose,
  type DocBlock,
  type Span,
  type TableRow,
} from "./blocks.js";

export type { DocBlock, ProsePart, Span, TableRow } from "./blocks.js";

export type RenderNames = {
  clientName: string;
  recipientName: string;
  contractingEntityTitle: string;
};

type Section = ProposalState["sections"][number];

const DEFAULT_TITLES: Record<Section["kind"], string> = {
  PROSE: "Section",
  SCOPE: "Scope",
  ASSUMPTIONS: "Assumptions",
  DELIVERABLES: "Deliverables",
  PRICING: "Pricing",
  SCHEDULE: "Schedule",
  ACCEPTANCE: "Acceptance",
  TERMS: "Terms",
  ANNEXES: "Annexes",
};

function sectionTitle(section: Section, index: number): string {
  if (section.title) return section.title;
  return section.kind === "PROSE"
    ? `Section ${index + 1}`
    : DEFAULT_TITLES[section.kind];
}

type Ctx = {
  state: ProposalState;
  names: RenderNames;
  totals: ProposalTotals;
  money: (amount: number) => string;
};

type Package = ProposalState["packages"][number];
type Deliverable = ProposalState["deliverables"][number];

/** The day of a stored date: `2026-12-31`, without the time it never had. */
const day = (date: string) => date.slice(0, 10);

const pkgLabel = (p: Package) => `${p.code} ${p.name}`;

const amt = (n: number | null | undefined) => n ?? 0;
const UNIT_WORD = { HOUR: "hour", DAY: "day" };
const BOUNDARY_LABEL = {
  ASSUMPTION: "Assumption",
  CLIENT_INPUT: "Client input",
  EXCLUSION: "Exclusion",
  GUARANTEE: "Guarantee",
};

function range(ctx: Ctx, amount: number, upper: number | null | undefined) {
  return upper == null
    ? ctx.money(amount)
    : `${ctx.money(amount)} to ${ctx.money(upper)}`;
}

function priceText(ctx: Ctx, d: Deliverable, owner: Package) {
  const price = d.price;
  const included = owner.price != null ? "Included" : "\u2014";
  if (!price) return included;
  if (price.pricing === "INCLUDED") return "Included";
  if (price.pricing === "FIXED") return ctx.money(amt(price.amount));
  if (price.pricing === "RECURRING" && price.period) {
    return (
      `${range(ctx, amt(price.amount), price.upperAmount)} per ${periodWord(price.period)}` +
      (price.until ? `, until ${day(price.until)}` : "")
    );
  }
  if (price.pricing === "RATE" && price.unit) {
    return `${range(ctx, amt(price.amount), price.upperAmount)} per ${UNIT_WORD[price.unit]}`;
  }
  return included;
}

const text = (t: string): Span[] => [{ text: t }];
const paragraph = (t: string): DocBlock => ({ kind: "paragraph", text: t });
const heading = (level: 2 | 3 | 4, t: string, id?: string): DocBlock => ({
  kind: "heading",
  level,
  text: t,
  ...(id ? { id } : {}),
});
const list = (items: Span[][]): DocBlock[] =>
  items.length > 0 ? [{ kind: "list", items }] : [];
const written = (source: string | null | undefined): DocBlock[] =>
  source ? [prose(source)] : [];

function figuresFor(
  state: ProposalState,
  kind: "SECTION" | "USE_CASE",
  id: string,
): DocBlock[] {
  return state.figures
    .filter((f) => f.anchorKind === kind && f.anchorId === id)
    .map((f) => ({
      kind: "figure",
      caption: f.caption || f.file.name,
      ref: f.file.ref,
      type: f.file.type,
    }));
}

function boundaryItems(boundaries: ProposalState["boundaries"]): Span[][] {
  return boundaries.map((b) =>
    text(
      `${BOUNDARY_LABEL[b.kind]}: ${b.text}${b.value ? ` (${b.value})` : ""}`,
    ),
  );
}

function scope(ctx: Ctx): DocBlock[] {
  const { state } = ctx;
  const out: DocBlock[] = list(
    state.actors.map((a) => [
      { text: `${a.code} ${a.name}`, strong: true },
      ...(a.description ? text(`: ${a.description}`) : []),
    ]),
  );
  if (state.useCases.length > 0) {
    out.push({
      kind: "table",
      header: ["Code", "Use case", "Actor", "Package"],
      numeric: [],
      codes: [0],
      rows: state.useCases.map((u) => {
        const actor = state.actors.find((a) => a.id === u.actorId);
        const p = state.packages.find((x) => x.id === u.packageId);
        return {
          cells: [u.code, u.title, actor?.name ?? "", p ? pkgLabel(p) : ""],
        };
      }),
    });
  }
  for (const u of state.useCases) {
    out.push(
      heading(3, `${u.code} ${u.title}`),
      ...written(u.body),
      ...figuresFor(state, "USE_CASE", u.id),
    );
  }
  return out;
}

function assumptions(ctx: Ctx): DocBlock[] {
  return list(boundaryItems(ctx.state.boundaries.filter((b) => !b.packageId)));
}

function deliverables(ctx: Ctx): DocBlock[] {
  const { state } = ctx;
  return state.packages.flatMap((p) => {
    const bounds = boundaryItems(
      state.boundaries.filter((b) => b.packageId === p.id),
    );
    return [
      heading(3, pkgLabel(p)),
      ...written(p.summary),
      ...list(
        state.deliverables
          .filter((d) => d.packageId === p.id)
          .map((d) => [
            { text: d.code, strong: true as const },
            ...text(` ${d.title}${d.body ? `: ${d.body}` : ""}`),
          ]),
      ),
      ...(bounds.length > 0 ? [paragraph("Boundaries:"), ...list(bounds)] : []),
    ];
  });
}

function triggerText(step: ProposalState["paymentSteps"][number]) {
  if (step.trigger === "ON_SIGNATURE") return "On signature";
  if (step.trigger === "ON_ACCEPTANCE") return "On acceptance";
  return step.date ? `On ${day(step.date)}` : "On a set date";
}

function pricing(ctx: Ctx): DocBlock[] {
  const { state, totals, money } = ctx;
  return state.options.flatMap((option) => {
    const t = totals.options.find((o) => o.optionId === option.id)!;
    const packages = state.packages.filter((p) =>
      option.packageIds.includes(p.id),
    );
    const rows: TableRow[] = [];
    for (const p of packages) {
      rows.push({
        cells: [p.code, p.name, p.price != null ? money(p.price) : ""],
        role: "group",
      });
      for (const d of state.deliverables.filter((x) => x.packageId === p.id)) {
        rows.push({ cells: [d.code, d.title, priceText(ctx, d, p)] });
      }
    }
    for (const a of option.adjustments) {
      rows.push({
        cells: [
          "",
          a.condition ? `${a.label} (${a.condition})` : a.label,
          money(a.amount),
        ],
      });
    }
    rows.push({ cells: ["", "Total", money(t.fixedTotal)], role: "total" });
    const out: DocBlock[] = [
      heading(3, option.label),
      {
        kind: "table",
        header: ["Code", "Item", "Price"],
        numeric: [2],
        codes: [0],
        rows,
      },
    ];
    const lines = (ref: { packageId: string; deliverableId: string }) => {
      const p = state.packages.find((x) => x.id === ref.packageId);
      const d = state.deliverables.find((x) => x.id === ref.deliverableId)!;
      return `${p!.code} ${d.code} ${d.title}`;
    };
    const costs = [
      ...t.recurring.flatMap((g) =>
        g.lines.map(
          (l) =>
            `${lines(l)}: ${range(ctx, l.amount, l.upperAmount)} per ${periodWord(g.period)}` +
            (l.until ? `, until ${day(l.until)}` : ""),
        ),
      ),
      ...t.rates.map(
        (r) =>
          `${lines(r)}: ${range(ctx, r.amount, r.upperAmount)} per ${UNIT_WORD[r.unit]}`,
      ),
    ];
    if (costs.length > 0)
      out.push(heading(4, "Recurring costs"), ...list(costs.map(text)));
    if (t.payments.length > 0) {
      const steps = new Map(state.paymentSteps.map((s) => [s.id, s]));
      out.push(heading(4, "Payments"), {
        kind: "table",
        header: ["Payment", "When", "Amount"],
        numeric: [2],
        rows: t.payments.map((p) => ({
          cells: [p.label, triggerText(steps.get(p.stepId)!), money(p.amount)],
        })),
      });
    }
    return out;
  });
}

function schedule(ctx: Ctx): DocBlock[] {
  const { state } = ctx;
  const out: DocBlock[] = [];
  const dated = state.packages.filter((p) => p.targetDate);
  if (dated.length > 0) {
    out.push({
      kind: "table",
      header: ["Package", "Target date"],
      numeric: [1],
      rows: dated.map((p) => ({ cells: [pkgLabel(p), day(p.targetDate!)] })),
    });
  }
  const inputs = state.boundaries.filter((b) => b.kind === "CLIENT_INPUT");
  if (inputs.length > 0) {
    out.push(
      paragraph("Subject to:"),
      ...list(
        inputs.map((b) => {
          const p = state.packages.find((x) => x.id === b.packageId);
          return text(`${b.text}${p ? ` (${pkgLabel(p)})` : ""}`);
        }),
      ),
    );
  }
  return out;
}

function acceptance(ctx: Ctx): DocBlock[] {
  const { state, names, totals, money } = ctx;
  const boxes = state.options.map((o): Span[] => {
    const t = totals.options.find((x) => x.optionId === o.id)!;
    const codes = state.packages
      .filter((p) => o.packageIds.includes(p.id))
      .map((p) => p.code)
      .join(", ");
    return [
      { text: o.label, strong: true },
      ...text(`: ${codes}, total ${money(t.fixedTotal)}`),
    ];
  });
  return [
    ...(boxes.length > 0 ? [{ kind: "ticks" as const, items: boxes }] : []),
    {
      kind: "fields",
      rows: [
        ...(state.validUntil
          ? [{ label: "Valid until", value: day(state.validUntil) }]
          : []),
        {
          label: `Signed for ${names.clientName} by ${names.recipientName}`,
          value: null,
        },
        { label: `Signed for ${names.contractingEntityTitle}`, value: null },
      ],
    },
  ];
}

function terms(ctx: Ctx): DocBlock[] {
  return ctx.state.clauses.flatMap((c, i) => [
    heading(3, `${i + 1}. ${c.title}`),
    ...written(c.body),
  ]);
}

function annexes(ctx: Ctx): DocBlock[] {
  return ctx.state.annexes.flatMap((a, i) => [
    heading(3, `Annex ${String.fromCharCode(65 + (i % 26))}: ${a.title}`),
    ...(a.partOfAgreement
      ? [paragraph("Part of the agreement on signature.")]
      : []),
    ...written(a.body),
  ]);
}

const GENERATED: Record<Section["kind"], (ctx: Ctx) => DocBlock[]> = {
  PROSE: () => [],
  SCOPE: scope,
  ASSUMPTIONS: assumptions,
  DELIVERABLES: deliverables,
  PRICING: pricing,
  SCHEDULE: schedule,
  ACCEPTANCE: acceptance,
  TERMS: terms,
  ANNEXES: annexes,
};

/**
 * The proposal as the blocks of one document: title, parties, contents, then
 * each section with its generated parts filled from the record.
 */
export function proposalBlocks(
  state: ProposalState,
  names: RenderNames,
): DocBlock[] {
  const ctx: Ctx = {
    state,
    names,
    totals: computeProposalTotals(state),
    money: (amount) => formatMoney(amount, state.currency),
  };
  return [
    { kind: "title", text: state.title || state.code || "Proposal" },
    {
      kind: "fields",
      rows: [
        ...(state.code ? [{ label: "Code", value: state.code }] : []),
        {
          label: "Prepared for",
          value: `${names.clientName}, attention ${names.recipientName}`,
        },
        { label: "Contracting entity", value: names.contractingEntityTitle },
      ],
    },
    {
      kind: "contents",
      items: state.sections.map((s, i) => ({
        id: s.id,
        title: sectionTitle(s, i),
      })),
    },
    ...state.sections.flatMap((s, i) => [
      heading(2, sectionTitle(s, i), s.id),
      ...written(s.body),
      ...figuresFor(state, "SECTION", s.id),
      ...GENERATED[s.kind](ctx),
    ]),
  ];
}

/** The proposal as one markdown document, made from its blocks. */
export function renderProposal(
  state: ProposalState,
  names: RenderNames,
): string {
  return blocksToMarkdown(proposalBlocks(state, names));
}
