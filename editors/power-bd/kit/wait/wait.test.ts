import { describe, expect, it, vi } from "vitest";
import { waitUntil } from "./wait.js";

/** A clock that moves only when the wait sleeps. */
function fakeClock() {
  let t = 0;
  return { now: () => t, sleep: vi.fn((ms: number) => { t += ms; return Promise.resolve(); }) };
}

describe("waitUntil", () => {
  it("says yes at once when the check passes first time", async () => {
    const clock = fakeClock();
    expect(await waitUntil(() => Promise.resolve(true), { timeoutMs: 1000, everyMs: 100, ...clock })).toBe(true);
    expect(clock.sleep).not.toHaveBeenCalled();
  });

  it("keeps asking until the check passes", async () => {
    const clock = fakeClock();
    const answers = [false, false, true];
    const check = vi.fn(() => Promise.resolve(answers.shift() ?? false));
    expect(await waitUntil(check, { timeoutMs: 1000, everyMs: 100, ...clock })).toBe(true);
    expect(check).toHaveBeenCalledTimes(3);
  });

  it("counts a check that throws as not yet", async () => {
    const clock = fakeClock();
    const check = vi.fn().mockRejectedValueOnce(new Error("not found")).mockResolvedValueOnce(true);
    expect(await waitUntil(check, { timeoutMs: 1000, everyMs: 100, ...clock })).toBe(true);
  });

  it("gives up when the time runs out", async () => {
    const clock = fakeClock();
    expect(await waitUntil(() => Promise.resolve(false), { timeoutMs: 300, everyMs: 100, ...clock })).toBe(false);
    expect(clock.sleep).toHaveBeenCalledTimes(3);
  });

  it("waits on the real clock by default", async () => {
    let calls = 0;
    expect(await waitUntil(() => Promise.resolve(++calls > 1), { timeoutMs: 1000, everyMs: 1 })).toBe(true);
  });
});
