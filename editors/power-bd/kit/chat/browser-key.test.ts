import { describe, expect, it } from "vitest";
import { browserKeyStore, DEFAULT_MODEL, keyHint } from "./browser-key.js";
import type { ChoiceStorage } from "./person-choice.js";

/** The browser's storage, as a map that can be told to fail. */
function memoryStorage(failing = false) {
  const items = new Map<string, string>();
  const fail = () => {
    if (failing) throw new Error("storage is off");
  };
  const storage: ChoiceStorage = {
    getItem: (key) => (fail(), items.get(key) ?? null),
    setItem: (key, value) => (fail(), void items.set(key, value)),
    removeItem: (key) => (fail(), void items.delete(key)),
  };
  return { storage, items };
}

const MIRA = "0x1111111111111111111111111111111111111111";
const KEY = "sk-or-v1-made-up-key-for-the-tests-0000000000000000000000000abcd";

describe("browserKeyStore: someone new", () => {
  it("has no key in this browser", () => {
    const { storage } = memoryStorage();
    expect(browserKeyStore(() => storage).read(MIRA)).toBeUndefined();
  });
});

describe("browserKeyStore: kept in this browser", () => {
  it("reads back a saved key after a reload, talking to Claude Sonnet until changed", () => {
    const { storage } = memoryStorage();
    browserKeyStore(() => storage).save(MIRA, KEY);
    expect(browserKeyStore(() => storage).read(MIRA)).toEqual({ key: KEY, model: DEFAULT_MODEL });
    expect(DEFAULT_MODEL).toBe("anthropic/claude-haiku-5.5");
  });
});

describe("browserKeyStore: the model, and each person's own", () => {
  const JONAS = "0x2222222222222222222222222222222222222222";
  const NEW_KEY = "sk-or-v1-another-made-up-key-for-the-tests-000000000000000000ef01";

  it("talks to the model the person chose, and keeps it when the key is replaced", () => {
    const { storage } = memoryStorage();
    const keys = browserKeyStore(() => storage);
    keys.save(MIRA, KEY);
    keys.setModel(MIRA, "openai/gpt-5.2");
    keys.save(MIRA, NEW_KEY);
    expect(browserKeyStore(() => storage).read(MIRA)).toEqual({ key: NEW_KEY, model: "openai/gpt-5.2" });
  });

  it("does not carry one person's key over to the next", () => {
    const { storage } = memoryStorage();
    const keys = browserKeyStore(() => storage);
    keys.save(MIRA, KEY);
    keys.setModel(JONAS, "openai/gpt-5.2");
    expect(keys.read(JONAS)).toBeUndefined();
  });
});

describe("browserKeyStore: removed at any time", () => {
  it("forgets the key and its model, after a reload too", () => {
    const { storage, items } = memoryStorage();
    const keys = browserKeyStore(() => storage);
    keys.save(MIRA, KEY);
    keys.setModel(MIRA, "openai/gpt-5.2");
    keys.remove(MIRA);
    expect(keys.read(MIRA)).toBeUndefined();
    expect(browserKeyStore(() => storage).read(MIRA)).toBeUndefined();
    expect(items.size).toBe(0);
  });
});

describe("browserKeyStore: when the browser keeps nothing", () => {
  it("holds the key in memory when storage throws, until it is removed", () => {
    const { storage } = memoryStorage(true);
    const keys = browserKeyStore(() => storage);
    expect(keys.read(MIRA)).toBeUndefined();
    keys.save(MIRA, KEY);
    keys.setModel(MIRA, "openai/gpt-5.2");
    expect(keys.read(MIRA)).toEqual({ key: KEY, model: "openai/gpt-5.2" });
    keys.remove(MIRA);
    expect(keys.read(MIRA)).toBeUndefined();
  });

  it("holds the key in memory when there is no storage at all", () => {
    const keys = browserKeyStore(() => undefined);
    keys.save(MIRA, KEY);
    expect(keys.read(MIRA)).toEqual({ key: KEY, model: DEFAULT_MODEL });
  });
});

describe("browserKeyStore: everyone showing it is told of a change", () => {
  it("tells every subscriber of a save, a new model and a removal, and stops telling one that unsubscribed", () => {
    const { storage } = memoryStorage();
    const keys = browserKeyStore(() => storage);
    const heard: string[] = [];
    const stopCard = keys.subscribe(() => heard.push("card"));
    keys.subscribe(() => heard.push("chat"));
    keys.save(MIRA, KEY);
    keys.setModel(MIRA, "openai/gpt-5.2");
    stopCard();
    keys.remove(MIRA);
    expect(heard).toEqual(["card", "chat", "card", "chat", "chat"]);
  });
});

describe("browserKeyStore: what the browser holds is checked", () => {
  const stored = (text: string) => {
    const { storage, items } = memoryStorage();
    items.set(`pb:chat-browser-key:${MIRA}`, text);
    return browserKeyStore(() => storage).read(MIRA);
  };

  it("reads something that is not a kept key as no key", () => {
    expect(stored("sk-or-v1-plain-text")).toBeUndefined();
    expect(stored(JSON.stringify({ key: 42, model: DEFAULT_MODEL }))).toBeUndefined();
    expect(stored(JSON.stringify({ key: "", model: DEFAULT_MODEL }))).toBeUndefined();
    expect(stored("null")).toBeUndefined();
  });

  it("reads a kept key without a model as talking to the default one", () => {
    expect(stored(JSON.stringify({ key: KEY }))).toEqual({ key: KEY, model: DEFAULT_MODEL });
    expect(stored(JSON.stringify({ key: KEY, model: " " }))).toEqual({ key: KEY, model: DEFAULT_MODEL });
  });
});

describe("browserKeyStore: a view can hold what it reads", () => {
  it("answers with the same record until the key changes", () => {
    const { storage } = memoryStorage();
    const keys = browserKeyStore(() => storage);
    keys.save(MIRA, KEY);
    const first = keys.read(MIRA);
    expect(keys.read(MIRA)).toBe(first);
    keys.setModel(MIRA, "openai/gpt-5.2");
    expect(keys.read(MIRA)).not.toBe(first);
  });
});

describe("keyHint: the key, shown only masked", () => {
  it("keeps OpenRouter's prefix and the last four characters", () => {
    expect(keyHint(KEY)).toBe("sk-or-v1-…abcd");
  });

  it("shows only the last four of a key without OpenRouter's prefix", () => {
    expect(keyHint("another-provider-made-up-key-9f2c")).toBe("…9f2c");
  });

  it("shows nothing of a key too short to hide most of it", () => {
    expect(keyHint("sk-or-v1-short")).toBe("sk-or-v1-…");
    expect(keyHint("tiny")).toBe("…");
  });
});
