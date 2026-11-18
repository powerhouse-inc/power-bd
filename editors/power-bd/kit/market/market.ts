import { formatMoneyCompact } from "../format/index.js";

/** Where a number comes from: a vault note, a web page, or both. */
export type SourceLike = {
  title: string;
  url?: string | null;
  documentId?: string | null;
};

/** What the totals read from a segment; the market model's segments fit it as they are. */
export type SegmentLike = {
  id: string;
  name: string;
  accounts?: number | null;
  accountsSource?: SourceLike | null;
  annualValue?: number | null;
  annualValueSource?: SourceLike | null;
  serviceable: boolean;
  targetAccounts?: number | null;
};

export type MarketLike = {
  currency?: string | null;
  segments: readonly SegmentLike[];
  sizeStatus: "DRAFT" | "APPROVED";
};

/** One of the three totals, with the segments it rests on and those it leaves out. */
export type Total = {
  amount: number;
  /** Ids of the segments the amount counts. */
  counted: string[];
  /** Ids of the segments that belong in it but miss a number: never counted as zero. */
  notCounted: string[];
};

export type MarketTotals = { tam: Total; sam: Total; som: Total };

const has = (n: number | null | undefined): n is number =>
  typeof n === "number" && Number.isFinite(n);

function total(
  segments: readonly SegmentLike[],
  belongs: (s: SegmentLike) => boolean,
  value: (s: SegmentLike) => number | null,
): Total {
  const out: Total = { amount: 0, counted: [], notCounted: [] };
  for (const s of segments) {
    if (!belongs(s)) continue;
    const v = value(s);
    if (v === null) out.notCounted.push(s.id);
    else {
      out.amount += v;
      out.counted.push(s.id);
    }
  }
  return out;
}

const yearly = (s: SegmentLike) =>
  has(s.accounts) && has(s.annualValue) ? s.accounts * s.annualValue : null;

/**
 * TAM, SAM and SOM from the segments, computed and never typed in:
 * - TAM, every segment: organisations × value per organisation per year;
 * - SAM, the same over the segments we can serve;
 * - SOM, the yearly value of the organisations we can win in the horizon, in
 *   the segments we can serve: target × value per organisation.
 * A segment missing a number is left out and listed, never counted as zero.
 */
export function marketTotals(segments: readonly SegmentLike[]): MarketTotals {
  return {
    tam: total(segments, () => true, yearly),
    sam: total(segments, (s) => s.serviceable, yearly),
    som: total(
      segments,
      (s) => s.serviceable,
      (s) =>
        has(s.targetAccounts) && has(s.annualValue)
          ? s.targetAccounts * s.annualValue
          : null,
    ),
  };
}

export type SizeCheckCode =
  | "NOTHING_COUNTED"
  | "ACCOUNTS_WITHOUT_SOURCE"
  | "VALUE_WITHOUT_SOURCE";

/** One thing approval waits for, in the order a person fixes it. */
export type SizeFinding = {
  code: SizeCheckCode;
  segmentId?: string;
  sentence: string;
};

const sourced = (s: SourceLike | null | undefined) =>
  !!s && (!!s.url || !!s.documentId);

/**
 * What approving the figures waits for, as APPROVE_SIZE refuses it: at least
 * one segment counted, and a source for both numbers of every counted
 * segment. Segments not counted yet do not block approval; the totals say
 * they are left out. Empty when the figures can be approved.
 */
export function sizeChecks(market: MarketLike): SizeFinding[] {
  const counted = market.segments.filter((s) => yearly(s) !== null);
  if (counted.length === 0)
    return [
      {
        code: "NOTHING_COUNTED",
        sentence:
          "Give at least one segment its number of organisations and its value per organisation",
      },
    ];
  const findings: SizeFinding[] = [];
  for (const s of counted) {
    if (!sourced(s.accountsSource))
      findings.push({
        code: "ACCOUNTS_WITHOUT_SOURCE",
        segmentId: s.id,
        sentence: `Add a source for the number of organisations in ${s.name}`,
      });
    if (!sourced(s.annualValueSource))
      findings.push({
        code: "VALUE_WITHOUT_SOURCE",
        segmentId: s.id,
        sentence: `Add a source for the value per organisation in ${s.name}`,
      });
  }
  return findings;
}

/** The list card's line: "€1.2bn · €310m · €18m", or that nothing is counted yet. */
export function marketCardLine(market: MarketLike): string {
  const { tam, sam, som } = marketTotals(market.segments);
  if (tam.counted.length === 0) return "Not sized yet";
  const money = (t: Total) =>
    t.counted.length === 0
      ? "–"
      : formatMoneyCompact(t.amount, market.currency ?? "EUR");
  return [tam, sam, som].map(money).join(" · ");
}
