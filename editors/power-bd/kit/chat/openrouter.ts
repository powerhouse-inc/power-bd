/**
 * The chat on the person's own key: it talks to OpenRouter straight from
 * this browser. The key is added to each request here, outside the
 * conversation, so the agent never sees it.
 */
import type { AiConnection } from "@powerhousedao/reactor-browser/ai";
import type { BrowserKey } from "./browser-key.js";

/** OpenRouter's OpenAI-compatible API. */
export const OPENROUTER_API = "https://openrouter.ai/api/v1";

/** The browser's fetch, looked up when called. */
const browserFetch: typeof fetch = (input, init) => globalThis.fetch(input, init);

/** Whether a request goes to OpenRouter, the one place the key may go. */
function toOpenRouter(input: RequestInfo | URL) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  return url.startsWith("https://openrouter.ai/");
}

interface Options {
  /** The page's origin, which OpenRouter shows as the app's site. */
  page: string;
  /** Test seam; the browser's fetch by default. */
  fetch?: typeof fetch;
}

/** The connection for the stack's chat, from the person's key and model. */
export function openRouterConnection({ key, model }: BrowserKey, options: Options): AiConnection {
  const send = options.fetch ?? browserFetch;
  return {
    baseUrl: OPENROUTER_API,
    model,
    fetch: (input, init) => {
      if (!toOpenRouter(input)) return send(input, init);
      const headers = new Headers(init?.headers);
      headers.set("Authorization", `Bearer ${key}`);
      headers.set("HTTP-Referer", options.page);
      headers.set("X-Title", "Power BD");
      return send(input, { ...init, headers });
    },
  };
}

/** What OpenRouter said of a key: it knows it, it refused it, or it could not be asked. */
export type KeyTestOutcome = "accepted" | "refused" | "unreachable";

/**
 * Tests a key with OpenRouter before it is kept. It asks for the key's own
 * details, which spends nothing.
 */
export async function testOpenRouterKey(
  key: string,
  options: { fetch?: typeof fetch } = {},
): Promise<KeyTestOutcome> {
  const send = options.fetch ?? browserFetch;
  let answer: Response;
  try {
    answer = await send(`${OPENROUTER_API}/key`, {
      headers: { Authorization: `Bearer ${key}` },
    });
  } catch {
    return "unreachable";
  }
  if (answer.ok) return "accepted";
  return answer.status === 401 || answer.status === 403 ? "refused" : "unreachable";
}
