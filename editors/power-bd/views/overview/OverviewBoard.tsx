import { ProposalBadge } from "../../components/shared/ProposalBadge.js";
import { dispatchActions } from "@powerhousedao/reactor-browser";
import {
  actions as leadActions,
} from "document-models/lead";
import {
  actions as opportunityActions,
} from "document-models/opportunity";
import { useRef, useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import type {
  Board,
  BoardEntry,
  CommonStage,
  ItemRef,
  SlippingItem,
  ViewItem,
} from "../../kit/overview/index.js";
import {
  agoText,
  cardKey,
  cardMove,
  columnMode,
  moveCards,
  moveHint,
  moveTargets,
  type CardDetail,
  type MoveOption,
  type MoveOutcome,
  type MoveTarget,
} from "../../kit/overview-view/index.js";
import {
  MARK,
  STAGES,
  dayInstant,
  key,
  sinceFor,
  statusTerm,
  valueText,
} from "./display.js";
import { MoveAsk } from "./MoveAsk.js";
import { MoveList } from "./MoveMenu.js";
import { OwnerAvatar } from "./OwnerAvatar.js";
import { SlipSignal } from "./SlipSignal.js";
import { useInvestorListDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";

const SHORTLISTED = VOCABULARY.investorRow.find(
  (t) => t.value === "SHORTLISTED",
);

const plain = <S,>(d: { header: { id: string }; state: { global: S } }) => ({
  id: d.header.id,
  state: d.state.global,
});

/** The action that reaches a move's status, as the record pages send it. */
function moveAction(option: MoveOption, reason: string | undefined) {
  const at = new Date().toISOString();
  switch (option.act) {
    case "LEAD_STATUS":
      return leadActions.setLeadStatus({
        status: option.status,
        reason,
        changedAt: at,
      });
    case "PARK_LEAD":
      return leadActions.parkLead({ reason: reason ?? "", parkedAt: at });
    case "UNPARK_LEAD":
      return leadActions.unparkLead({});
    case "OPPORTUNITY_STATUS":
      return opportunityActions.setOpportunityStatus({
        status: option.status,
        reason,
        changedAt: at,
      });
  }
}

/** A card in the hand, with what each stage would do to it. */
type Drag = { key: string; targets: MoveTarget[]; away: boolean };
/** A move that waits for an answer, in the stage the card was put on. */
type Ask = {
  entry: BoardEntry;
  stage: CommonStage;
  outcome: Extract<MoveOutcome, { kind: "choose" | "reason" | "decision" }>;
};

/** One relationship: its kind and owner, name, organisation, next step, status, value, what slips and when it last changed. */
function BoardCard({
  entry,
  item,
  detail,
  slip,
  now,
  targets,
  drag,
  menuOpen,
  error,
  onOpen,
  onMenu,
  onMove,
  onDrag,
}: {
  entry: BoardEntry;
  item: ViewItem | undefined;
  detail: CardDetail | undefined;
  slip: SlippingItem | undefined;
  now: string;
  /** What each stage would do to this card. */
  targets: MoveTarget[];
  /** The card's state while it is in the hand. */
  drag: Drag | null;
  menuOpen: boolean;
  /** Why the last move of this card was not accepted. */
  error: string | null;
  onOpen: (r: ItemRef) => void;
  onMenu: (open: boolean) => void;
  onMove: (stage: CommonStage) => void;
  onDrag: (drag: Drag | null) => void;
}) {
  const id = cardKey(entry);
  const movable = targets.some((t) => t.accepts);
  const status = item ? statusTerm(item.kind, item.status) : SHORTLISTED;
  const mark = detail ? MARK[detail.mark] : undefined;
  const reason = slip
    ? VOCABULARY.slipping.find((x) => x.value === slip.reasons[0])
    : undefined;
  const value = valueText(detail?.value);
  const ago = detail?.changedAt ? agoText(detail.changedAt, now) : "";
  const changed = ago ? (
    <span className="pb-card__meta">
      {entry.kind === "investor-row" ? "List changed" : "Changed"} {ago}
    </span>
  ) : null;
  // With nothing slipping and no value, "changed" shares the status line.
  const inFoot = !reason && !value;
  return (
    <div
      className={`pb-card${drag ? (drag.away ? " is-away" : " is-lifted") : ""}`}
      role="button"
      tabIndex={0}
      data-card={id}
      draggable={movable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", entry.name);
        e.dataTransfer.effectAllowed = "move";
        onDrag({ key: id, targets, away: false });
        // The picture that follows the pointer is taken lifted; the place it left then fades.
        requestAnimationFrame(() => onDrag({ key: id, targets, away: true }));
      }}
      onDragEnd={() => onDrag(null)}
      onClick={() => onOpen(entry)}
      onKeyDown={(e) =>
        e.key === "Enter" && e.target === e.currentTarget && onOpen(entry)
      }
    >
      <div className="pb-card__kind">
        {mark ? <Icon name={mark.icon} /> : null}
        {mark?.label}
        <button
          type="button"
          className="pb-btn pb-btn--ghost pb-btn--sm pb-card__move"
          aria-expanded={menuOpen}
          onClick={(e) => {
            e.stopPropagation();
            onMenu(!menuOpen);
          }}
        >
          Move to…
        </button>
        {item ? <OwnerAvatar owner={item.owner} /> : null}
      </div>
      <div className="pb-card__title">{entry.name || "Untitled"}</div>
      {detail?.organisation ? (
        <div className="pb-card__row" title="Organisation">
          <Icon name="organisations" className="pb-icon pb-icon--xs" />
          <span>{detail.organisation}</span>
        </div>
      ) : null}
      {detail?.nextStep ? (
        <div className="pb-card__row" title="Next step">
          <Icon name="checklist" className="pb-icon pb-icon--xs" />
          <span>{detail.nextStep.text}</span>
          {detail.nextStep.day ? (
            <span className="pb-card__date">
              · {fmtDay(dayInstant(detail.nextStep.day))}
            </span>
          ) : null}
        </div>
      ) : null}
      {detail?.proposal ? (
        <div className="pb-card__row">
          <ProposalBadge badge={detail.proposal} />
        </div>
      ) : null}
      <div className="pb-card__foot">
        <span className={`pb-tag pb-tag--${status?.tone ?? "default"}`}>
          {status?.label ?? "Not set"}
        </span>
        {value ? <span className="pb-card__value">{value}</span> : null}
        {inFoot ? changed : null}
      </div>
      {!inFoot && (reason || changed) ? (
        <div className="pb-card__end">
          {reason ? (
            <SlipSignal
              term={reason}
              since={sinceFor(slip?.since, reason.value)}
            />
          ) : null}
          {changed}
        </div>
      ) : null}
      {menuOpen ? (
        <MoveList
          targets={targets}
          onMove={onMove}
          onClose={() => onMenu(false)}
        />
      ) : null}
      <ErrorLine message={error} />
    </div>
  );
}

/**
 * The relationships in their four stages. Closed folds away until asked for; a
 * stage with nothing in it folds to a strip. A card moves to another stage by
 * dragging it there or with its "Move to…" list; what a move does, asks or
 * refuses comes from the kit (`cardMove`), which follows the records' rules.
 */
export function OverviewBoard({
  board,
  byKey,
  slipByKey,
  cards,
  now,
  showClosed,
  onShowClosed,
  onOpen,
}: {
  board: Board;
  byKey: Map<string, ViewItem>;
  slipByKey: Map<string, SlippingItem>;
  cards: Map<string, CardDetail>;
  /** The current instant, for "changed 2 days ago". */
  now: string;
  /** Whether the Closed column is open; the view keeps it across board and table. */
  showClosed: boolean;
  onShowClosed: (show: boolean) => void;
  onOpen: (r: ItemRef) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const facts = moveCards({
    leads: (useLeadDocumentsInSelectedDrive() ?? []).map(plain),
    opportunities: (useOpportunityDocumentsInSelectedDrive() ?? []).map(plain),
    investorLists: (useInvestorListDocumentsInSelectedDrive() ?? []).map(plain),
  });
  const [drag, setDrag] = useState<Drag | null>(null);
  const [over, setOver] = useState<CommonStage | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ key: string; message: string } | null>(
    null,
  );

  const targetsOf = (e: BoardEntry): MoveTarget[] => {
    const card = facts.get(cardKey(e));
    return card ? moveTargets(card) : [];
  };

  /** Sends the move to the card's record; a refusal shows beside the card, which stays where the record says. */
  const apply = (entry: BoardEntry, option: MoveOption, reason?: string) => {
    const key = cardKey(entry);
    setBusy(true);
    setError(null);
    const refuse = (errors: Error[]) =>
      setError({
        key,
        message: errors.at(0)?.message ?? "That was not accepted.",
      });
    dispatchActions(moveAction(option, reason), entry.id, refuse)
      .catch((e: unknown) => refuse(e instanceof Error ? [e] : []))
      .finally(() => {
        setBusy(false);
        setAsk(null);
      });
  };

  /** Puts a card on a stage: sets the one status at once, or asks first. */
  const move = (entry: BoardEntry, stage: CommonStage) => {
    const card = facts.get(cardKey(entry));
    if (!card) return;
    const outcome = cardMove(card, stage);
    setMenu(null);
    setError(null);
    if (outcome.kind === "set") apply(entry, outcome.option);
    else if (outcome.kind !== "stay" && outcome.kind !== "refused")
      setAsk({ entry, stage, outcome });
  };

  /** Closes the question and gives the focus back to the card, which never left. */
  const cancel = () => {
    const key = ask ? cardKey(ask.entry) : "";
    setAsk(null);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLElement>(`[data-card="${CSS.escape(key)}"]`)
        ?.focus(),
    );
  };

  const dragged = drag
    ? STAGES.flatMap((s) => board[s]).find((e) => cardKey(e) === drag.key)
    : undefined;

  /** What a stage shows and does while a card is in the hand. */
  const dropZone = (stage: CommonStage) => {
    const target = drag?.targets.find((t) => t.stage === stage);
    const state = !target
      ? ""
      : target.accepts
        ? " is-target"
        : target.outcome.kind === "refused"
          ? " is-refused"
          : "";
    const hint = target ? moveHint(target.outcome) : "";
    return {
      className: `${state}${over === stage && state ? " is-over" : ""}`,
      hint: hint ? (
        <div className="pb-board__hint">
          <Icon name={target?.accepts ? "arrow-right" : "info"} />
          {hint}
        </div>
      ) : null,
      handlers: {
        onDragOver: (e: React.DragEvent) => {
          if (!target) return;
          if (target.accepts) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }
          if (over !== stage) setOver(stage);
        },
        onDragLeave: (e: React.DragEvent) => {
          const to = e.relatedTarget;
          if (!(to instanceof Node && e.currentTarget.contains(to)))
            setOver((o) => (o === stage ? null : o));
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          setDrag(null);
          setOver(null);
          if (dragged && target?.accepts) move(dragged, stage);
        },
      },
    };
  };

  return (
    <div className="pb-board pb-board--fit" ref={root}>
      {STAGES.map((stage) => {
        const term = VOCABULARY.commonStage.find((t) => t.value === stage)!;
        const entries = board[stage];
        const asking = ask?.stage === stage ? ask : null;
        // A folded stage opens while it holds a question.
        const mode = asking
          ? "open"
          : columnMode(stage, entries.length, showClosed);
        const zone = dropZone(stage);
        const folded = (
          <span className="pb-board__vertical">
            <span className="pb-tag pb-tag--default">{term.label}</span>
            <span>{entries.length}</span>
          </span>
        );
        if (mode === "empty")
          return (
            <div
              key={stage}
              className={`pb-board__col pb-board__col--collapsed pb-board__col--empty${zone.className}`}
              title={`Nothing is ${term.label.toLowerCase()}`}
              {...zone.handlers}
            >
              {folded}
              {zone.hint}
            </div>
          );
        if (mode === "collapsed")
          return (
            <div
              key={stage}
              className={`pb-board__col pb-board__col--collapsed${zone.className}`}
              title="Show closed"
              role="button"
              tabIndex={0}
              onClick={() => onShowClosed(true)}
              onKeyDown={(e) => e.key === "Enter" && onShowClosed(true)}
              {...zone.handlers}
            >
              {folded}
              {zone.hint}
            </div>
          );
        return (
          <div
            className={`pb-board__col${zone.className}`}
            key={stage}
            {...zone.handlers}
          >
            <div className="pb-board__head">
              <span className={`pb-tag pb-tag--${term.tone}`}>
                {term.label}
              </span>
              <span>{entries.length}</span>
              {stage === "CLOSED" && entries.length > 0 && showClosed ? (
                <button
                  className="pb-btn pb-btn--ghost pb-btn--sm"
                  onClick={() => onShowClosed(false)}
                >
                  Hide
                </button>
              ) : null}
            </div>
            {zone.hint}
            {asking ? (
              <MoveAsk
                key={cardKey(asking.entry)}
                name={asking.entry.name}
                stage={term.label}
                outcome={asking.outcome}
                busy={busy}
                onApply={(option, reason) =>
                  apply(asking.entry, option, reason)
                }
                onOpenRecord={() => onOpen(asking.entry)}
                onCancel={cancel}
              />
            ) : null}
            {entries.map((e) => {
              const id = cardKey(e);
              return (
                <BoardCard
                  key={id}
                  entry={e}
                  item={byKey.get(key(e))}
                  detail={cards.get(id)}
                  slip={slipByKey.get(key(e))}
                  now={now}
                  targets={targetsOf(e)}
                  drag={drag?.key === id ? drag : null}
                  menuOpen={menu === id}
                  error={error?.key === id ? error.message : null}
                  onOpen={onOpen}
                  onMenu={(open) => setMenu(open ? id : null)}
                  onMove={(to) => move(e, to)}
                  onDrag={(d) => {
                    setDrag(d);
                    if (d) {
                      setAsk(null);
                      setMenu(null);
                    } else setOver(null);
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
