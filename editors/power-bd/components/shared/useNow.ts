import { useSyncExternalStore } from "react";
import { createClock, pageWake, type Clock } from "../../kit/clock/index.js";

let clock: Clock | undefined;

/** One clock for the app, made on first use: views that show dates share its minute. */
export function appClock(): Clock {
  clock ??= createClock({
    wake:
      typeof window === "undefined"
        ? undefined
        : pageWake(window, () => document.visibilityState === "visible"),
  });
  return clock;
}

/** This minute as an ISO instant. The view draws again when the next minute begins, and at once when the page is seen again. */
export function useNow(): string {
  const { subscribe, now } = appClock();
  return useSyncExternalStore(subscribe, now, now);
}
