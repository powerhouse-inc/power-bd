import { useState } from "react";
import {
  guidePrefsKey,
  hideGuide,
  parseGuidePrefs,
  reopenGuide,
  serialiseGuidePrefs,
  setupProgress,
  skipStep,
  type GuidePrefs,
  type SetupProgress,
  type SetupStepId,
} from "../../../kit/first-run/index.js";
import { useBdSettingsDocumentsInSelectedDrive, useContactDocumentsInSelectedDrive, useLeadDocumentsInSelectedDrive, useOpportunityDocumentsInSelectedDrive } from "../../../components/useDriveDocuments.js";

/** The stored choices; an open guide where the browser keeps nothing. */
function readPrefs(driveId: string): GuidePrefs {
  try {
    return parseGuidePrefs(localStorage.getItem(guidePrefsKey(driveId)));
  } catch {
    return parseGuidePrefs(null);
  }
}

export interface Setup {
  progress: SetupProgress;
  /** The drive's settings record, once it exists. */
  settingsId: string | undefined;
  /** True when the viewer hid the guide or skipped a step. */
  changed: boolean;
  hide: () => void;
  skip: (id: SetupStepId) => void;
  reopen: () => void;
}

/**
 * The drive's set-up progress, read from its records, and this viewer's
 * choices about the guide (hidden, skipped), kept in the browser per drive.
 */
export function useSetup(driveId: string): Setup {
  const settings = useBdSettingsDocumentsInSelectedDrive()?.[0];
  const contacts = useContactDocumentsInSelectedDrive() ?? [];
  const leads = useLeadDocumentsInSelectedDrive() ?? [];
  const opportunities = useOpportunityDocumentsInSelectedDrive() ?? [];
  const [stored, setStored] = useState(() => ({
    driveId,
    prefs: readPrefs(driveId),
  }));
  // Another drive opened in the same view: read that drive's choices.
  const prefs = stored.driveId === driveId ? stored.prefs : readPrefs(driveId);

  const save = (next: GuidePrefs) => {
    setStored({ driveId, prefs: next });
    try {
      localStorage.setItem(guidePrefsKey(driveId), serialiseGuidePrefs(next));
    } catch {
      // The choice holds for this visit; the browser just will not remember it.
    }
  };

  const state = settings?.state.global;
  return {
    progress: setupProgress(
      {
        settingsReady: Boolean(settings),
        teamMembers: state?.teamMembers.filter((m) => m.active).length ?? 0,
        timeZone: state?.timeZone,
        vaultDriveId: state?.vaultDriveId,
        organisations: contacts.length,
        relationships: leads.length + opportunities.length,
      },
      prefs,
    ),
    settingsId: settings?.header.id,
    changed: prefs.hidden || prefs.skipped.length > 0,
    hide: () => save(hideGuide(prefs)),
    skip: (id) => save(skipStep(prefs, id)),
    reopen: () => save(reopenGuide()),
  };
}
