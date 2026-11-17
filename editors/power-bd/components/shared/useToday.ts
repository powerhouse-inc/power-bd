import { settingsOrDefaults } from "../../kit/settings/index.js";
import { today } from "../../kit/overview/time.js";
import { useBdSettingsDocumentsInSelectedDrive } from "../useDriveDocuments.js";

/** Today's calendar day (`YYYY-MM-DD`) in the team's time zone from the settings, UTC when none is set. */
export function useToday(): string {
  const { timeZone: zone } = settingsOrDefaults(
    useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global,
  );
  return today(new Date().toISOString(), zone);
}
