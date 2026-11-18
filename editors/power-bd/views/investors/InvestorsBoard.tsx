import type { InvestorRow } from "document-models/investor-list";
import { useRef, type ReactNode } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { moveAction } from "../../components/shared/board/moveAction.js";
import { useBoardMove } from "../../components/shared/board/useBoardMove.js";
import {
  INVESTOR_ROW_STATES,
  investorRowTargets,
} from "../../kit/overview-view/index.js";
import { MoveAsk } from "../overview/MoveAsk.js";
import { MoveList } from "../overview/MoveMenu.js";

/**
 * The investor list's rows in one column per state. A card moves by dragging
 * it or with its "Move to…" list; what a move does, asks or refuses comes from
 * the kit (`investorRowMove`), which follows the list's rules. Each move goes
 * to the list document and names the row. Engaging is never done by a drop:
 * it opens "Start relationship" in the Engaged column, since that step
 * creates the organisation and the investor lead.
 */
export function InvestorsBoard({
  rows,
  listId,
  startPanel,
  onStart,
  onDetails,
  onOpen,
}: {
  rows: InvestorRow[];
  /** The investor list document the rows belong to. */
  listId: string;
  /** "Start relationship" for one row, shown in the Engaged column; null when closed. */
  startPanel: ReactNode;
  onStart: (rowId: string) => void;
  /** Opens a row's details in the list. */
  onDetails: (rowId: string) => void;
  /** Opens a record: an engaged row's organisation or investor lead. */
  onOpen: (id: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const nameOf = (id: string) => byId.get(id)?.name ?? "";
  const board = useBoardMove({
    root,
    targetsOf: (id) => {
      const row = byId.get(id);
      return row ? investorRowTargets({ state: row.state }) : [];
    },
    send: (rowId, option, reason) => ({
      documentId: listId,
      action: moveAction(option, reason, rowId),
    }),
  });

  return (
    <div className="pb-board pb-board--drop" ref={root}>
      {INVESTOR_ROW_STATES.map((state) => {
        const term = VOCABULARY.investorRow.find((t) => t.value === state);
        const inCol = rows.filter((r) => r.state === state);
        const zone = board.dropZone(state);
        const asking = board.ask?.column === state ? board.ask : null;
        return (
          <div
            className={`pb-board__col${zone.className}`}
            key={state}
            {...zone.handlers}
          >
            <div className="pb-board__head">
              <span className={`pb-tag pb-tag--${term?.tone ?? "default"}`}>
                {term?.label}
              </span>
              <span>{inCol.length}</span>
            </div>
            {zone.hint}
            {asking ? (
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
                  onStart(asking.key);
                }}
                onCancel={board.cancel}
              />
            ) : null}
            {state === "ENGAGED" && startPanel ? (
              // The same raised box as a move's question, so it reads as the step the drop opened.
              <div
                className="pb-ask"
                role="dialog"
                aria-label="Start relationship"
              >
                {startPanel}
              </div>
            ) : null}
            {inCol.map((row) => {
              const held = board.cardDrag(row.id, row.name);
              const menuOpen = board.menu === row.id;
              const open = () =>
                row.state === "ENGAGED" && row.leadId
                  ? onOpen(row.leadId)
                  : onDetails(row.id);
              return (
                <div
                  className={`pb-card pb-clickable${held.className}`}
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  {...held.props}
                  onClick={open}
                  onKeyDown={(e) =>
                    e.key === "Enter" && e.target === e.currentTarget && open()
                  }
                >
                  <div className="pb-card__kind">
                    <Icon name="investors" />
                    {row.sourceList ?? "No list"}
                    <button
                      type="button"
                      className="pb-btn pb-btn--ghost pb-btn--sm pb-card__move"
                      aria-expanded={menuOpen}
                      onClick={(e) => {
                        e.stopPropagation();
                        board.setMenu(menuOpen ? null : row.id);
                      }}
                    >
                      Move to…
                    </button>
                  </div>
                  <div className="pb-card__title">{row.name}</div>
                  {row.website ? (
                    <div className="pb-card__row" title="Website">
                      <Icon name="globe" className="pb-icon pb-icon--xs" />
                      <span>{row.website}</span>
                    </div>
                  ) : null}
                  {row.state === "EXCLUDED" && row.exclusionReason ? (
                    <div className="pb-card__row" title="Why it is excluded">
                      <Icon name="info" className="pb-icon pb-icon--xs" />
                      <span>{row.exclusionReason}</span>
                    </div>
                  ) : null}
                  {row.comparables.length > 0 ? (
                    <div className="pb-card__row" title="Funded comparables">
                      <Icon name="note" className="pb-icon pb-icon--xs" />
                      <span>
                        {row.comparables.length} funded comparable
                        {row.comparables.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  ) : null}
                  {row.state === "ENGAGED" ? (
                    <div className="pb-card__foot">
                      {row.organisationId ? (
                        <button
                          type="button"
                          className="pb-ref"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen(row.organisationId ?? "");
                          }}
                        >
                          <Icon name="organisations" />
                          <span>Organisation</span>
                        </button>
                      ) : null}
                      {row.leadId ? (
                        <button
                          type="button"
                          className="pb-ref"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen(row.leadId ?? "");
                          }}
                        >
                          <Icon name="investors" />
                          <span>Investor lead</span>
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {menuOpen ? (
                    <MoveList
                      targets={held.targets}
                      terms={VOCABULARY.investorRow}
                      onMove={(to) => board.move(row.id, to)}
                      onClose={() => board.setMenu(null)}
                    />
                  ) : null}
                  <ErrorLine
                    message={
                      board.error?.key === row.id ? board.error.message : null
                    }
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
