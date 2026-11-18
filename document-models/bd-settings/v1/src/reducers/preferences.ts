import type { BdSettingsPreferencesOperations } from "document-models/bd-settings/v1";
import {
  InvalidDueWindowError,
  InvalidQuarterError,
  InvalidRetentionError,
  InvalidTimeZoneError,
  NegativeTargetError,
  TargetNotFoundError,
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
    setTargetOperation(state, action) {
      const { id, quarter, metric, value } = action.input;
      if (!/^\d{4}-Q[1-4]$/.test(quarter))
        throw new InvalidQuarterError("A quarter is written like 2026-Q4");
      if (value < 0)
        throw new NegativeTargetError("A target can't be negative");
      // Settings saved before targets existed have no list yet.
      if (!(state.targets as typeof state.targets | undefined))
        state.targets = [];
      const existing = state.targets.find(
        (t) => t.quarter === quarter && t.metric === metric,
      );
      if (existing) existing.value = value;
      else state.targets.push({ id, quarter, metric, value });
    },
    removeTargetOperation(state, action) {
      // Settings saved before targets existed have no list yet.
      const targets = (state.targets as typeof state.targets | undefined) ?? [];
      const index = targets.findIndex((t) => t.id === action.input.id);
      if (index === -1)
        throw new TargetNotFoundError(`Target ${action.input.id} not found`);
      targets.splice(index, 1);
    },
  };
