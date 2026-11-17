import { settingsOrDefaults } from "../../kit/settings/index.js";
import { today } from "../../kit/overview/time.js";
import { useSyncExternalStore } from "react";
import { useBdSettingsDocumentsInSelectedDrive } from "../useDriveDocuments.js";
import { appClock } from "./useNow.js";

/**
 * Today's calendar day (`YYYY-MM-DD`) in the team's time zone from the
 * settings, UTC when none is set. The view draws again when the day changes,
 * and only then.
 */
export function useToday(): string {
  const { timeZone: zone } = settingsOrDefaults(
    useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global,
  );
  const { subscribe, now } = appClock();
  const day = () => today(now(), zone);
  return useSyncExternalStore(subscribe, day, day);
}
