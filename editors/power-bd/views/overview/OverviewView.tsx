import { useUser } from "@powerhousedao/reactor-browser";
import { useRef, useState } from "react";
import { EmptyPlace } from "../../components/EmptyPlace.js";
import { fmtDay } from "../../components/shared/relationship/common.js";
import { formatMoneyCompact } from "../../kit/format/index.js";
import { filterItems, type ItemRef } from "../../kit/overview/index.js";
import { today as dayOf } from "../../kit/overview/time.js";
import {
  cardDetails,
  dueForMe,
  dueStrip,
  groupDueByDay,
  overviewModel,
  openToWatch,
  slippingForMe,
  tileActive,
  tileView,
  visibleBoard,
  type BoardTile,
  type BoardViewState,
} from "../../kit/overview-view/index.js";
import { AttentionPanel } from "./AttentionPanel.js";
import { ComingUp } from "./ComingUp.js";
import { dayInstant } from "./display.js";
import { SetupGuide } from "./first-run/SetupGuide.js";
import { useSetup } from "./first-run/useSetup.js";
import { OverviewBoard } from "./OverviewBoard.js";
import { OverviewFilters } from "./OverviewFilters.js";
import { OverviewTable } from "./OverviewTable.js";
import { SummaryTiles, type Tile } from "./SummaryTiles.js";
import { QuarterPanel } from "./QuarterPanel.js";
import { useNow } from "../../components/shared/useNow.js";
import { useBdSettingsDocumentsInSelectedDrive, useContactDocumentsInSelectedDrive, useDecisionDocumentsInSelectedDrive, useInvestorListDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive, useProposalDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";

/** A document's id and its global state, the shape the kit reads. */
const plain = <S,>(d: { header: { id: string }; state: { global: S } }) => ({
  id: d.header.id,
  state: d.state.global,
});

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/** The landing place: the headline figures, what needs attention with its fix, what is coming up, and every relationship on one board or table. */
export function OverviewView({ driveId }: { driveId: string }) {
  const select = useSetSelectedNode();
  const setup = useSetup(driveId);
  const address = useUser()?.address ?? null;
  const settings = useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global;
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const opps = useOpportunityDocumentsInSelectedDrive() ?? [];
  const lists = useInvestorListDocumentsInSelectedDrive() ?? [];
  const decisions = useDecisionDocumentsInSelectedDrive() ?? [];
  const proposals = useProposalDocumentsInSelectedDrive() ?? [];
  const contacts = useContactDocumentsInSelectedDrive() ?? [];

  const [mineAttention, setMineAttention] = useState(false);
  const [mineDue, setMineDue] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const [view, setView] = useState<BoardViewState>({
    asTable: false,
    kind: "",
    owner: "",
    status: "",
    mine: false,
  });
  const comingUp = useRef<HTMLElement>(null);
  const boardSection = useRef<HTMLDivElement>(null);

  const now = useNow();
  const {
    input,
    result,
    items,
    byKey,
    slipByKey,
    zone,
    windowDays,
    relationships,
    openDecisions,
    overdueDecisions,
    totals,
  } = overviewModel(
    {
      now,
      leads: leads.map(plain),
      opportunities: opps.map(plain),
      investorLists: lists.map(plain),
      decisions: decisions.map(plain),
      proposals: proposals.map(plain),
    },
    settings,
  );
  const today = dayOf(now, zone);

  const slipping = slippingForMe(
    result.slipping,
    items,
    mineAttention ? address : null,
  );
  const due = dueForMe(result.due, mineDue ? address : null);
  const days = groupDueByDay(due);
  const strip = dueStrip(due, today, windowDays);

  const cards = cardDetails(input, {
    organisations: Object.fromEntries(
      contacts.map((c) => [c.header.id, c.state.global.name ?? ""]),
    ),
    changed: Object.fromEntries(
      [...leads, ...opps, ...lists].map((d) => [
        d.header.id,
        d.header.lastModifiedAtUtcIso,
      ]),
    ),
    leadValues: result.leadValues,
  });

  const boardFilter = {
    ...(view.kind ? { kind: view.kind } : {}),
    ...(view.owner ? { owner: view.owner } : {}),
    ...(view.status ? { status: view.status } : {}),
    ...(view.mine && address ? { owner: address } : {}),
  };
  const board = visibleBoard(result.board, items, boardFilter);
  const tableRows = filterItems(items, boardFilter);

  const open = (r: ItemRef) => select(r.id);
  const noRecords =
    leads.length + opps.length + lists.length + decisions.length === 0;

  const toBoard = (tile: BoardTile) => {
    setView(tileView(tile, view));
    boardSection.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  };
  const firstDue = result.due.at(0);
  const withAmount = totals.reduce((n, t) => n + t.count, 0);
  const tiles: Tile[] = [
    {
      id: "relationships",
      icon: "board",
      label: "Relationships",
      value: String(relationships),
      sub: `${result.board.NEW.length} new · ${result.board.ACTIVE.length} active · ${result.board.PARKED.length} parked`,
      hint: "Show every relationship on the board",
      onClick: () => toBoard("relationships"),
    },
    {
      id: "due",
      icon: "calendar",
      label: `Due in ${windowDays} days`,
      value: String(result.due.length),
      sub: firstDue
        ? `Next: ${fmtDay(dayInstant(firstDue.day))}`
        : "Nothing coming up",
      hint: "Go to what is coming up",
      onClick: () => {
        setMineDue(false);
        comingUp.current?.focus();
      },
    },
    {
      id: "decisions",
      icon: "decisions",
      label: "Open decisions",
      value: String(openDecisions),
      sub:
        openDecisions === 0
          ? "Nothing to decide"
          : overdueDecisions > 0
            ? `${overdueDecisions} overdue`
            : "None overdue",
      hint: "Show the open decisions in the table",
      pressed: tileActive("decisions", view),
      onClick: () => toBoard("decisions"),
    },
    {
      id: "funding",
      icon: "funding",
      label: "Open funding",
      value:
        totals.length > 0
          ? totals
              .map((t) => formatMoneyCompact(t.amount, t.currency))
              .join(" · ")
          : "None",
      sub:
        withAmount > 0
          ? `${plural(withAmount, "opportunity", "opportunities")} with an amount`
          : "No open opportunity has an amount",
      hint: "Show the funding opportunities",
      pressed: tileActive("funding", view),
      onClick: () => toBoard("funding"),
    },
  ];

  // First run: the guide stands in for the figures and the empty board.
  const { mode } = setup.progress;
  if (mode === "guide" || mode === "waiting")
    return (
      <div className="pb-page pb-page--wide">
        <div className="pb-page__head">
          <h1 className="pb-page__title">Overview</h1>
        </div>
        {mode === "guide" ? (
          <SetupGuide driveId={driveId} setup={setup} variant="guide" />
        ) : (
          <EmptyPlace
            icon="overview"
            title="Setting up your space"
            text="The set-up guide will appear here in a moment."
          />
        )}
      </div>
    );

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head">
        <h1 className="pb-page__title">Overview</h1>
        <div className="pb-pulse">
          <span className="pb-faint">
            {new Intl.DateTimeFormat("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: zone,
            }).format(new Date(now))}{" "}
            · times in {zone}
          </span>
        </div>
        <SummaryTiles tiles={tiles} />
      </div>

      {mode === "strip" ? (
        <SetupGuide driveId={driveId} setup={setup} variant="strip" />
      ) : null}

      {noRecords ? (
        <EmptyPlace
          icon="overview"
          title="Nothing here yet"
          text="Start a lead, a funding opportunity or an investor list. What needs attention shows here."
        />
      ) : null}

      <div className="pb-grid-2 pb-grid-2--attention">
        <AttentionPanel
          slipping={slipping}
          team={result.slipping.length}
          watching={openToWatch(input)}
          byKey={byKey}
          mine={mineAttention}
          canFilter={Boolean(address)}
          onMine={() => setMineAttention(!mineAttention)}
          onOpen={open}
        />
        <ComingUp
          ref={comingUp}
          days={days}
          strip={strip}
          today={today}
          windowDays={windowDays}
          mine={mineDue}
          canFilter={Boolean(address)}
          onMine={() => setMineDue(!mineDue)}
          onOpen={open}
        />
      </div>

      <QuarterPanel
        leads={leads.map(plain)}
        opportunities={opps.map(plain)}
        proposals={proposals.map(plain)}
        settings={settings}
        leadValues={result.leadValues}
        today={today}
        zone={zone}
      />

      <div className="pb-section" ref={boardSection}>
        <OverviewFilters
          view={view}
          onChange={(patch) => setView({ ...view, ...patch })}
          canFilter={Boolean(address)}
        />
        {view.asTable ? (
          <OverviewTable
            rows={tableRows}
            slipByKey={slipByKey}
            leadValues={result.leadValues}
            onOpen={open}
          />
        ) : (
          <OverviewBoard
            board={board}
            byKey={byKey}
            slipByKey={slipByKey}
            cards={cards}
            now={now}
            showClosed={showClosed}
            onShowClosed={setShowClosed}
            onOpen={open}
          />
        )}
      </div>
    </div>
  );
}
