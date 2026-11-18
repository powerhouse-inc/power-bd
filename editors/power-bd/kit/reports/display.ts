import { MIN_SAMPLE, percent, type Funnel, type Outcomes } from "./reports.js";

/** A headline figure as its tile shows it: a value, or null while too few leads stand behind it. */
export type TileView = {
  label: string;
  value: string | null;
  sub: string;
  /** "signal" when the tile points at something to do now. */
  tone: "plain" | "signal";
};

/**
 * The four headline figures. A rate that can't be worked out yet shows no
 * value and says when it will, instead of being the loudest thing on the page.
 */
export function reportTiles(o: Outcomes, entered: number, quiet: number, periodLabel: string): TileView[] {
  const closed = o.won + o.lost;
  return [
    {
      label: "Win rate",
      value: o.winRate === null ? null : percent(o.winRate),
      sub: o.winRate === null ? `Shows once ${MIN_SAMPLE} have closed · ${closed} so far` : `${o.won} won, ${o.lost} lost`,
      tone: "plain",
    },
    {
      label: "Days to win",
      value: o.medianDaysToWin === null ? null : String(Math.round(o.medianDaysToWin)),
      sub: o.medianDaysToWin === null ? `Shows once ${MIN_SAMPLE} are won · ${o.won} so far` : "Median, from being added",
      tone: "plain",
    },
    { label: "Added", value: String(entered), sub: `Leads, ${periodLabel}`, tone: "plain" },
    {
      label: "Gone quiet",
      value: String(quiet),
      sub: quiet > 0 ? "Open, no change in 30 days" : "Every open lead changed in 30 days",
      tone: quiet > 0 ? "signal" : "plain",
    },
  ];
}

/** Said once under the funnel when a stage has too few leads before it for a share; null when every share shows. */
export function funnelNote(f: Funnel): string | null {
  return f.steps.some((s, i) => i > 0 && s.fromPrevious === null)
    ? `A share between stages shows once ${MIN_SAMPLE} leads reach the stage before.`
    : null;
}

/** One line for a period with nothing lost and nothing parked; null when there are reasons to show. */
export function reasonsNote(lost: number, parked: number, allTime: boolean): string | null {
  if (lost > 0 || parked > 0) return null;
  return allTime ? "No lead has been lost yet, and none is parked." : "No lead was lost in the period, and none is parked.";
}
