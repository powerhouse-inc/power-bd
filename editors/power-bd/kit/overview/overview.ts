import { buildBoard } from "./board.js";
import { buildDue } from "./due.js";
import { buildProposals } from "./proposals.js";
import { buildSlipping } from "./slipping.js";
import type { Overview, OverviewInput } from "./types.js";

/** Our time zone when the settings name none. */
const FALLBACK_ZONE = "UTC";

/** The board, what's due, what's slipping and each lead's live proposals, from plain records and the current instant. */
export function overview(input: OverviewInput): Overview {
  const zone = input.settings.timeZone || FALLBACK_ZONE;
  return {
    board: buildBoard(input),
    due: buildDue(input, zone),
    slipping: buildSlipping(input, zone),
    ...buildProposals(input.proposals),
  };
}
