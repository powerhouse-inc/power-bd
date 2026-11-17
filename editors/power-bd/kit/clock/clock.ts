/**
 * The time, for views whose dates move with it: what is due today, what has
 * just turned overdue, which day the strip calls today. Each view used to
 * read the time when it drew, so a view left open stood still: a meeting
 * that had passed stayed under today, and after midnight yesterday was still
 * today. This clock reads the time on each minute boundary while anyone
 * listens, catches up at once when the page is seen again (a hidden page's
 * timers are held back), and stops when no one listens.
 */

const MINUTE = 60_000;

export interface ClockOptions {
  /** Milliseconds since the epoch; `Date.now` by default. */
  read?: () => number;
  /** Runs `fn` after `ms` milliseconds; `setTimeout` by default. */
  schedule?: (fn: () => void, ms: number) => unknown;
  /** Cancels what `schedule` returned; `clearTimeout` by default. */
  cancel?: (handle: unknown) => void;
  /** Calls `refresh` whenever the page is seen again; returns how to stop. */
  wake?: (refresh: () => void) => () => void;
}

/** Its two functions read no `this`: a view can take them apart and hand them on. */
export interface Clock {
  /** This minute as an ISO instant, seconds zeroed: one string until the next minute begins. */
  now: () => string;
  /** Tells the listener when a new minute begins; returns how to stop. */
  subscribe: (listener: () => void) => () => void;
}

const minuteOf = (ms: number) => new Date(ms - (ms % MINUTE)).toISOString();

export function createClock({
  read = Date.now,
  schedule = (fn, ms) => setTimeout(fn, ms),
  cancel = (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  wake,
}: ClockOptions = {}): Clock {
  const listeners = new Set<() => void>();
  let current = minuteOf(read());
  let timer: unknown;
  let stopWake: (() => void) | undefined;

  /** Re-reads the time; true when a new minute has begun. */
  const reread = () => {
    const minute = minuteOf(read());
    if (minute === current) return false;
    current = minute;
    return true;
  };
  const tell = () => {
    for (const listener of [...listeners]) listener();
  };
  const plan = () => {
    const at = read();
    timer = schedule(tick, MINUTE - (at % MINUTE));
  };
  function tick() {
    if (reread()) tell();
    plan();
  }
  const refresh = () => {
    cancel(timer);
    if (reread()) tell();
    plan();
  };

  return {
    now: () => {
      if (listeners.size === 0) reread();
      return current;
    },
    subscribe: (listener) => {
      if (listeners.size === 0) {
        reread();
        plan();
        stopWake = wake?.(refresh);
      }
      listeners.add(listener);
      return () => {
        if (!listeners.delete(listener) || listeners.size > 0) return;
        cancel(timer);
        stopWake?.();
        stopWake = undefined;
      };
    },
  };
}

/** The page being seen again: shown after being hidden, focused, or restored from the back-forward cache. */
export function pageWake(target: EventTarget, visible: () => boolean) {
  return (refresh: () => void) => {
    const seen = () => {
      if (visible()) refresh();
    };
    const types = ["visibilitychange", "focus", "pageshow"];
    for (const type of types) target.addEventListener(type, seen);
    return () => {
      for (const type of types) target.removeEventListener(type, seen);
    };
  };
}
