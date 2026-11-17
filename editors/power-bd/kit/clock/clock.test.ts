import { afterEach, describe, expect, it, vi } from "vitest";
import { createClock, pageWake } from "./clock.js";

/** A hand-wound clock: time moves only when the test says, timers run only when the test fires them. */
function manual(start: string) {
  let time = Date.parse(start);
  const timers = new Map<number, { fn: () => void; ms: number }>();
  let next = 1;
  let wakeUp: (() => void) | undefined;
  let wakeStops = 0;
  const clock = createClock({
    read: () => time,
    schedule: (fn, ms) => {
      timers.set(next, { fn, ms });
      return next++;
    },
    cancel: (handle) => timers.delete(handle as number),
    wake: (refresh) => {
      wakeUp = refresh;
      return () => {
        wakeUp = undefined;
        wakeStops++;
      };
    },
  });
  return {
    clock,
    timers,
    set: (at: string) => (time = Date.parse(at)),
    /** Moves the time to when the one pending timer is due, and runs it. */
    fire: () => {
      const [[id, t]] = [...timers];
      timers.delete(id);
      time += t.ms;
      t.fn();
    },
    wake: () => wakeUp?.(),
    awake: () => wakeUp !== undefined,
    wakeStops: () => wakeStops,
  };
}

describe("clock", () => {
  afterEach(() => vi.useRealTimers());

  it("reads the current minute, with seconds zeroed", () => {
    const m = manual("2026-11-17T22:59:30.123Z");
    expect(m.clock.now()).toBe("2026-11-17T22:59:00.000Z");
  });

  it("re-reads the time on every call while no one listens", () => {
    const m = manual("2026-11-17T22:59:30.000Z");
    expect(m.clock.now()).toBe("2026-11-17T22:59:00.000Z");
    m.set("2026-11-18T07:05:10.000Z");
    expect(m.clock.now()).toBe("2026-11-18T07:05:00.000Z");
  });

  it("while listened to, keeps one string for the minute and tells each listener when the next begins", () => {
    const m = manual("2026-11-17T22:59:30.000Z");
    const heard: string[] = [];
    m.clock.subscribe(() => heard.push(m.clock.now()));
    expect([...m.timers.values()].map((t) => t.ms)).toEqual([30_000]);
    m.set("2026-11-17T22:59:45.000Z");
    expect(m.clock.now()).toBe("2026-11-17T22:59:00.000Z");
    m.set("2026-11-17T22:59:30.000Z");
    m.fire();
    expect(heard).toEqual(["2026-11-17T23:00:00.000Z"]);
    expect([...m.timers.values()].map((t) => t.ms)).toEqual([60_000]);
    m.fire();
    expect(heard).toEqual(["2026-11-17T23:00:00.000Z", "2026-11-17T23:01:00.000Z"]);
  });

  it("re-reads the time when the first listener comes, without telling it", () => {
    const m = manual("2026-11-17T22:59:30.000Z");
    expect(m.clock.now()).toBe("2026-11-17T22:59:00.000Z");
    m.set("2026-11-17T23:02:10.000Z");
    const heard = vi.fn();
    m.clock.subscribe(heard);
    expect(m.clock.now()).toBe("2026-11-17T23:02:00.000Z");
    expect(heard).not.toHaveBeenCalled();
  });

  it("says nothing when a timer comes early, and waits out the rest of the minute", () => {
    const m = manual("2026-11-17T22:59:30.000Z");
    const heard = vi.fn();
    m.clock.subscribe(heard);
    const [[id, early]] = [...m.timers];
    m.timers.delete(id);
    m.set("2026-11-17T22:59:59.990Z");
    early.fn();
    expect(heard).not.toHaveBeenCalled();
    expect([...m.timers.values()].map((t) => t.ms)).toEqual([10]);
  });

  it("shares one timer between listeners and stops it, and the wake, with the last one", () => {
    const m = manual("2026-11-17T22:59:30.000Z");
    const a = vi.fn();
    const b = vi.fn();
    const stopA = m.clock.subscribe(a);
    const stopB = m.clock.subscribe(b);
    expect(m.timers.size).toBe(1);
    m.fire();
    expect([a.mock.calls.length, b.mock.calls.length]).toEqual([1, 1]);
    stopA();
    stopA();
    expect(m.timers.size).toBe(1);
    expect(m.awake()).toBe(true);
    stopB();
    expect(m.timers.size).toBe(0);
    expect(m.awake()).toBe(false);
    expect(m.wakeStops()).toBe(1);
  });

  it("catches up at once when the page is seen again, and keeps time from there", () => {
    const m = manual("2026-11-17T22:59:30.000Z");
    const heard: string[] = [];
    m.clock.subscribe(() => heard.push(m.clock.now()));
    m.set("2026-11-18T01:15:20.000Z");
    m.wake();
    expect(heard).toEqual(["2026-11-18T01:15:00.000Z"]);
    expect([...m.timers.values()].map((t) => t.ms)).toEqual([40_000]);
  });

  it("says nothing on a wake within the same minute", () => {
    const m = manual("2026-11-17T22:59:30.000Z");
    const heard = vi.fn();
    m.clock.subscribe(heard);
    m.set("2026-11-17T22:59:50.000Z");
    m.wake();
    expect(heard).not.toHaveBeenCalled();
    expect(m.timers.size).toBe(1);
  });

  it("uses the real clock and timers by default", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-17T22:59:30.000Z"));
    const clock = createClock();
    const heard = vi.fn();
    const stop = clock.subscribe(heard);
    vi.advanceTimersByTime(30_000);
    expect(heard).toHaveBeenCalledTimes(1);
    expect(clock.now()).toBe("2026-11-17T23:00:00.000Z");
    stop();
    vi.advanceTimersByTime(120_000);
    expect(heard).toHaveBeenCalledTimes(1);
  });
});

describe("pageWake", () => {
  function page(visible: boolean) {
    const target = new EventTarget();
    const state = { visible };
    return { target, state, wake: pageWake(target, () => state.visible) };
  }

  it("refreshes when the page is shown again, focused or restored", () => {
    const p = page(true);
    const refresh = vi.fn();
    p.wake(refresh);
    for (const type of ["visibilitychange", "focus", "pageshow"]) p.target.dispatchEvent(new Event(type));
    expect(refresh).toHaveBeenCalledTimes(3);
  });

  it("does not refresh while the page is hidden", () => {
    const p = page(false);
    const refresh = vi.fn();
    p.wake(refresh);
    p.target.dispatchEvent(new Event("visibilitychange"));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("stops listening when stopped", () => {
    const p = page(true);
    const refresh = vi.fn();
    const stop = p.wake(refresh);
    stop();
    p.target.dispatchEvent(new Event("focus"));
    expect(refresh).not.toHaveBeenCalled();
  });
});
