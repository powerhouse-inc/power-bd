import type { AiGatewayStatus } from "@powerhousedao/reactor-browser/ai";
import { describe, expect, it } from "vitest";
import { chatWay } from "./chat-way.js";

const KEPT = { key: "sk-or-v1-made-up-key-for-the-tests-0000000000000000000000000abcd", model: "openai/gpt-5.2" };

/** The server's service, as it answers an admin. */
const status = (configured: boolean): AiGatewayStatus => ({
  configured,
  keyHint: configured ? "sk-or-v1-…0000" : null,
  keySetBy: null,
  keySetAt: null,
  model: "qwen/qwen3-max",
  demoKeyAvailable: false,
});

describe("chatWay: before the server answers", () => {
  it("is still asking, whatever this browser keeps", () => {
    expect(chatWay(undefined, undefined)).toEqual({ way: "asking" });
    expect(chatWay(undefined, KEPT)).toEqual({ way: "asking" });
  });
});

describe("chatWay: the server's assistant service is the person's to use", () => {
  it("uses it, as before, and offers no key of their own even when one is kept here", () => {
    expect(chatWay({ access: "admin", status: status(true) }, KEPT)).toEqual({
      way: "server",
      status: status(true),
      ready: true,
    });
  });

  it("waits for the server's key while it has none", () => {
    expect(chatWay({ access: "admin", status: status(false) }, KEPT)).toEqual({
      way: "server",
      status: status(false),
      ready: false,
    });
  });
});

describe("chatWay: no assistant service the person may use", () => {
  it("offers their own key in this browser when they keep none", () => {
    expect(chatWay({ access: "none" }, undefined)).toEqual({ way: "own-key", saved: undefined, ready: false });
  });

  it("is ready on the key they keep, showing its hint and model and never the key", () => {
    const way = chatWay({ access: "none" }, KEPT);
    expect(way).toEqual({ way: "own-key", saved: { hint: "sk-or-v1-…abcd", model: "openai/gpt-5.2" }, ready: true });
    expect(JSON.stringify(way)).not.toContain(KEPT.key);
  });
});

describe("chatWay: the server answered with a fault", () => {
  it("says it cannot be reached, while it asks again by itself, and offers no key of the person's own meanwhile", () => {
    expect(chatWay({ access: "error", message: "The service is restarting." }, KEPT)).toEqual({
      way: "unreachable",
      message: "The service is restarting.",
    });
  });
});
