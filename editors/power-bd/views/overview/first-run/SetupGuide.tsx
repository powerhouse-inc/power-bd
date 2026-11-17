import { useState } from "react";
import { Icon } from "../../../components/Icon.js";
import type { SetupStep, SetupStepId } from "../../../kit/first-run/index.js";
import { OrganisationStep } from "./OrganisationStep.js";
import { RelationshipStep } from "./RelationshipStep.js";
import { StepsStrip } from "./StepsStrip.js";
import { TeamStep } from "./TeamStep.js";
import { TimeStep } from "./TimeStep.js";
import type { Setup } from "./useSetup.js";
import { VaultStep } from "./VaultStep.js";
import { useContactDocumentsInSelectedDrive } from "../../../components/useDriveDocuments.js";

/** The progress line: a ring that fills, and "2 of 5 done". */
function Progress({ done, total }: { done: number; total: number }) {
  // The ring's fill per step done comes from the design system (five steps).
  return (
    <span className="pb-guide__progress" role="status">
      <svg
        className="pb-ring"
        viewBox="0 0 36 36"
        aria-hidden="true"
        data-done={done}
      >
        <circle className="pb-ring__track" cx="18" cy="18" r="15" />
        <circle className="pb-ring__value" cx="18" cy="18" r="15" />
      </svg>
      <span>
        <strong>
          {done} of {total}
        </strong>{" "}
        done
      </span>
    </span>
  );
}

/**
 * The first-run guide on the Overview. As `guide` it stands in for the board:
 * a numbered strip, and one step's panel with a short form. As `strip` it is
 * one row above the board with the steps still left, opened on request.
 * Steps tick themselves from the drive's records.
 */
export function SetupGuide({
  driveId,
  setup,
  variant,
}: {
  driveId: string;
  setup: Setup;
  variant: "guide" | "strip";
}) {
  const { progress, settingsId } = setup;
  const organisations = useContactDocumentsInSelectedDrive()?.length ?? 0;
  /** The step the viewer chose; null follows the next step to do. */
  const [picked, setPicked] = useState<SetupStepId | null>(null);
  const [expanded, setExpanded] = useState(false);
  const openId = picked ?? progress.current;
  const step = progress.steps.find((s) => s.id === openId);
  const follow = () => setPicked(null);
  if (!settingsId) return null;

  const body = (s: SetupStep) => {
    switch (s.id) {
      case "team":
        return (
          <TeamStep
            settingsId={settingsId}
            onStay={() => setPicked("team")}
            onNext={follow}
          />
        );
      case "time":
        return <TimeStep settingsId={settingsId} onNext={follow} />;
      case "vault":
        return (
          <VaultStep
            settingsId={settingsId}
            driveId={driveId}
            onSkip={
              s.state === "done"
                ? undefined
                : () => {
                    setup.skip("vault");
                    follow();
                  }
            }
            onNext={follow}
          />
        );
      case "organisation":
        return (
          <OrganisationStep
            driveId={driveId}
            count={organisations}
            onNext={follow}
          />
        );
      case "relationship":
        return <RelationshipStep driveId={driveId} />;
    }
  };

  const panel = step && (
    <section className="pb-guide__panel" aria-labelledby="pb-guide-step">
      <div>
        <div className="pb-guide__step">
          Step {step.number} of {progress.total}
          {step.optional ? " · optional" : ""}
        </div>
        <h3 className="pb-guide__what" id="pb-guide-step">
          {step.title}
        </h3>
        <p className="pb-guide__why">{step.why}</p>
      </div>
      {body(step)}
    </section>
  );

  if (variant === "strip") {
    const left = progress.steps.filter(
      (s) => s.state === "current" || s.state === "todo",
    );
    return (
      <div className="pb-guide pb-guide--strip">
        <div className="pb-guide__head">
          <Progress done={progress.done} total={progress.total} />
          <div className="pb-guide__titles">
            <h2 className="pb-guide__title">Finish setting up</h2>
            <p className="pb-guide__lead">
              Left: {left.map((s) => s.title.toLowerCase()).join(", ")}.
            </p>
          </div>
          <button
            type="button"
            className="pb-btn pb-btn--sm"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Close" : (step?.title ?? "Open")}
            <Icon name={expanded ? "chevron-down" : "chevron-right"} />
          </button>
          <button
            type="button"
            className="pb-btn pb-btn--ghost pb-btn--sm"
            title="You can bring the guide back from Settings"
            onClick={setup.hide}
          >
            <Icon name="close" />
            Hide
          </button>
        </div>
        {expanded && left.length > 1 && (
          <StepsStrip steps={left} open={openId} onPick={setPicked} />
        )}
        {expanded && panel}
      </div>
    );
  }

  return (
    <div className="pb-guide">
      <div className="pb-guide__head">
        <div className="pb-guide__titles">
          <h2 className="pb-guide__title">Set up your space</h2>
          <p className="pb-guide__lead">
            Five short steps, and the board appears with your first lead on it.
            Each step saves as you finish it.
          </p>
        </div>
        <Progress done={progress.done} total={progress.total} />
        <button
          type="button"
          className="pb-btn pb-btn--ghost pb-btn--sm"
          title="You can bring the guide back from Settings"
          onClick={setup.hide}
        >
          <Icon name="close" />
          Hide guide
        </button>
      </div>
      <StepsStrip steps={progress.steps} open={openId} onPick={setPicked} />
      {panel}
    </div>
  );
}
