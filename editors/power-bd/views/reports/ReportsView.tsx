import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { EmptyPlace } from "../../components/EmptyPlace.js";
import { Icon } from "../../components/Icon.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { useToday } from "../../components/shared/useToday.js";
import {
  useBdSettingsDocumentsInSelectedDrive,
  useLeadDocumentsInSelectedDrive,
} from "../../components/useDriveDocuments.js";
import {
  PERIODS,
  funnel,
  lostReasons,
  outcomes,
  parkedReasons,
  percent,
  periodStart,
  quietLeads,
  splitBy,
  type Period,
  type ReasonGroup,
  type ReportLead,
  type SplitRow,
} from "../../kit/reports/index.js";
import { settingsOrDefaults } from "../../kit/settings/index.js";

const statusLabel = (status: string) =>
  VOCABULARY.leadStatus.find((t) => t.value === status)?.label ?? status;
const kindLabel = (kind: string) =>
  VOCABULARY.relationshipKind.find((t) => t.value === kind)?.label ?? "Kind not set";

/** One group of reasons: its name and count, and what was said, word for word, when opened. */
function Reasons({ groups, onOpen }: { groups: ReasonGroup[]; onOpen: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="pb-reasons">
      {groups.map((g) => {
        const expanded = open === g.label;
        return (
          <div className="pb-reason" key={g.label}>
            <button
              type="button"
              className="pb-disclosure"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : g.label)}
            >
              <Icon name="chevron-right" />
              {g.label}
            </button>
            <span className="pb-reason__count">{g.reasons.length}</span>
            {expanded ? (
              <ul className="pb-reason__said">
                {g.reasons.map((r, i) => (
                  <li key={`${r.leadId}-${i}`}>
                    “{r.text}” ·{" "}
                    <button type="button" className="pb-link" onClick={() => onOpen(r.leadId)}>
                      {r.leadName}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** The same counts per owner or per kind. */
function SplitTable({ title, rows, name }: { title: string; rows: SplitRow[]; name: (key: string) => string }) {
  return (
    <div className="pb-table-wrap">
      <table className="pb-table">
        <thead>
          <tr>
            <th>{title}</th>
            <th className="pb-num">Added</th>
            <th className="pb-num">Open now</th>
            <th className="pb-num">Won</th>
            <th className="pb-num">Lost</th>
            <th className="pb-num">Win rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{name(r.key)}</td>
              <td className="pb-num">{r.entered}</td>
              <td className="pb-num">{r.open}</td>
              <td className="pb-num">{r.won}</td>
              <td className="pb-num">{r.lost}</td>
              <td className="pb-num">{r.winRate === null ? <span className="pb-faint">Too few</span> : percent(r.winRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The Reports place: what converts, where leads go quiet and why they are lost,
 * for a period, from the leads in the space. Every number says what it counts;
 * a share needs at least three leads behind it, else it says there are too few.
 */
export function ReportsView(_props: { driveId: string }) {
  const docs = useLeadDocumentsInSelectedDrive() ?? [];
  const { timeZone: zone } = settingsOrDefaults(useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global);
  const today = useToday();
  const team = useTeam();
  const select = useSetSelectedNode();
  const [period, setPeriod] = useState<Period>("quarter");

  if (docs.length === 0)
    return (
      <div className="pb-page pb-page--wide">
        <div className="pb-page__head">
          <h1 className="pb-page__title">Reports</h1>
        </div>
        <EmptyPlace
          icon="chart"
          title="No reports yet"
          text="Reports show how far leads get, where they go quiet and why they are lost. They fill in as leads are added and closed."
        />
      </div>
    );

  const leads: ReportLead[] = docs.map((d) => {
    const s = d.state.global;
    return {
      id: d.header.id,
      name: s.name || "Untitled lead",
      kind: s.kind ?? null,
      owner: s.owner ?? null,
      status: s.status,
      parkedFrom: s.parkedFrom ?? null,
      statusReason: s.statusReason ?? null,
      closedAt: s.closedAt ?? null,
      createdAt: d.header.createdAtUtcIso,
      changedAt: d.header.lastModifiedAtUtcIso,
    };
  });
  const start = periodStart(period, today);
  const periodLabel = PERIODS.find((p) => p.value === period)?.label.toLowerCase() ?? "";
  const f = funnel(leads, start, zone);
  const o = outcomes(leads, start, zone);
  const lost = lostReasons(leads, start, zone);
  const parked = parkedReasons(leads);
  const quiet = quietLeads(leads, today, zone);
  const quietCount = quiet.reduce((n, s) => n + s.leads.length, 0);
  const investorsAdded = leads.some((l) => l.kind === "INVESTOR" && (start === null || l.createdAt.slice(0, 10) >= start));

  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">Reports</h1>
        <span className="pb-toolbar__spacer" />
        <div className="pb-segmented" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`pb-segmented__item${period === p.value ? " is-active" : ""}`}
              aria-pressed={period === p.value}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <p className="pb-small pb-faint pb-mb-8">
        A period counts the leads added, won or lost in it. A share needs at least three leads behind it.
      </p>

      <div className="pb-tiles">
        <div className="pb-tile pb-tile--static">
          <span className="pb-tile__label">Win rate</span>
          <span className="pb-tile__value">{o.winRate === null ? "Too few" : percent(o.winRate)}</span>
          <span className="pb-tile__sub">{o.won} won, {o.lost} lost</span>
        </div>
        <div className="pb-tile pb-tile--static">
          <span className="pb-tile__label">Days to win</span>
          <span className="pb-tile__value">{o.medianDaysToWin === null ? "Too few" : Math.round(o.medianDaysToWin)}</span>
          <span className="pb-tile__sub">Median, from being added</span>
        </div>
        <div className="pb-tile pb-tile--static">
          <span className="pb-tile__label">Added</span>
          <span className="pb-tile__value">{f.entered}</span>
          <span className="pb-tile__sub">Leads, {periodLabel}</span>
        </div>
        <div className="pb-tile pb-tile--static">
          <span className="pb-tile__label">Gone quiet</span>
          <span className="pb-tile__value">{quietCount}</span>
          <span className="pb-tile__sub">Open, no change in 30 days</span>
        </div>
      </div>

      <section className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">How far leads get</h2>
        </div>
        {f.entered === 0 ? (
          <p className="pb-muted">No lead was added {periodLabel === "all time" ? "yet" : `in the period (${periodLabel})`}.</p>
        ) : (
          <div className="pb-funnel">
            {f.steps.map((s, i) => (
              <div key={s.status}>
                {i > 0 ? (
                  <div className="pb-funnel__step">
                    {s.fromPrevious === null ? "Too few to say" : `${percent(s.fromPrevious)} went on`}
                  </div>
                ) : null}
                <div className="pb-funnel__row">
                  <span className="pb-funnel__label">{statusLabel(s.status)}</span>
                  <span className="pb-funnel__track">
                    <span
                      className={`pb-funnel__fill${s.status === "WON" ? " pb-funnel__fill--won" : ""}`}
                      style={{ width: `${(s.reached / f.entered) * 100}%` }}
                    />
                  </span>
                  <span className="pb-funnel__count">{s.reached}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {f.unknown > 0 ? (
          <p className="pb-small pb-faint">
            {f.unknown === 1 ? "One lead is" : `${f.unknown} leads are`} counted as added but not in the steps: a lost lead, or a parked one without a stage, has no record of how far it got.
          </p>
        ) : null}
        {investorsAdded ? (
          <p className="pb-small pb-faint">Investor leads stop at met, so the steps into proposal and won count the other kinds.</p>
        ) : null}
      </section>

      <section className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">Why leads are lost</h2>
        </div>
        {lost.length === 0 ? (
          <p className="pb-muted">No lead was lost {periodLabel === "all time" ? "yet" : "in the period"}.</p>
        ) : (
          <Reasons groups={lost} onOpen={select} />
        )}
        <h3 className="pb-overline">Parked now</h3>
        {parked.length === 0 ? <p className="pb-muted">No lead is parked.</p> : <Reasons groups={parked} onOpen={select} />}
        <p className="pb-small pb-faint">
          A reason joins a theme only when its words name that theme alone; otherwise it stays as written.
        </p>
      </section>

      <section className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">Where leads go quiet</h2>
        </div>
        {quiet.length === 0 ? (
          <p className="pb-muted">Every open lead has changed in the last 30 days.</p>
        ) : (
          <div className="pb-list">
            {quiet.map((s) => (
              <div key={s.status}>
                <div className="pb-list__group">
                  <strong>{statusLabel(s.status)}</strong> · {s.leads.length}
                </div>
                {s.leads.map((l) => (
                  <div
                    className="pb-list__item pb-clickable"
                    key={l.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => select(l.id)}
                    onKeyDown={(e) => e.key === "Enter" && select(l.id)}
                  >
                    <div className="pb-list__main">
                      <span className="pb-list__title">{l.name}</span>
                      <span className="pb-list__sub">No change for {l.days} days</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">By owner</h2>
        </div>
        <SplitTable title="Owner" rows={splitBy(leads, (l) => l.owner ?? "", start, zone)} name={(k) => (k ? team.ownerName(k) : "No owner")} />
      </section>
      <section className="pb-section">
        <div className="pb-section__head">
          <h2 className="pb-section__title">By kind</h2>
        </div>
        <SplitTable title="Kind" rows={splitBy(leads, (l) => l.kind ?? "", start, zone)} name={kindLabel} />
      </section>
    </div>
  );
}
