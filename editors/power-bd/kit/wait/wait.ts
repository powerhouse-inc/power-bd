/** How to wait: for how long, how often to ask, and (for tests) the clock. */
export interface WaitOptions {
  timeoutMs: number;
  everyMs: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
}

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Asks `check` until it says yes or the time runs out, and says whether it
 * did. A check that throws counts as "not yet". Used to hold a newly created
 * record back until this browser's copy of the drive has it, so opening and
 * editing it work.
 */
export async function waitUntil(
  check: () => Promise<boolean>,
  { timeoutMs, everyMs, sleep = pause, now = Date.now }: WaitOptions,
): Promise<boolean> {
  const until = now() + timeoutMs;
  for (;;) {
    if (await check().catch(() => false)) return true;
    if (now() >= until) return false;
    await sleep(everyMs);
  }
}
