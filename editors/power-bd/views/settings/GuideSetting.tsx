import { Icon } from "../../components/Icon.js";
import { useSetup } from "../overview/first-run/useSetup.js";

/** Where the set-up guide is hidden or brought back, with how far set-up has come. */
export function GuideSetting({ driveId }: { driveId: string }) {
  const setup = useSetup(driveId);
  const { progress } = setup;
  const complete = progress.done === progress.total;
  const showing = progress.mode === "guide" || progress.mode === "strip";
  return (
    <div className="pb-section">
      <div className="pb-section__head">
        <h2 className="pb-section__title">Set-up guide</h2>
      </div>
      <p className="pb-muted">
        {complete
          ? "Set-up is complete: all five steps are done."
          : `${progress.label}. ${
              showing
                ? "The guide shows on the Overview until the steps are done."
                : "The guide is not showing on the Overview."
            }`}
      </p>
      {!complete && (
        <div className="pb-mt-8">
          {showing ? (
            <button type="button" className="pb-btn" onClick={setup.hide}>
              <Icon name="close" />
              Hide the guide
            </button>
          ) : (
            <button type="button" className="pb-btn" onClick={setup.reopen}>
              <Icon name="refresh" />
              Show the guide on the Overview
            </button>
          )}
        </div>
      )}
      <p className="pb-reassure pb-mt-8">
        <Icon name="shield" />
        Hiding the guide hides it for you, in this browser. Nothing you have set
        up changes, and you can bring it back here.
      </p>
    </div>
  );
}
