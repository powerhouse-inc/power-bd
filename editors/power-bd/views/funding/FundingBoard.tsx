import type { OpportunityState } from "document-models/opportunity";
import { useRef } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { useBoardMove } from "../../components/shared/board/useBoardMove.js";
import { fmtInstant } from "../../components/shared/relationship/common.js";
import { deadline } from "../../kit/funding/index.js";
import {
  FUNDING_STATUSES,
  opportunityMoveCard,
  opportunityStatusTargets,
} from "../../kit/overview-view/index.js";
import { MoveAsk } from "../overview/MoveAsk.js";
import { MoveList } from "../overview/MoveMenu.js";

type Row = { id: string; state: OpportunityState };

/**
 * The funding opportunities in one column per status, each column in deadline
 * order. A card moves by dragging it or with its "Move to…" list; what a move
 * does, asks or refuses comes from the kit (`opportunityStatusMove`), which
 * follows the opportunity page's rules. Go or no-go is never decided here: it
 * opens the opportunity's page.
 */
export function FundingBoard({
  rows,
  now,
  ourZone,
  funderName,
  ownerName,
  onOpen,
}: {
  /** In deadline order. */
  rows: Row[];
  now: string;
  ourZone: string;
  funderName: (id?: string | null) => string | null | undefined;
  ownerName: (address: string) => string;
  onOpen: (id: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const byId = new Map(rows.map((r) => [r.id, r.state]));
  const nameOf = (id: string) => byId.get(id)?.name || "Untitled opportunity";
  const board = useBoardMove({
    root,
    targetsOf: (id) => {
      const s = byId.get(id);
      return s ? opportunityStatusTargets(opportunityMoveCard(s)) : [];
    },
  });

  return (
    <div className="pb-board pb-board--drop" ref={root}>
      {FUNDING_STATUSES.map((status) => {
        const term = VOCABULARY.opportunityStatus.find(
          (t) => t.value === status,
        );
        const inCol = rows.filter((r) => r.state.status === status);
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
                name={nameOf(asking.key)}
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
            {inCol.map(({ id, state: s }) => {
              const d = deadline(s, now);
              const held = board.cardDrag(id, nameOf(id));
              const menuOpen = board.menu === id;
              return (
                <div
                  className={`pb-card pb-clickable${held.className}`}
                  key={id}
                  role="button"
                  tabIndex={0}
                  {...held.props}
                  onClick={() => onOpen(id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    e.target === e.currentTarget &&
                    onOpen(id)
                  }
                >
                  <div className="pb-card__kind">
                    <Icon name="funder" />
                    {funderName(s.funderId) ?? "Funder not set"}
                    <button
                      type="button"
                      className="pb-btn pb-btn--ghost pb-btn--sm pb-card__move"
                      aria-expanded={menuOpen}
                      onClick={(e) => {
                        e.stopPropagation();
                        board.setMenu(menuOpen ? null : id);
                      }}
                    >
                      Move to…
                    </button>
                  </div>
                  <div className="pb-card__title">
                    {s.name || "Untitled opportunity"}
                  </div>
                  {d ? (
                    <div className="pb-card__row" title="Deadline">
                      <Icon name="calendar" className="pb-icon pb-icon--xs" />
                      <span>{d.step.label}</span>
                      <span className="pb-card__date">
                        · {fmtInstant(d.step.at, ourZone)}
                      </span>
                    </div>
                  ) : null}
                  <div className="pb-card__foot">
                    <span className="pb-small">
                      {s.owner ? (
                        ownerName(s.owner)
                      ) : (
                        <span className="pb-faint">No owner</span>
                      )}
                    </span>
                    {s.amount != null && s.currency ? (
                      <span className="pb-card__value">
                        {s.amount.toLocaleString("en-GB")} {s.currency}
                      </span>
                    ) : null}
                  </div>
                  {menuOpen ? (
                    <MoveList
                      targets={held.targets}
                      terms={VOCABULARY.opportunityStatus}
                      onMove={(to) => board.move(id, to)}
                      onClose={() => board.setMenu(null)}
                    />
                  ) : null}
                  <ErrorLine
                    message={
                      board.error?.key === id ? board.error.message : null
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
