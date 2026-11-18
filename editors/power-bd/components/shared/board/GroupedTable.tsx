import { Fragment, useRef, type ReactNode, type Ref } from "react";
import {
  groupRows,
  type ColumnTarget,
} from "../../../kit/overview-view/index.js";
import { MoveAsk } from "../../../views/overview/MoveAsk.js";
import { MoveList } from "../../../views/overview/MoveMenu.js";
import { ErrorLine } from "../ErrorLine.js";
import { useBoardMove, type BoardSend } from "./useBoardMove.js";

type Term = { value: string; label: string; tone: string };

/** What the list needs from each row: its key, its status, and its name for the question. */
export type GroupedRow<K extends string> = {
  key: string;
  status: K;
  name: string;
};

/**
 * A list grouped under one heading per status, in the board's column order,
 * where a row moves as a card does on the board: dragged under another
 * heading, or with its "Move to…" list. What a move does, asks or refuses
 * comes from the same kit rules as the board's, the question stands in the
 * group the row was put in, and a refusal shows under the row, which stays
 * where its record says. The list's own columns and order are kept.
 */
export function GroupedTable<K extends string, R extends GroupedRow<K>>({
  head,
  columns,
  statuses,
  terms,
  rows,
  cells,
  rowClass,
  rowRef,
  onRow,
  after,
  targetsOf,
  send,
  onOpenRecord,
}: {
  /** The list's own headings, as `th` cells. */
  head: ReactNode;
  /** How many of the list's own columns there are. */
  columns: number;
  /** The groups, in the board's column order. */
  statuses: readonly K[];
  terms: readonly Term[];
  /** In the list's order, kept inside each group. */
  rows: readonly R[];
  /** The row's own cells. */
  cells: (row: R) => ReactNode;
  rowClass?: (row: R) => string | undefined;
  rowRef?: (row: R) => Ref<HTMLTableRowElement> | undefined;
  /** Opens a row on a click or Enter; without it, a click on a row does nothing. */
  onRow?: (row: R) => void;
  /** Full-width rows drawn under a row, given the number of columns to span. */
  after?: (row: R, span: number) => ReactNode;
  targetsOf: (key: string) => ColumnTarget<K>[];
  send?: BoardSend;
  /** What a question's "Open …" does: opens the record, or the step the drop asked for. */
  onOpenRecord: (key: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const board = useBoardMove({ root, targetsOf, send });
  const span = columns + 1;
  const nameOf = (key: string) => rows.find((r) => r.key === key)?.name ?? "";
  const panel = (content: ReactNode) => (
    <tr className="pb-table__panel">
      <td colSpan={span}>{content}</td>
    </tr>
  );

  return (
    <div className="pb-table-wrap" ref={root}>
      <table className="pb-table">
        <thead>
          <tr>
            {head}
            <th className="pb-table__move" aria-label="Move" />
          </tr>
        </thead>
        {groupRows(rows, statuses, (r) => r.status).map(
          ({ status, rows: inGroup }) => {
            const term = terms.find((t) => t.value === status);
            const zone = board.dropZone(status);
            const asking = board.ask?.column === status ? board.ask : null;
            return (
              <tbody
                key={status}
                className={`pb-table__group${zone.className}`}
                {...zone.handlers}
              >
                <tr className="pb-table__group-head">
                  <th colSpan={span} scope="colgroup">
                    <span
                      className={`pb-tag pb-tag--${term?.tone ?? "default"}`}
                    >
                      {term?.label}
                    </span>
                    <span className="pb-count">{inGroup.length}</span>
                    {zone.hint}
                  </th>
                </tr>
                {asking
                  ? panel(
                      <MoveAsk
                        key={asking.key}
                        name={nameOf(asking.key)}
                        stage={term?.label ?? ""}
                        outcome={asking.outcome}
                        busy={board.busy}
                        onApply={(option, reason) =>
                          board.apply(asking.key, option, reason)
                        }
                        onOpenRecord={() => {
                          board.cancel();
                          onOpenRecord(asking.key);
                        }}
                        onCancel={board.cancel}
                      />,
                    )
                  : null}
                {inGroup.map((row) => {
                  const held = board.cardDrag(row.key, row.name);
                  const menuOpen = board.menu === row.key;
                  const refused =
                    board.error?.key === row.key ? board.error.message : null;
                  const own = rowClass?.(row);
                  return (
                    <Fragment key={row.key}>
                      <tr
                        ref={rowRef?.(row)}
                        className={
                          [onRow ? "pb-clickable" : "", own ?? ""]
                            .filter(Boolean)
                            .join(" ") + held.className
                        }
                        tabIndex={0}
                        {...held.props}
                        onClick={onRow ? () => onRow(row) : undefined}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            e.target === e.currentTarget &&
                            onRow
                          )
                            onRow(row);
                        }}
                      >
                        {cells(row)}
                        <td className="pb-table__move">
                          <button
                            type="button"
                            className="pb-btn pb-btn--ghost pb-btn--sm pb-card__move"
                            aria-expanded={menuOpen}
                            onClick={(e) => {
                              e.stopPropagation();
                              board.setMenu(menuOpen ? null : row.key);
                            }}
                          >
                            Move to…
                          </button>
                        </td>
                      </tr>
                      {menuOpen
                        ? panel(
                            <MoveList
                              targets={held.targets}
                              terms={terms}
                              onMove={(to) => board.move(row.key, to)}
                              onClose={() => board.setMenu(null)}
                            />,
                          )
                        : null}
                      {refused ? panel(<ErrorLine message={refused} />) : null}
                      {after?.(row, span)}
                    </Fragment>
                  );
                })}
              </tbody>
            );
          },
        )}
      </table>
    </div>
  );
}
