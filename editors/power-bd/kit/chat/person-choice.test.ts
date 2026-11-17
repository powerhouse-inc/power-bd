import { describe, expect, it } from "vitest";
import { AUTO_APPROVE, CHAT_PRESENTATION, personChoice, type ChoiceStorage } from "./person-choice.js";

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

describe("personChoice: someone new", () => {
  it("starts at the initial value: the full view, and auto-approve off", () => {
    const { storage } = memoryStorage();
    expect(personChoice(CHAT_PRESENTATION, () => storage).read(MIRA)).toBe("full");
    expect(personChoice(AUTO_APPROVE, () => storage).read(MIRA)).toBe("off");
  });
});

describe("personChoice: remembered in this browser", () => {
  it("reads back what the person chose, after a reload too", () => {
    const { storage } = memoryStorage();
    personChoice(CHAT_PRESENTATION, () => storage).write(MIRA, "side");
    expect(personChoice(CHAT_PRESENTATION, () => storage).read(MIRA)).toBe("side");
  });
});

describe("personChoice: each person's own", () => {
  const JONAS = "0x2222222222222222222222222222222222222222";

  it("does not carry one person's choice over to the next", () => {
    const { storage } = memoryStorage();
    const choice = personChoice(AUTO_APPROVE, () => storage);
    choice.write(MIRA, "on");
    expect(choice.read(MIRA)).toBe("on");
    expect(choice.read(JONAS)).toBe("off");
  });
});

describe("personChoice: when the browser keeps nothing", () => {
  it("holds the choice in memory when storage throws", () => {
    const { storage } = memoryStorage(true);
    const choice = personChoice(AUTO_APPROVE, () => storage);
    expect(choice.read(MIRA)).toBe("off");
    choice.write(MIRA, "on");
    expect(choice.read(MIRA)).toBe("on");
  });

  it("holds the choice in memory when there is no storage at all", () => {
    const choice = personChoice(CHAT_PRESENTATION, () => undefined);
    choice.write(MIRA, "side");
    expect(choice.read(MIRA)).toBe("side");
  });
});

describe("personChoice: everyone showing it is told of a change", () => {
  it("tells every subscriber, and stops telling one that unsubscribed", () => {
    const { storage } = memoryStorage();
    const choice = personChoice(AUTO_APPROVE, () => storage);
    const heard: string[] = [];
    const stopPanel = choice.subscribe(() => heard.push("panel"));
    choice.subscribe(() => heard.push("view"));
    choice.write(MIRA, "on");
    stopPanel();
    choice.write(MIRA, "off");
    expect(heard).toEqual(["panel", "view", "view"]);
  });
});

describe("personChoice: what the browser holds is checked", () => {
  it("reads a stored value that is not one of the choices as the initial one", () => {
    const { storage, items } = memoryStorage();
    items.set(`pb:chat-auto-approve:${MIRA}`, "yes please");
    expect(personChoice(AUTO_APPROVE, () => storage).read(MIRA)).toBe("off");
  });
});
