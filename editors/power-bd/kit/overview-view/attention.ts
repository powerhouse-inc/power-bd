import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import type { OverviewInput, SlippingItem } from "../overview/index.js";
import { isClosedLead, isClosedOpportunity } from "../overview/status.js";

/**
 * What the attention count's colour says, so a zero never looks like an alarm:
 * red, act now (something overdue or missing); orange, have a look (only
 * second looks wait); green, all caught up (nothing of anyone's slips); grey,
 * nothing to say (nothing of yours while the team's items wait, or nothing
 * open to watch yet).
 */
export type AttentionTone = "alert" | "warn" | "clear" | "quiet";

export type AttentionState = {
  tone: AttentionTone;
  title: string;
  sub: string;
  /** What the card says under its head when nothing is listed. */
  note: string | null;
  /** The team's items "Mine" hides, offered to be shown; 0 when there are none. */
  teamWaiting: number;
};

/** The reasons that ask for a second look rather than a fix: the vocabulary's orange ones. */
const SECOND_LOOKS = new Set<string>(VOCABULARY.slipping.filter((t) => t.tone === "orange").map((t) => t.value));

/** The open relationships the attention list watches: leads and funding opportunities not closed. */
export function openToWatch(input: Pick<OverviewInput, "leads" | "opportunities">): number {
  return (
    input.leads.filter((l) => !isClosedLead(l.state.status)).length +
    input.opportunities.filter((o) => !isClosedOpportunity(o.state.status)).length
  );
}

/** The attention card's tone and words, from what it lists and what it doesn't. */
export function attentionState(
  shown: readonly SlippingItem[],
  { team, watching, mine }: { team: number; watching: number; mine: boolean },
): AttentionState {
  if (shown.length > 0) {
    const secondLooks = shown.every((s) => s.reasons.every((r) => SECOND_LOOKS.has(r)));
    return {
      tone: secondLooks ? "warn" : "alert",
      title: shown.length === 1 ? "needs attention" : "need attention",
      sub: "Most urgent first",
      note: null,
      teamWaiting: 0,
    };
  }
  if (mine && team > 0)
    return {
      tone: "quiet",
      title: "need attention",
      sub: "Nothing of yours",
      note: `Nothing of yours is slipping. ${team} of the team's ${team === 1 ? "needs" : "need"} attention.`,
      teamWaiting: team,
    };
  if (watching === 0)
    return {
      tone: "quiet",
      title: "need attention",
      sub: "Nothing open to watch yet",
      note: "Open leads and funding opportunities show here when something slips.",
      teamWaiting: 0,
    };
  return { tone: "clear", title: "All caught up", sub: "Nothing is slipping right now.", note: null, teamWaiting: 0 };
}
