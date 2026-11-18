import { describe, expect, it, vi } from "vitest";
import { createAgentRequests } from "./agent-request.js";

describe("agent requests", () => {
  it("tells every listener, keeps the request until it is taken, and gives it once", () => {
    const r = createAgentRequests();
    const opened = vi.fn(() => r.peek());
    const sent: (string | null)[] = [];
    r.subscribe(opened);
    const stop = r.subscribe(() => sent.push(r.take()));
    r.request("Prepare me for this meeting");
    expect(opened).toHaveReturnedWith("Prepare me for this meeting");
    expect(sent).toEqual(["Prepare me for this meeting"]);
    expect(r.take()).toBeNull();
    stop();
    r.request("A second one");
    expect(sent).toHaveLength(1);
    expect(r.peek()).toBe("A second one");
  });

  it("keeps only the newest request while nobody takes it", () => {
    const r = createAgentRequests();
    r.request("old");
    r.request("new");
    expect(r.take()).toBe("new");
    expect(r.peek()).toBeNull();
  });
});
