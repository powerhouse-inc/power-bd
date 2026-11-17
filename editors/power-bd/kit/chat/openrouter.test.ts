import { afterEach, describe, expect, it, vi } from "vitest";
import { openRouterConnection, testOpenRouterKey } from "./openrouter.js";

const KEY = "sk-or-v1-made-up-key-for-the-tests-0000000000000000000000000abcd";
const PAGE = "https://bd.quillfeather.example";

/** A fetch that records each request and answers `status`, or fails to reach anything. */
function stubFetch(status: number | "unreachable" = 200) {
  const requests: { url: string; headers: Headers; init?: RequestInit }[] = [];
  const fetchImpl: typeof fetch = (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    requests.push({ url, headers: new Headers(init?.headers), init });
    if (status === "unreachable") return Promise.reject(new TypeError("Failed to fetch"));
    return Promise.resolve(new Response("{}", { status }));
  };
  return { fetchImpl, requests };
}

describe("openRouterConnection: the chat talks to OpenRouter with the person's key", () => {
  it("names OpenRouter's API and the chosen model", () => {
    const connection = openRouterConnection({ key: KEY, model: "openai/gpt-5.2" }, { page: PAGE });
    expect(connection.baseUrl).toBe("https://openrouter.ai/api/v1");
    expect(connection.model).toBe("openai/gpt-5.2");
  });

  it("adds the key, the page and the app's name to each request, keeping the chat's own headers", async () => {
    const { fetchImpl, requests } = stubFetch();
    const connection = openRouterConnection({ key: KEY, model: "openai/gpt-5.2" }, { page: PAGE, fetch: fetchImpl });
    await connection.fetch?.("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    const [request] = requests;
    expect(request.headers.get("authorization")).toBe(`Bearer ${KEY}`);
    expect(request.headers.get("http-referer")).toBe(PAGE);
    expect(request.headers.get("x-title")).toBe("Power BD");
    expect(request.headers.get("content-type")).toBe("application/json");
    expect(request.init?.method).toBe("POST");
    expect(request.init?.body).toBe("{}");
  });

  it("sends the key nowhere but OpenRouter", async () => {
    const { fetchImpl, requests } = stubFetch();
    const connection = openRouterConnection({ key: KEY, model: "openai/gpt-5.2" }, { page: PAGE, fetch: fetchImpl });
    await connection.fetch?.("https://openrouter.ai.example.net/api/v1/chat/completions", {});
    await connection.fetch?.(new URL("https://switchboard.example.org/graphql"));
    expect(requests.map((request) => request.headers.get("authorization"))).toEqual([null, null]);
  });
});

describe("testOpenRouterKey: a key is tested before it is kept, spending nothing", () => {
  it("accepts a key OpenRouter knows, asking only for the key's own details", async () => {
    const { fetchImpl, requests } = stubFetch(200);
    expect(await testOpenRouterKey(KEY, { fetch: fetchImpl })).toBe("accepted");
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://openrouter.ai/api/v1/key");
    expect(requests[0].init?.method ?? "GET").toBe("GET");
    expect(requests[0].headers.get("authorization")).toBe(`Bearer ${KEY}`);
  });

  it("says OpenRouter refused a key it does not accept", async () => {
    expect(await testOpenRouterKey(KEY, { fetch: stubFetch(401).fetchImpl })).toBe("refused");
  });

  it("says OpenRouter could not be reached when the request fails", async () => {
    expect(await testOpenRouterKey(KEY, { fetch: stubFetch("unreachable").fetchImpl })).toBe("unreachable");
  });

  it("accepts nothing OpenRouter did not answer for: a refusal stays one, a fault cannot vouch", async () => {
    expect(await testOpenRouterKey(KEY, { fetch: stubFetch(403).fetchImpl })).toBe("refused");
    expect(await testOpenRouterKey(KEY, { fetch: stubFetch(503).fetchImpl })).toBe("unreachable");
    expect(await testOpenRouterKey(KEY, { fetch: stubFetch(429).fetchImpl })).toBe("unreachable");
  });
});

describe("the browser's own fetch, when none is given", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tests the key and talks to OpenRouter through it, a request object included", async () => {
    const { fetchImpl, requests } = stubFetch(200);
    vi.stubGlobal("fetch", fetchImpl);
    expect(await testOpenRouterKey(KEY)).toBe("accepted");
    const connection = openRouterConnection({ key: KEY, model: "openai/gpt-5.2" }, { page: PAGE });
    await connection.fetch?.(new Request("https://openrouter.ai/api/v1/models"));
    expect(requests.map((request) => [request.url, request.headers.get("authorization")])).toEqual([
      ["https://openrouter.ai/api/v1/key", `Bearer ${KEY}`],
      ["https://openrouter.ai/api/v1/models", `Bearer ${KEY}`],
    ]);
  });
});
