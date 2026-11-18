import type { LeadState } from "document-models/lead";
import { useRef } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { ProposalBadge } from "../../components/shared/ProposalBadge.js";
import { useBoardMove } from "../../components/shared/board/useBoardMove.js";
import { nextAction } from "../../kit/lead-view/index.js";
import {
  LEAD_STATUSES,
  leadMoveCard,
  leadStatusTargets,
} from "../../kit/overview-view/index.js";
import type { ProposalBadge as Badge } from "../../kit/proposal-list/index.js";
import { MoveAsk } from "../overview/MoveAsk.js";
import { MoveList } from "../overview/MoveMenu.js";
import { NextStep, NextStepSignal } from "./NextStep.js";

type LeadDoc = { header: { id: string }; state: { global: LeadState } };

/**
 * The leads in one column per status. A card moves to another status by
 * dragging it there or with its "Move to…" list; what a move does, asks or
 * refuses comes from the kit (`leadStatusMove`), which follows the lead
 * page's rules, and the action sent is the one the lead page sends.
 */
export function LeadsBoard({
  leads,
  badges,
  today,
  ownerName,
  onOpen,
}: {
  leads: LeadDoc[];
  badges: Partial<Record<string, Badge>>;
  /** Our calendar day, for overdue next steps. */
  today: string;
  ownerName: (address: string) => string;
  onOpen: (id: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const byId = new Map(leads.map((d) => [d.header.id, d.state.global]));
  const nameOf = (id: string) => byId.get(id)?.name || "Untitled lead";
  const board = useBoardMove({
    root,
    targetsOf: (id) => {
      const s = byId.get(id);
      return s ? leadStatusTargets(leadMoveCard(s)) : [];
    },
  });

  return (
    <div className="pb-board" ref={root}>
      {LEAD_STATUSES.map((status) => {
        const term = VOCABULARY.leadStatus.find((t) => t.value === status);
        const inCol = leads.filter((d) => d.state.global.status === status);
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
            {inCol.map((d) => {
              const id = d.header.id;
              const s = d.state.global;
              const kind = VOCABULARY.relationshipKind.find(
                (k) => k.value === s.kind,
              );
              const badge = badges[id];
              const next = nextAction(s, today);
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
                    {kind?.icon ? <Icon name={kind.icon} /> : null}
                    {kind?.label ?? "Kind not set"}
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
                    {s.name || "Untitled lead"}
                  </div>
                  <div className="pb-card__row">
                    <NextStep next={next} inCard />
                  </div>
                  {badge ? (
                    <div className="pb-card__row">
                      <ProposalBadge badge={badge} />
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
                  </div>
                  <NextStepSignal next={next} />
                  {menuOpen ? (
                    <MoveList
                      targets={held.targets}
                      terms={VOCABULARY.leadStatus}
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
