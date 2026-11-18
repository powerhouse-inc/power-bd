import { useRef } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { DraftValue } from "../../components/shared/ProposalBadge.js";
import { WaitsOn } from "../../components/shared/WaitsOn.js";
import { useBoardMove } from "../../components/shared/board/useBoardMove.js";
import {
  PROPOSAL_STATUSES,
  proposalStatusTargets,
  type ProposalCard,
} from "../../kit/overview-view/index.js";
import type { ProposalRow } from "../../kit/proposal-list/index.js";
import { MoveAsk } from "../overview/MoveAsk.js";
import { MoveList } from "../overview/MoveMenu.js";

/**
 * The proposals in one column per status. A card moves by dragging it or with
 * its "Move to…" list; what a move does, asks or refuses comes from the kit
 * (`proposalStatusMove`), which follows the proposal page's rules. Approving
 * and marking sent are a person's steps: a drop opens the proposal there.
 */
export function ProposalsBoard({
  rows,
  cards,
  onOpen,
}: {
  rows: ProposalRow[];
  /** Each proposal's status and options, by id. */
  cards: Map<string, ProposalCard>;
  onOpen: (id: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const titleOf = (id: string) => rows.find((r) => r.id === id)?.title ?? "";
  const board = useBoardMove({
    root,
    targetsOf: (id) => {
      const card = cards.get(id);
      return card ? proposalStatusTargets(card) : [];
    },
  });

  return (
    <div className="pb-board pb-board--drop" ref={root}>
      {PROPOSAL_STATUSES.map((status) => {
        const term = VOCABULARY.proposalStatus.find((t) => t.value === status);
        const inCol = rows.filter((r) => r.status === status);
        const zone = board.dropZone(status);
        const asking = board.ask?.column === status ? board.ask : null;
        return (
          <div
            className={`pb-board__col${zone.className}`}
            key={status}
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
                name={titleOf(asking.key)}
                stage={term?.label ?? ""}
                outcome={asking.outcome}
                busy={board.busy}
                onApply={(option, reason) =>
                  board.apply(asking.key, option, reason)
                }
                onOpenRecord={() => onOpen(asking.key)}
                onCancel={board.cancel}
              />
            ) : null}
            {inCol.map((r) => {
              const held = board.cardDrag(r.id, r.title);
              const menuOpen = board.menu === r.id;
              return (
                <div
                  className={`pb-card pb-clickable${held.className}`}
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  {...held.props}
                  onClick={() => onOpen(r.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    e.target === e.currentTarget &&
                    onOpen(r.id)
                  }
                >
                  <div className="pb-card__kind">
                    <Icon name="organisations" />
                    {r.organisation ?? "No organisation"}
                    <button
                      type="button"
                      className="pb-btn pb-btn--ghost pb-btn--sm pb-card__move"
                      aria-expanded={menuOpen}
                      onClick={(e) => {
                        e.stopPropagation();
                        board.setMenu(menuOpen ? null : r.id);
                      }}
                    >
                      Move to…
                    </button>
                  </div>
                  <div className="pb-card__title">{r.title}</div>
                  {r.leadName ? (
                    <div className="pb-card__row" title="Lead">
                      <Icon name="leads" className="pb-icon pb-icon--xs" />
                      <span>{r.leadName}</span>
                    </div>
                  ) : null}
                  {r.validUntilLabel ? (
                    <div className="pb-card__row" title="Valid until">
                      <Icon name="calendar" className="pb-icon pb-icon--xs" />
                      <span>Valid until {r.validUntilLabel}</span>
                    </div>
                  ) : null}
                  <div className="pb-card__row" title="Waits on">
                    <WaitsOn wait={r.wait} label={r.waitLabel} />
                  </div>
                  <div className="pb-card__foot">
                    <span className="pb-card__value">
                      {r.valueNote ? <DraftValue value={r.value} /> : r.value}
                    </span>
                  </div>
                  {menuOpen ? (
                    <MoveList
                      targets={held.targets}
                      terms={VOCABULARY.proposalStatus}
                      onMove={(to) => board.move(r.id, to)}
                      onClose={() => board.setMenu(null)}
                    />
                  ) : null}
                  <ErrorLine
                    message={
                      board.error?.key === r.id ? board.error.message : null
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
