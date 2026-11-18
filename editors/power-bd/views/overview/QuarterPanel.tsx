import type { LeadState } from "document-models/lead";
import type { OpportunityState } from "document-models/opportunity";
import type { ProposalState } from "document-models/proposal";
import type { BdSettingsState } from "document-models/bd-settings";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import { useGoToPlace } from "../../components/PlaceContext.js";
import { Explain } from "../../components/shared/Explain.js";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";
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

/** Up to three names, then how many more. */
const SHOW_NAMES = 3;

/**
 * This quarter beside its targets, and the forecast of the open leads, both
 * worked out from the records. The figures come first; what is missing says
 * what to do about it, and how each is worked out stays one click away.
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
  const open = useSetSelectedNode();
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

  const noValue = f.noValue;
  const unnamed = noValue.length - SHOW_NAMES;
  // The leads that need a price, each one click from its page.
  const names = (
    <>
      {noValue.slice(0, SHOW_NAMES).map((l, i) => (
        <span key={l.id}>
          {i > 0 ? ", " : ""}
          <button type="button" className="pb-link" onClick={() => open(l.id)}>
            {l.name}
          </button>
        </span>
      ))}
      {unnamed > 0 ? ` and ${unnamed} more` : ""}
    </>
  );

  return (
    <div className="pb-grid-2">
      <section className="pb-section" aria-label="This quarter">
        <div className="pb-section__head">
          <h2 className="pb-section__title">This quarter</h2>
          <span className="pb-faint pb-small">
            {quarterLabel(quarter)}
            {targets.length === 0 ? " · no targets yet" : ""}
          </span>
          <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={() => goTo("settings")}>
            {targets.length === 0 ? "Set targets" : "Edit targets"}
          </button>
        </div>
        <div className="pb-goals">
          {actuals.map((a) => {
            const money = a.metric === "VALUE_PROPOSED";
            const counted = money ? a.amounts.length > 0 : a.actual > 0;
            const shown = money
              ? counted
                ? a.amounts.map((x) => formatMoneyCompact(x.amount, x.currency)).join(" · ")
                : "None yet"
              : String(a.actual);
            return (
              <div className="pb-goal" key={a.metric}>
                <span className="pb-goal__label">{metricLabel(a.metric)}</span>
                <span className={`pb-goal__value${!counted && a.target === null ? " pb-goal__value--none" : ""}`}>
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
        <Explain label="How it's counted">
          From the records, in the team's time zone: meetings held on leads and funding opportunities, proposals sent and the value
          they proposed (the lower end of a range), and leads won.
        </Explain>
      </section>

      <section className="pb-section" aria-label="Forecast">
        <div className="pb-section__head">
          <h2 className="pb-section__title">Forecast</h2>
          <span className="pb-faint pb-small">weighted by stage</span>
        </div>
        {f.rows.length === 0 ? (
          <p className="pb-muted pb-small">
            {noValue.length > 0 ? (
              <>
                Nothing to forecast yet. {noValue.length === 1 ? "This open lead has" : "These open leads have"} no priced proposal: {names}.
              </>
            ) : (
              "Nothing to forecast yet. No open lead has a priced proposal."
            )}
          </p>
        ) : (
          <table className="pb-table pb-table--compact">
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
        {f.rows.length > 0 && noValue.length > 0 ? (
          <p className="pb-reassure">
            <Icon name="info" />
            <span>
              {noValue.length} open {noValue.length === 1 ? "lead has" : "leads have"} no priced proposal yet, so{" "}
              {noValue.length === 1 ? "it isn't" : "they aren't"} counted: {names}.
            </span>
          </p>
        ) : null}
        {f.noCloseDate > 0 ? (
          <p className="pb-reassure">
            <Icon name="info" />
            <span>
              {f.noCloseDate} counted {f.noCloseDate === 1 ? "lead has" : "leads have"} no expected close date yet.
            </span>
          </p>
        ) : null}
        {f.investors > 0 ? (
          <p className="pb-reassure">
            <Icon name="info" />
            <span>Investor leads bring funding, not revenue, so they aren't forecast.</span>
          </p>
        ) : null}
        <Explain label="How it's worked out">
          Open leads with a live proposal, weighted by how far along they are ({CHANCES}). Currencies are never converted.
        </Explain>
      </section>
    </div>
  );
}
