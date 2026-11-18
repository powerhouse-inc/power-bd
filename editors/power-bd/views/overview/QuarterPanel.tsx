import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";
import type { BdSettingsState } from "document-models/bd-settings";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { useGoToPlace } from "../../components/PlaceContext.js";
import { STAGE_CHANCE, forecast, quarterOf } from "../../kit/forecast/index.js";
import { formatMoneyCompact } from "../../kit/format/index.js";
import type { LeadValue } from "../../kit/overview/types.js";
import { quarterActuals, quarterLabel, targetsOf } from "../../kit/targets/index.js";

type Rec<S> = { id: string; state: S };

const percent = (n: number) => `${Math.round(n * 100)}%`;
const metricLabel = (m: string) => VOCABULARY.targetMetric.find((t) => t.value === m)?.label ?? m;
const CHANCES = Object.entries(STAGE_CHANCE)
  .map(([status, chance]) => `${VOCABULARY.leadStatus.find((t) => t.value === status)?.label ?? status} ${percent(chance)}`)
  .join(", ");

/**
 * This quarter beside its targets, and the forecast of the open leads, both
 * worked out from the records. Each says what it rests on and what is missing.
 */
export function QuarterPanel({
  leads,
  opportunities,
  proposals,
  settings,
  leadValues,
  today,
  zone,
}: {
  leads: readonly Rec<LeadState>[];
  opportunities: readonly Rec<OpportunityState>[];
  proposals: readonly Rec<ProposalState>[];
  settings: BdSettingsState | undefined;
  leadValues: Partial<Record<string, LeadValue[]>>;
  today: string;
  zone: string;
}) {
  const goTo = useGoToPlace();
  const quarter = quarterOf(today);
  const targets = targetsOf(settings).filter((t) => t.quarter === quarter);
  const actuals = quarterActuals({ leads, opportunities, proposals }, quarter, targets, zone);
  const f = forecast(
    leads.map((l) => ({
      id: l.id,
      name: l.state.name ?? "Untitled lead",
      status: l.state.status,
      kind: l.state.kind,
      expectedCloseDate: l.state.expectedCloseDate ?? null,
      value: leadValues[l.id] ?? [],
    })),
  );

  return (
    <div className="pb-grid-2">
      <section className="pb-section" aria-label="This quarter">
        <div className="pb-section__head">
          <h2 className="pb-section__title">This quarter</h2>
          <span className="pb-faint pb-small">{quarterLabel(quarter)}</span>
        </div>
        {targets.length === 0 ? (
          <p className="pb-faint pb-small">
            No targets for {quarterLabel(quarter)} yet.{" "}
            <button type="button" className="pb-link" onClick={() => goTo("settings")}>
              Set them in Settings
            </button>
          </p>
        ) : null}
        <div className="pb-goals">
          {actuals.map((a) => {
            const money = a.metric === "VALUE_PROPOSED";
            const shown = money
              ? a.amounts.length === 0
                ? "None yet"
                : a.amounts.map((x) => formatMoneyCompact(x.amount, x.currency)).join(" · ")
              : String(a.actual);
            return (
              <div className="pb-goal" key={a.metric}>
                <span className="pb-goal__label">{metricLabel(a.metric)}</span>
                <span className="pb-goal__value">
                  {shown}
                  {a.target !== null ? (
                    <span className="pb-faint"> of {money ? a.target.toLocaleString("en-GB") : a.target}</span>
                  ) : null}
                </span>
                {a.share !== null ? (
                  <span className={`pb-goal__bar${a.share >= 1 ? " is-met" : ""}`} aria-label={`${percent(a.share)} of the target`}>
                    <span className="pb-goal__fill" style={{ width: `${Math.min(100, Math.round(a.share * 100))}%` }} />
                  </span>
                ) : a.target !== null && money && a.amounts.length > 1 ? (
                  <span className="pb-faint pb-small">In several currencies: not compared</span>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="pb-faint pb-small">
          From the records: held meetings on leads and funding, proposals sent and their value (the lower end of a range), leads won.
        </p>
      </section>

      <section className="pb-section" aria-label="Forecast">
        <div className="pb-section__head">
          <h2 className="pb-section__title">Forecast</h2>
        </div>
        {f.rows.length === 0 ? (
          <p className="pb-faint pb-small">No open lead has a proposal with a price yet, so there is nothing to forecast.</p>
        ) : (
          <table className="pb-table">
            <thead>
              <tr>
                <th>Expected close</th>
                <th className="pb-num">Weighted</th>
                <th className="pb-num">If all close</th>
                <th className="pb-num">Leads</th>
              </tr>
            </thead>
            <tbody>
              {f.rows.map((r) => (
                <tr key={`${r.quarter ?? "none"}-${r.currency}`}>
                  <td>{r.quarter ? quarterLabel(r.quarter) : <span className="pb-faint">No close date</span>}</td>
                  <td className="pb-num">{formatMoneyCompact(r.weighted, r.currency)}</td>
                  <td className="pb-num pb-faint">{formatMoneyCompact(r.full, r.currency)}</td>
                  <td className="pb-num">{r.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="pb-faint pb-small">
          <Icon name="info" className="pb-icon pb-icon--xs" /> Open leads with a live proposal, weighted by how far along they are ({CHANCES}). Currencies are never converted.
        </p>
        {f.noValue.length > 0 || f.noCloseDate > 0 || f.investors > 0 ? (
          <ul className="pb-forecast__missing">
            {f.noValue.length > 0 ? (
              <li title={f.noValue.map((l) => l.name).join(", ")}>
                {f.noValue.length} open {f.noValue.length === 1 ? "lead has" : "leads have"} no proposal value yet: not counted
              </li>
            ) : null}
            {f.noCloseDate > 0 ? (
              <li>
                {f.noCloseDate} counted {f.noCloseDate === 1 ? "lead has" : "leads have"} no expected close date
              </li>
            ) : null}
            {f.investors > 0 ? <li>Investor leads bring funding, not revenue: not forecast</li> : null}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
