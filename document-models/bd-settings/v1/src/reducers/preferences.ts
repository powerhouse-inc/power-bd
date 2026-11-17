import type { BdSettingsPreferencesOperations } from "document-models/bd-settings/v1";
import {
  InvalidDueWindowError,
  InvalidRetentionError,
  InvalidTimeZoneError,
  VaultDriveRequiredError,
} from "../../gen/preferences/error.js";

/**
 * UTC, or an IANA name of two or three parts. The name is checked for its form
 * only: runtimes carry different time-zone data, and a reducer must give the
 * same result wherever it replays.
 */
const TIME_ZONE_NAME =
  /^(?:UTC|[A-Za-z][A-Za-z0-9_+-]*(?:\/[A-Za-z0-9_+-]+){1,2})$/;

export const bdSettingsPreferencesOperations: BdSettingsPreferencesOperations =
  {
    setTimeZoneOperation(state, action) {
      const { timeZone } = action.input;
      if (!TIME_ZONE_NAME.test(timeZone))
        throw new InvalidTimeZoneError(
          `"${timeZone}" is not a time zone name such as Europe/Zurich`,
        );
      state.timeZone = timeZone;
    },
    setDueWindowOperation(state, action) {
      const { days } = action.input;
      if (days < 1 || days > 90)
        throw new InvalidDueWindowError(
          "The due window must be between 1 and 90 days",
        );
      state.dueWindowDays = days;
    },
    setVaultDriveOperation(state, action) {
      const { driveId } = action.input;
      if (driveId.trim() === "")
        throw new VaultDriveRequiredError("The vault drive needs an id");
      state.vaultDriveId = driveId;
    },
    setRetentionOperation(state, action) {
      const { months } = action.input;
      if (months < 1)
        throw new InvalidRetentionError(
          "The retention period must be at least one month",
        );
      state.retentionMonths = months;
    },
  };
