import type { LeadState } from "document-models/lead";
import type { LeadValue } from "../overview/index.js";

type Status = LeadState["status"];
type Fit = LeadState["angles"][number]["fit"];

/** The fits of an angle, weakest first: the map's columns after "not assessed". */
export const FIT_ORDER: readonly Fit[] = ["UNLIKELY", "LATER", "GOOD", "BEST"];
/** The open statuses, earliest first: the map's rows. */
export const MAP_STAGES: readonly Status[] = ["TO_CONTACT", "IN_TOUCH", "MEETING_SET", "MET", "PROPOSAL"];

/** What the map reads from a lead. */
export type MapLead = {
  id: string;
  name: string;
  status: Status;
  /** The fits of its angles. */
  fits: readonly Fit[];
  /** The value of its live proposal, if any. */
  value: readonly LeadValue[];
  /** True when its next step is overdue. */
  slipping: boolean;
};

export type Quadrant = "CLOSE" | "START" | "CHECK" | "PARK";

export type MapDot = {
  id: string;
  name: string;
  /** Centre, 0 to 100 from the left. */
  x: number;
  /** Centre, 0 to 100 from the bottom. */
  y: number;
  /** The dot's diameter in pixels, by the proposal's value. */
  size: number;
  slipping: boolean;
  /** 0 for "not assessed", then 1 to 4 for each fit. */
  column: number;
  /** Index in MAP_STAGES. */
  row: number;
  /** Null for a lead not assessed: no angle says how good a fit it is. */
  quadrant: Quadrant | null;
};

export type PriorityMap = {
  dots: MapDot[];
  /** Closed or on hold: not on the map. */
  left: { won: number; lost: number; parked: number };
  /** Leads on the map without an angle, in the "not assessed" column. */
  unassessed: number;
};

/** Columns: "not assessed" and the four fits; rows: the five open statuses. Each cell is a fifth of the map. */
export const COLUMNS = FIT_ORDER.length + 1;
const CELL_W = 100 / COLUMNS;
const CELL_H = 100 / MAP_STAGES.length;
/** At most this many dots stacked in a cell before a second column of them starts. */
const STACK = 4;
export const DOT_MIN = 10;
export const DOT_MAX = 22;

/** The largest amount of a lead's live proposal, in any currency; null without one. Currencies are not converted. */
const valueOf = (value: readonly LeadValue[]) =>
  value.length === 0 ? null : Math.max(...value.map((v) => v.upper ?? v.amount));

/** The quadrant of a cell: right is a good or best fit, top is a meeting set or further. */
export function quadrantOf(column: number, row: number): Quadrant | null {
  if (column === 0) return null;
  const right = column >= 3;
  const top = row >= 2;
  return right ? (top ? "CLOSE" : "START") : top ? "CHECK" : "PARK";
}

/**
 * Where each open lead sits: left to right by the fit of its best angle, bottom
 * to top by how far along it is. Nothing is dragged; a dot moves when the lead
 * changes. Dots sharing a cell are spread in a fixed order (by name, then id),
 * so the map looks the same each time. Won, lost and parked leads are counted
 * and left off.
 */
export function priorityMap(leads: readonly MapLead[]): PriorityMap {
  const left = { won: 0, lost: 0, parked: 0 };
  const placed: { lead: MapLead; column: number; row: number; value: number | null }[] = [];
  for (const lead of leads) {
    if (lead.status === "WON") left.won++;
    else if (lead.status === "LOST") left.lost++;
    else if (lead.status === "PARKED") left.parked++;
    else {
      const best = Math.max(-1, ...lead.fits.map((f) => FIT_ORDER.indexOf(f)));
      placed.push({ lead, column: best + 1, row: MAP_STAGES.indexOf(lead.status), value: valueOf(lead.value) });
    }
  }
  const values = placed.map((p) => p.value).filter((v): v is number => v !== null && v > 0);
  const top = values.length ? Math.max(...values) : 0;
  const cells = new Map<string, typeof placed>();
  for (const p of placed) {
    const key = `${p.column}:${p.row}`;
    cells.set(key, [...(cells.get(key) ?? []), p]);
  }
  const dots: MapDot[] = [];
  for (const group of cells.values()) {
    group.sort((a, b) => a.lead.name.localeCompare(b.lead.name) || a.lead.id.localeCompare(b.lead.id));
    const cols = Math.ceil(group.length / STACK);
    const rows = Math.ceil(group.length / cols);
    group.forEach((p, i) => {
      const c = Math.floor(i / rows);
      const r = i % rows;
      const size =
        p.value !== null && p.value > 0 && top > 0
          ? Math.round(DOT_MIN + (DOT_MAX - DOT_MIN) * Math.sqrt(p.value / top))
          : DOT_MIN;
      dots.push({
        id: p.lead.id,
        name: p.lead.name,
        x: p.column * CELL_W + (c + 0.5) * (CELL_W / cols),
        y: p.row * CELL_H + CELL_H - (r + 0.5) * (CELL_H / rows),
        size,
        slipping: p.lead.slipping,
        column: p.column,
        row: p.row,
        quadrant: quadrantOf(p.column, p.row),
      });
    });
  }
  dots.sort((a, b) => a.row - b.row || a.column - b.column || a.name.localeCompare(b.name));
  return { dots, left, unassessed: placed.filter((p) => p.column === 0).length };
}

/** "Not on the map: 2 won, 1 lost and 1 parked", or null when every lead is on it. */
export function leftOutLine(left: PriorityMap["left"]): string | null {
  const parts = [
    left.won ? `${left.won} won` : null,
    left.lost ? `${left.lost} lost` : null,
    left.parked ? `${left.parked} parked` : null,
  ].filter((p): p is string => p !== null);
  if (parts.length === 0) return null;
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];
  return `Not on the map: ${list}`;
}
