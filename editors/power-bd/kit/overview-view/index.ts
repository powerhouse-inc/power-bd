import {
  filterItems,
  mine,
  type Board,
  type DueItem,
  type ItemRef,
  type SlippingItem,
  type ViewFilter,
  type ViewItem,
} from "../overview/index.js";

const key = (r: Pick<ItemRef, "kind" | "id">) => `${r.kind}:${r.id}`;
const lower = (s: string) => s.toLowerCase();

/** Slipping items the address owns; everything when no address is given. */
export function slippingForMe(
  slipping: SlippingItem[],
  items: ViewItem[],
  address: string | null,
): SlippingItem[] {
  if (address === null) return slipping;
  const owned = new Set(mine(items, address).map(key));
  return slipping.filter((s) => owned.has(key(s.source)));
}

/** Due items that concern the address; everything when no address is given. */
export function dueForMe(due: DueItem[], address: string | null): DueItem[] {
  if (address === null) return due;
  const a = lower(address);
  return due.filter((d) => d.people.some((p) => lower(p) === a));
}

/** Due items grouped by our calendar day, in day order (order within a day kept). */
export function groupDueByDay(
  due: DueItem[],
): { day: string; items: DueItem[] }[] {
  const days = new Map<string, DueItem[]>();
  for (const d of due) days.set(d.day, [...(days.get(d.day) ?? []), d]);
  return [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, items]) => ({ day, items }));
}

/** Opportunities that are not on the board's Closed column. */
export function openOpportunities<T extends { id: string }>(
  opportunities: T[],
  board: Board,
): T[] {
  const closed = new Set(
    board.CLOSED.filter((e) => e.kind === "opportunity").map((e) => e.id),
  );
  return opportunities.filter((o) => !closed.has(o.id));
}

/**
 * The board with the filters applied. Investor rows have no owner or shared
 * status, so only the kind filter can keep them.
 */
export function visibleBoard(
  board: Board,
  items: ViewItem[],
  filter: ViewFilter,
): Board {
  const matching = new Set(filterItems(items, filter).map(key));
  const rowsOk =
    filter.owner === undefined &&
    filter.status === undefined &&
    (filter.kind === undefined || filter.kind === "investor-row");
  const out = {} as Board;
  for (const stage of ["NEW", "ACTIVE", "PARKED", "CLOSED"] as const) {
    out[stage] = board[stage].filter((e) =>
      e.kind === "investor-row" ? rowsOk : matching.has(key(e)),
    );
  }
  return out;
}
export {
  overviewModel,
  type OverviewModel,
  type OverviewRecords,
} from "./model.js";

export {
  columnMode,
  tileActive,
  tileView,
  type BoardTile,
  type BoardViewState,
} from "./board-view.js";
export {
  cardDetails,
  cardKey,
  type CardDetail,
  type CardExtras,
  type CardMark,
} from "./cards.js";
export { menuKey, type MenuState, type MenuStep } from "./menu-keys.js";
export { OWNER_TONES, ownerTone, type OwnerTone } from "./owner-tone.js";
export {
  DUE_CLASSES,
  dueClass,
  dueStrip,
  stripDayText,
  stripMarks,
  type DueClass,
  type StripDay,
} from "./strip.js";
export {
  agoText,
  daysBetween,
  daysLate,
  overdueText,
  relativeDay,
} from "./when.js";
export {
  canMove,
  cardMove,
  moveCards,
  moveHint,
  moveReassurance,
  moveTargets,
  type MoveCard,
  type MoveOption,
  type MoveOutcome,
  type MoveTarget,
} from "./move.js";
