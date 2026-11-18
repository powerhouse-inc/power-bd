import { formatMoneyCompact } from "../format/index.js";
import {
  marketTotals,
  sizeChecks,
  type MarketLike,
  type SourceLike,
  type Total,
} from "./market.js";

/** One of the three totals as its tile shows it. */
export type TotalTile = {
  key: "tam" | "sam" | "som";
  label: string;
  value: string;
  /** What the amount rests on, or what it leaves out. */
  sub: string;
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "Obtainable in 3 years (SOM)", from the market's horizon. */
export const somLabel = (horizonYears: number | null | undefined): string =>
  horizonYears ? `Obtainable in ${plural(horizonYears, "year")} (SOM)` : "Obtainable (SOM)";

/**
 * TAM, SAM and SOM as tiles: the amount in short form, and under it how many
 * segments it leaves out, so a reader sees what the number rests on.
 */
export function totalTiles(
  market: MarketLike & { horizonYears?: number | null },
): TotalTile[] {
  const t = marketTotals(market.segments);
  const currency = market.currency ?? "EUR";
  const tile = (key: TotalTile["key"], label: string, total: Total, none: string): TotalTile => ({
    key,
    label,
    value: total.counted.length > 0 ? formatMoneyCompact(total.amount, currency) : "–",
    sub:
      total.notCounted.length > 0
        ? `${total.notCounted.length} not counted yet`
        : total.counted.length > 0
          ? `From ${plural(total.counted.length, "segment")}`
          : none,
  });
  return [
    tile("tam", "Total market (TAM)", t.tam, "No segment yet"),
    // Every serviceable segment is either counted or left out, so an empty SAM or SOM means none can be served.
    tile("sam", "Serviceable (SAM)", t.sam, "No segment we can serve yet"),
    tile("som", somLabel(market.horizonYears), t.som, "No segment we can serve yet"),
  ];
}

/** What approval waits for, as the checks before the button; one ok line when nothing. */
export function approvalChecks(market: MarketLike): { text: string; tone: "ok" | "warn" }[] {
  const findings = sizeChecks(market);
  return findings.length === 0
    ? [{ text: "Every counted segment has a source for both numbers", tone: "ok" }]
    : findings.map((f) => ({ text: f.sentence, tone: "warn" }));
}

/** A number's source as its mark says it. */
export const sourceLabel = (source: SourceLike | null | undefined): string =>
  source ? source.title : "No source";

export type Candidate = { id: string; name: string };

/**
 * The organisations that can be placed on a map: those not on it yet, the
 * ones tagged comparable or competitor first, each group by name.
 */
export function mapCandidates(
  contacts: readonly { id: string; name?: string | null; tags: readonly string[] }[],
  placed: readonly { organisationId: string }[],
): { flagged: Candidate[]; others: Candidate[] } {
  const on = new Set(placed.map((p) => p.organisationId));
  const byName = (a: Candidate, b: Candidate) => a.name.localeCompare(b.name);
  const flagged: Candidate[] = [];
  const others: Candidate[] = [];
  for (const c of contacts) {
    if (on.has(c.id)) continue;
    const entry = { id: c.id, name: c.name?.trim() || "Untitled organisation" };
    (c.tags.some((t) => t === "comparable" || t === "competitor") ? flagged : others).push(entry);
  }
  return { flagged: flagged.sort(byName), others: others.sort(byName) };
}

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n * 10) / 10));

/** Where an arrow key moves a dot: 2 along the axis, 10 with Shift; null for any other key. */
export function nudge(
  pos: { x: number; y: number },
  key: string,
  big: boolean,
): { x: number; y: number } | null {
  const step = big ? 10 : 2;
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, step],
    ArrowDown: [0, -step],
  };
  if (!Object.hasOwn(moves, key)) return null;
  const [dx, dy] = moves[key];
  return { x: clamp(pos.x + dx), y: clamp(pos.y + dy) };
}

/** The map position under the pointer: 0 to 100 left to right and bottom to top. */
export function positionAt(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  return {
    x: clamp(((clientX - rect.left) / rect.width) * 100),
    y: clamp(100 - ((clientY - rect.top) / rect.height) * 100),
  };
}

/** The list card's facts. */
export function marketCard(state: MarketLike & { players: readonly unknown[] }) {
  return { onMap: state.players.length, approved: state.sizeStatus === "APPROVED" };
}

/** The markets whose map an organisation is on, by name. */
export function mapsOf(
  organisationId: string,
  markets: readonly { id: string; state: { name?: string | null; players: readonly { organisationId: string }[] } }[],
): { id: string; name: string }[] {
  return markets
    .filter((m) => m.state.players.some((p) => p.organisationId === organisationId))
    .map((m) => ({ id: m.id, name: m.state.name?.trim() || "Untitled market" }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
