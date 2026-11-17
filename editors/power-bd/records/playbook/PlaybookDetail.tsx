import type { PlaybookState } from "document-models/playbook";
import { EmptyStart } from "../../components/EmptyStart.js";
import { Icon } from "../../components/Icon.js";
import { NeverClaimsSection } from "../../views/playbook/NeverClaims.js";
import {
  NEW_POSITIONING_TITLE,
  PositioningSection,
} from "../../views/playbook/Positioning.js";
import { ProofCasesSection } from "../../views/playbook/ProofCases.js";
import type { Dispatch } from "../../views/playbook/run.js";

/** The playbook page: shown in the Playbook place and by the thin editor. */
export function PlaybookDetail({
  state,
  dispatch,
}: {
  state: PlaybookState;
  dispatch: Dispatch;
}) {
  const empty =
    state.positioning.length +
      state.proofCases.length +
      state.neverClaims.length ===
    0;
  return (
    <div className="pb-page">
      <div className="pb-page__head">
        <span className="pb-page__icon pb-page__icon--blue">
          <Icon name="playbook" />
        </span>
        <h1 className="pb-page__title">Playbook</h1>
      </div>
      {empty && (
        <EmptyStart
          icon="playbook"
          title="Your playbook is empty"
          text="The playbook holds what the team says about itself: its positioning, the proof behind it, and what it never claims."
          example={{
            title: "For funders",
            detail:
              "“We cut outage time for regional grid operators; a two-year pilot shows it.” It starts as a draft until a person approves it.",
          }}
          action={
            <button
              type="button"
              className="pb-btn pb-btn--primary"
              onClick={() =>
                document.getElementById(NEW_POSITIONING_TITLE)?.focus()
              }
            >
              <Icon name="plus" />
              Write your first positioning
            </button>
          }
        />
      )}
      <PositioningSection state={state} dispatch={dispatch} />
      <ProofCasesSection state={state} dispatch={dispatch} />
      <NeverClaimsSection state={state} dispatch={dispatch} />
    </div>
  );
}
