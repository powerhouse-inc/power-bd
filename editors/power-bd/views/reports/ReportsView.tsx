import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { EmptyPlace } from "../../components/EmptyPlace.js";
import { Explain } from "../../components/shared/Explain.js";
import { Icon } from "../../components/Icon.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { useToday } from "../../components/shared/useToday.js";
import {
  useBdSettingsDocumentsInSelectedDrive,
  useLeadDocumentsInSelectedDrive,
} from "../../components/useDriveDocuments.js";
import {
  MIN_SAMPLE,
  PERIODS,
  funnel,
  funnelNote,
  reasonsNote,
  reportTiles,
  lostReasons,
  outcomes,
  parkedReasons,
  percent,
  periodStart,
  quietLeads,
  bySource,
  splitBy,
  type Period,
  type ReasonGroup,
  type ReportLead,
  type SplitRow,
} from "../../kit/reports/index.js";
import { settingsOrDefaults } from "../../kit/settings/index.js";

/** What the breakdown can split the leads by. */
const SPLITS = [
  { value: "owner", label: "Owner" },
  { value: "kind", label: "Kind" },
  { value: "source", label: "Where they came from" },
] as const;
type Split = (typeof SPLITS)[number]["value"];

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
    <div className="pb-table-wrap pb-table-wrap--narrow">
      <table className="pb-table pb-table--compact">
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
              <td className="pb-num">
                {r.winRate === null ? (
                  <span className="pb-faint" title={`Shows once ${MIN_SAMPLE} have closed`}>—</span>
                ) : (
                  percent(r.winRate)
                )}
              </td>
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
  const [split, setSplit] = useState<Split>("owner");

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
      source: d.state.global.source ?? null,
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
  const allTime = period === "all" || start === null;
  const tiles = reportTiles(o, f.entered, quietCount, periodLabel);
  const stepsNote = funnelNote(f);
  const nothingLost = reasonsNote(lost.length, parked.length, allTime);
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
      <div className="pb-tiles">
        {tiles.map((tile) =>
          tile.tone === "signal" ? (
            <button
              type="button"
              key={tile.label}
              className="pb-tile pb-tile--signal"
              onClick={() => document.getElementById("reports-quiet")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <span className="pb-tile__label">{tile.label}</span>
              <span className="pb-tile__value">{tile.value}</span>
              <span className="pb-tile__sub">{tile.sub}</span>
            </button>
          ) : (
            <div className="pb-tile pb-tile--static" key={tile.label}>
              <span className="pb-tile__label">{tile.label}</span>
              {tile.value === null ? (
                <span className="pb-tile__value pb-tile__value--none" aria-label="Not enough leads yet">
                  —
                </span>
              ) : (
                <span className="pb-tile__value">{tile.value}</span>
              )}
              <span className="pb-tile__sub">{tile.sub}</span>
            </div>
          ),
        )}
      </div>
      <Explain label="How these are counted">
        A period counts the leads added, won or lost in it. A share needs at least {MIN_SAMPLE} leads behind it, so a rate shows only
        once {MIN_SAMPLE} leads have closed in the period.
      </Explain>

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
                {i > 0 && s.fromPrevious !== null ? (
                  <div className="pb-funnel__step">{percent(s.fromPrevious)} went on</div>
                ) : null}
                <div className={`pb-funnel__row${s.reached === 0 ? " pb-funnel__row--none" : ""}`}>
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
        {f.entered > 0 && stepsNote ? <p className="pb-small pb-faint">{stepsNote}</p> : null}
        {f.unknown > 0 || investorsAdded ? (
          <Explain label="About these steps">
            {f.unknown > 0
              ? `${f.unknown === 1 ? "One lead is" : `${f.unknown} leads are`} counted as added but not in the steps: a lost lead, or a parked one without a stage, has no record of how far it got. `
              : ""}
            {investorsAdded ? "Investor leads stop at met, so the steps into proposal and won count the other kinds." : ""}
          </Explain>
        ) : null}
      </section>

      <section className="pb-section" id="reports-quiet">
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
          <h2 className="pb-section__title">Why leads are lost</h2>
        </div>
        {nothingLost ? (
          <p className="pb-muted">{nothingLost}</p>
        ) : (
          <>
            {lost.length === 0 ? (
              <p className="pb-muted">No lead was lost {allTime ? "yet" : "in the period"}.</p>
            ) : (
              <Reasons groups={lost} onOpen={select} />
            )}
            <h3 className="pb-overline">Parked now</h3>
            {parked.length === 0 ? <p className="pb-muted">No lead is parked.</p> : <Reasons groups={parked} onOpen={select} />}
            <Explain label="How reasons are grouped">
              A reason joins a theme only when its words name that theme alone; otherwise it stays as written.
            </Explain>
          </>
        )}
      </section>


      <section className="pb-section pb-section--narrow">
        <div className="pb-section__head">
          <h2 className="pb-section__title">Breakdown</h2>
          <div className="pb-segmented" role="group" aria-label="Break the leads down by">
            {SPLITS.map((s) => (
              <button
                key={s.value}
                type="button"
                className={`pb-segmented__item${split === s.value ? " is-active" : ""}`}
                aria-pressed={split === s.value}
                onClick={() => setSplit(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {split === "owner" ? (
          <SplitTable title="Owner" rows={splitBy(leads, (l) => l.owner ?? "", start, zone)} name={(k) => (k ? team.ownerName(k) : "No owner")} />
        ) : split === "kind" ? (
          <SplitTable title="Kind" rows={splitBy(leads, (l) => l.kind ?? "", start, zone)} name={kindLabel} />
        ) : (
          <SplitTable
            title="Came from"
            rows={bySource(leads, start, zone)}
            name={(k) => VOCABULARY.leadSource.find((t) => t.value === k)?.label ?? "Not recorded"}
          />
        )}
      </section>
    </div>
  );
}
