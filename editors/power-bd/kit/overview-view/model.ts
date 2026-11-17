import { settingsOrDefaults } from "../settings/index.js";
import {
  overview,
  totalsPerCurrency,
  viewItems,
  type CommonStage,
  type ItemRef,
  type Overview,
  type OverviewInput,
  type ViewItem,
} from "../overview/index.js";
import { openOpportunities } from "./index.js";

const key = (r: Pick<ItemRef, "kind" | "id">) => `${r.kind}:${r.id}`;
const OPEN_STAGES: CommonStage[] = ["NEW", "ACTIVE", "PARKED"];

/** The records the Overview reads, without the settings. */
export type OverviewRecords = Omit<OverviewInput, "settings">;

/** What the Overview shows, worked out once from the records and the settings. */
export type OverviewModel = {
  input: OverviewInput;
  result: Overview;
  items: ViewItem[];
  /** Every item by `kind:id`. */
  byKey: Map<string, ViewItem>;
  /** The slipping entry of each item that slips, by `kind:id`. */
  slipByKey: Map<string, Overview["slipping"][number]>;
  /** The team's time zone, UTC when none is set. */
  zone: string;
  /** How many days ahead "Coming up" looks. */
  windowDays: number;
  /** Relationships that are not closed. */
  relationships: number;
  /** Open decisions. */
  openDecisions: number;
  /** Open funding, one total per currency. */
  totals: ReturnType<typeof totalsPerCurrency>;
};

/** Assembles the kit's input and the maps the Overview looks things up in. */
export function overviewModel(
  records: OverviewRecords,
  settings:
    | {
        timeZone?: string | null;
        dueWindowDays?: number | null;
      }
    | null
    | undefined,
): OverviewModel {
  const { timeZone: zone, dueWindowDays: windowDays } =
    settingsOrDefaults(settings);
  const input: OverviewInput = {
    ...records,
    settings: {
      timeZone: settings?.timeZone ?? null,
      dueWindowDays: windowDays,
    },
  };
  const result = overview(input);
  const items = viewItems(input);
  return {
    input,
    result,
    items,
    byKey: new Map(items.map((i) => [key(i), i])),
    slipByKey: new Map(result.slipping.map((s) => [key(s.source), s])),
    zone,
    windowDays,
    relationships: OPEN_STAGES.reduce((n, s) => n + result.board[s].length, 0),
    openDecisions: records.decisions.filter((d) => d.state.status === "OPEN")
      .length,
    totals: totalsPerCurrency(
      openOpportunities(records.opportunities, result.board),
    ),
  };
}
