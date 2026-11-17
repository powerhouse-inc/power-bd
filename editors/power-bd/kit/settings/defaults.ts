/** The time zone and due window every view uses when the settings leave them out. */
export const DEFAULT_TIME_ZONE = "UTC";
export const DEFAULT_DUE_WINDOW_DAYS = 14;

export interface SettingsDefaults {
  timeZone: string;
  dueWindowDays: number;
}

/** The settings' time zone and due window, with the defaults filled in. */
export function settingsOrDefaults(
  state:
    | { timeZone?: string | null; dueWindowDays?: number | null }
    | null
    | undefined,
): SettingsDefaults {
  return {
    timeZone: state?.timeZone || DEFAULT_TIME_ZONE,
    dueWindowDays: state?.dueWindowDays ?? DEFAULT_DUE_WINDOW_DAYS,
  };
}
