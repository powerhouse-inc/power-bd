import { useUser } from "@powerhousedao/reactor-browser";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { useToday } from "../../components/shared/useToday.js";
import {
  useBdSettingsDocumentsInSelectedDrive,
  useDecisionDocumentsInSelectedDrive,
  useLeadDocumentsInSelectedDrive,
  useOpportunityDocumentsInSelectedDrive,
  useProposalDocumentsInSelectedDrive,
} from "../../components/useDriveDocuments.js";
import {
  addMonths,
  addableRecords,
  monthGrid,
  monthOf,
  monthTitle,
  weekDays,
  weekTitle,
} from "../../kit/calendar/index.js";
import { addDays, datedItems } from "../../kit/overview/index.js";
import { DUE_CLASSES } from "../../kit/overview-view/index.js";
import { settingsOrDefaults } from "../../kit/settings/index.js";
import { MineButton } from "../overview/MineButton.js";
import { CalendarDays } from "./CalendarDays.js";

const plain = <S,>(d: { header: { id: string }; state: { global: S } }) => ({
  id: d.header.id,
  state: d.state.global,
});

/**
 * The Calendar place: every dated item of the open records on its day, a
 * month or a week at a time, in the team's time zone. The team's own dates
 * move by dragging; next steps and meetings are added on a day.
 */
export function CalendarView(_props: { driveId: string }) {
  const select = useSetSelectedNode();
  const me = useUser()?.address ?? null;
  const { timeZone: zone } = settingsOrDefaults(
    useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global,
  );
  const today = useToday();
  const leads = (useLeadDocumentsInSelectedDrive() ?? []).map(plain);
  const opportunities = (useOpportunityDocumentsInSelectedDrive() ?? []).map(plain);
  const decisions = (useDecisionDocumentsInSelectedDrive() ?? []).map(plain);
  const proposals = (useProposalDocumentsInSelectedDrive() ?? []).map(plain);
  const [mode, setMode] = useState<"month" | "week">("month");
  const [anchor, setAnchor] = useState(today);
  const [mine, setMine] = useState(false);

  const all = datedItems({ leads, opportunities, decisions, proposals }, zone);
  const lower = me?.toLowerCase();
  const items =
    mine && lower ? all.filter((i) => i.people.some((p) => p.toLowerCase() === lower)) : all;
  const weeks = mode === "month" ? monthGrid(monthOf(anchor)) : [weekDays(anchor)];
  const title = mode === "month" ? monthTitle(monthOf(anchor)) : weekTitle(weeks[0]);
  const step = (n: number) =>
    setAnchor(mode === "month" ? `${addMonths(monthOf(anchor), n)}-01` : addDays(anchor, 7 * n));

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">Calendar</h1>
      </div>
      <div className="pb-toolbar pb-mb-8">
        <button type="button" className="pb-btn pb-btn--sm" onClick={() => setAnchor(today)}>
          Today
        </button>
        <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" aria-label="Earlier" onClick={() => step(-1)}>
          <Icon name="chevron-left" />
        </button>
        <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" aria-label="Later" onClick={() => step(1)}>
          <Icon name="chevron-right" />
        </button>
        <h2 className="pb-cal__title" aria-live="polite">
          {title}
        </h2>
        <span className="pb-toolbar__spacer" />
        <div className="pb-strip__legend">
          {DUE_CLASSES.map((c) => (
            <span key={c.value}>
              <span className={`pb-strip__mark pb-strip__mark--${c.value}`} />
              {c.one.replace(/^./, (l) => l.toUpperCase())}
            </span>
          ))}
        </div>
        <MineButton on={mine} disabled={!me} onClick={() => setMine(!mine)} />
        <div className="pb-segmented">
          {(["month", "week"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`pb-segmented__item${mode === m ? " is-active" : ""}`}
              onClick={() => setMode(m)}
            >
              {m === "month" ? "Month" : "Week"}
            </button>
          ))}
        </div>
      </div>
      <p className="pb-small pb-faint pb-mb-8">Times in {zone}</p>
      <CalendarDays
        weeks={weeks}
        month={mode === "month" ? monthOf(anchor) : null}
        items={items}
        today={today}
        zone={zone}
        records={addableRecords({ leads, opportunities })}
        me={me}
        onOpen={select}
        onMore={(day) => {
          setMode("week");
          setAnchor(day);
        }}
      />
    </div>
  );
}
