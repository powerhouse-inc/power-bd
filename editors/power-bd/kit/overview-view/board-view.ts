import type { CommonStage, ItemKind } from "../overview/index.js";

/** How the board or table is narrowed: the view, the three filters and "Mine". */
export type BoardViewState = {
  asTable: boolean;
  kind: ItemKind | "";
  owner: string;
  status: string;
  mine: boolean;
};

/** The summary tiles that change what the board shows. "Due" only points at "Coming up". */
export type BoardTile = "relationships" | "decisions" | "funding";

const ALL: BoardViewState = {
  asTable: false,
  kind: "",
  owner: "",
  status: "",
  mine: false,
};

/**
 * A column that holds something is open. Closed stays folded until asked for.
 * An empty stage folds to a strip with nothing to open.
 */
export function columnMode(
  stage: CommonStage,
  count: number,
  showClosed: boolean,
): "open" | "collapsed" | "empty" {
  if (count === 0) return "empty";
  return stage === "CLOSED" && !showClosed ? "collapsed" : "open";
}

/** True when the board shows exactly what the tile's figure counts. */
export function tileActive(tile: BoardTile, view: BoardViewState): boolean {
  if (view.owner !== "" || view.mine) return false;
  if (tile === "decisions")
    return view.asTable && view.kind === "decision" && view.status === "OPEN";
  if (tile === "funding")
    return view.kind === "opportunity" && view.status === "";
  return false;
}

/**
 * Where a tile takes the board. Relationships: everything, on the board.
 * Decisions: the open ones, in the table (decisions have no stage). Funding:
 * the funding opportunities. Pressing an active tile takes its filter off.
 */
export function tileView(
  tile: BoardTile,
  view: BoardViewState,
): BoardViewState {
  if (tile === "relationships") return ALL;
  if (tile === "decisions")
    return tileActive(tile, view)
      ? ALL
      : { ...ALL, asTable: true, kind: "decision", status: "OPEN" };
  return tileActive(tile, view)
    ? { ...ALL, asTable: view.asTable }
    : { ...ALL, asTable: view.asTable, kind: "opportunity" };
}
