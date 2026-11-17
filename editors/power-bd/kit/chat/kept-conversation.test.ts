import type { AgentEvent, ChatImage, ChatMessage, ChatPart } from "@powerhousedao/reactor-browser/ai";
import {
  IMAGE_NOT_KEPT,
  keptConversations,
  RESULT_NOT_KEPT,
  STOPPED_BY_RELOAD,
  STOPPED_STEP,
  type ModelMessage,
  type StartTurn,
  type TurnAgent,
  type TurnStart,
} from "./kept-conversation.js";

/** The browser's storage, in memory; `room` caps what it holds, as a full browser does. */
function memoryStorage(room = Infinity) {
  const items = new Map<string, string>();
  const used = () => [...items.values()].reduce((n, v) => n + v.length, 0);
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (used() - (items.get(key)?.length ?? 0) + value.length > room)
        throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
      items.set(key, value);
    },
    removeItem: (key: string) => void items.delete(key),
  };
}

let ids = 0;
const newId = () => `id-${++ids}`;

/**
 * A stand-in for the stack's agent: plays the events given, waits for `hold`
 * when given, and commits its history the way the stack's agent does, at
 * the end of the turn.
 */
function agentPlaying(
  events: AgentEvent[],
  { hold, history: answer }: { hold?: Promise<void>; history?: ModelMessage[] } = {},
) {
  const calls = { starts: [] as TurnStart[], approved: [] as string[], rejected: [] as string[], approvedAll: 0 };
  const start: StartTurn = (turn) => {
    calls.starts.push(turn);
    let history = turn.history;
    return Promise.resolve({
      async send(text: string) {
        for (const event of events) turn.onEvent(event);
        await hold;
        history = [
          ...history,
          { role: "user", content: text },
          ...(answer ?? [{ role: "assistant", content: [{ type: "text", text: "Four." }] }]),
        ] as ModelMessage[];
      },
      getHistory: () => history,
      getChatImages: () => turn.chatImages,
      approve: (id: string) => void calls.approved.push(id),
      approveAll: () => void calls.approvedAll++,
      reject: (id: string) => void calls.rejected.push(id),
      reset: () => {
        history = [];
      },
    });
  };
  return { start, calls };
}

const says = (text: string): AgentEvent => ({ type: "text-delta", delta: text });

/** Each message as its role and what it says, tool steps as `name:state`. */
const shown = (messages: ChatMessage[]) =>
  messages.map((m) => [
    m.role,
    m.parts.map((p) => (p.type === "text" ? p.text : p.type === "tool" ? `${p.name}:${p.state}` : "image")).join(" | "),
  ]);

/** A message's part, by place; undefined when there is none. */
const partOf = (messages: ChatMessage[], message: number, part: number): ChatPart | undefined =>
  messages.at(message)?.parts.at(part);
/** A field of a tool step, when the part is one. */
const stepField = (part: ChatPart | undefined, field: "error" | "result" | "args") =>
  part?.type === "tool" ? part[field] : undefined;

const never = new Promise<void>(() => {});
const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("keptConversations", () => {
  it("keeps the conversation when the app closes: the same person in the same space gets it back", async () => {
    const chats = keptConversations({ storage: () => memoryStorage(), newId });
    const chat = chats.of("space", "ann");
    await chat.send("How many leads?", [], agentPlaying([says("Four.")]).start);
    expect(chats.of("space", "ann")).toBe(chat);
    expect(shown(chat.view().messages)).toEqual([
      ["user", "How many leads?"],
      ["assistant", "Four."],
    ]);
    expect(chat.view().isStreaming).toBe(false);
  });

  it("brings it back after a reload, and the agent goes on from its history", async () => {
    const storage = memoryStorage();
    const before = keptConversations({ storage: () => storage, newId }).of("space", "ann");
    await before.send("How many leads?", [], agentPlaying([says("Four.")]).start);

    const after = keptConversations({ storage: () => storage, newId }).of("space", "ann");
    expect(shown(after.view().messages)).toEqual(shown(before.view().messages));
    expect(after.view().error).toBeNull();

    const next = agentPlaying([says("Brisa Labs.")]);
    await after.send("Which is newest?", [], next.start);
    expect(next.calls.starts[0]?.history).toEqual([
      { role: "user", content: "How many leads?" },
      { role: "assistant", content: [{ type: "text", text: "Four." }] },
    ]);
  });

  it("keeps each person's and each space's conversation apart", async () => {
    const storage = memoryStorage();
    const chats = keptConversations({ storage: () => storage, newId });
    await chats.of("space", "ann").send("Ann asks", [], agentPlaying([says("To Ann.")]).start);
    expect(chats.of("space", "bob").view().messages).toEqual([]);
    expect(chats.of("other", "ann").view().messages).toEqual([]);
    const reloaded = keptConversations({ storage: () => storage, newId });
    expect(reloaded.of("space", "bob").view().messages).toEqual([]);
    expect(shown(reloaded.of("space", "ann").view().messages)[0]).toEqual(["user", "Ann asks"]);
  });

  it("Clear ends the conversation and removes the kept copy", async () => {
    const storage = memoryStorage();
    const chat = keptConversations({ storage: () => storage, newId }).of("space", "ann");
    await chat.send("How many leads?", [], agentPlaying([says("Four.")]).start);
    chat.clear();
    expect(chat.view().messages).toEqual([]);
    expect(keptConversations({ storage: () => storage, newId }).of("space", "ann").view().messages).toEqual([]);
    expect([...storage.items.values()].join()).not.toContain("How many leads?");
  });

  it("an answer cut off by a reload comes back stopped, and says so", async () => {
    const storage = memoryStorage();
    const chat = keptConversations({ storage: () => storage, newId }).of("space", "ann");
    void chat.send(
      "Mark it submitted",
      [],
      agentPlaying(
        [
          says("Marking it."),
          { type: "tool-start", toolCallId: "t1", name: "addActions", args: { id: "x" } },
          { type: "approval-request", toolCallId: "t1", name: "addActions", args: { id: "x" } },
        ],
        { hold: never },
      ).start,
    );
    await settled();
    expect(chat.view().pendingApprovals).toHaveLength(1);

    const after = keptConversations({ storage: () => storage, newId }).of("space", "ann").view();
    expect(shown(after.messages)).toEqual([
      ["user", "Mark it submitted"],
      ["assistant", "Marking it. | addActions:error"],
    ]);
    expect(stepField(partOf(after.messages, 1, 1), "error")).toBe(STOPPED_STEP);
    expect(after.error).toBe(STOPPED_BY_RELOAD);
    expect(after.isStreaming).toBe(false);
    expect(after.pendingApprovals).toEqual([]);
  });

  it("leaves out an answer that had not started when the page closed", async () => {
    const storage = memoryStorage();
    void keptConversations({ storage: () => storage, newId })
      .of("space", "ann")
      .send("Hello?", [], agentPlaying([], { hold: never }).start);
    await settled();
    const after = keptConversations({ storage: () => storage, newId }).of("space", "ann").view();
    expect(shown(after.messages)).toEqual([["user", "Hello?"]]);
  });

  it("keeps neither long tool results nor images; the rest is kept, and this page still shows them", async () => {
    const storage = memoryStorage();
    const long = { state: "x".repeat(5000) };
    const image: ChatImage = { dataUrl: "data:image/png;base64,AAAA", mediaType: "image/png", name: "card.png" };
    const chat = keptConversations({ storage: () => storage, newId }).of("space", "ann");
    await chat.send(
      "Read it",
      [image],
      agentPlaying(
        [
          { type: "tool-start", toolCallId: "t1", name: "getDocument", args: { id: "x" } },
          { type: "tool-result", toolCallId: "t1", name: "getDocument", state: "done", result: long },
          says("Read."),
        ],
        {
          history: [
            { role: "user", content: [{ type: "text", text: "Read it" }, { type: "image", image: "data:image/png;base64,AAAA" }] },
            { role: "assistant", content: [{ type: "tool-call", toolCallId: "t1", toolName: "getDocument", input: { id: "x" } }] },
            { role: "tool", content: [{ type: "tool-result", toolCallId: "t1", toolName: "getDocument", output: { type: "json", value: long } }] },
            { role: "tool", content: [{ type: "tool-result", toolCallId: "t2", toolName: "getDrive", output: { type: "json", value: { small: true } } }] },
            { role: "assistant", content: [{ type: "text", text: "Read." }] },
          ] as ModelMessage[],
        },
      ).start,
    );
    expect(stepField(partOf(chat.view().messages, 1, 0), "result")).toBe(long);

    const after = keptConversations({ storage: () => storage, newId }).of("space", "ann");
    const kept = after.view().messages;
    expect(kept.at(0)?.parts).toEqual([{ type: "text", text: "Read it" }, { type: "text", text: IMAGE_NOT_KEPT }]);
    expect(stepField(partOf(kept, 1, 0), "result")).toEqual({ note: RESULT_NOT_KEPT });
    expect(stepField(partOf(kept, 1, 0), "args")).toEqual({ id: "x" });

    const next = agentPlaying([says("Again.")]);
    await after.send("And?", [], next.start);
    const history = JSON.stringify(next.calls.starts[0]?.history);
    expect(history).not.toContain("xxxxx");
    expect(history).not.toContain("base64");
    expect(history).toContain('"small":true');
    expect(history).toContain('"toolName":"getDocument"');
  });

  it("does not keep a copy too big to keep, and removes the older one", async () => {
    const storage = memoryStorage();
    const chats = () => keptConversations({ storage: () => storage, newId, limits: { chars: 2000 } });
    const chat = chats().of("space", "ann");
    await chat.send("Short?", [], agentPlaying([says("Yes.")]).start);
    expect(shown(chats().of("space", "ann").view().messages)).toHaveLength(2);
    await chat.send("Long?", [], agentPlaying([says("y".repeat(3000))]).start);
    expect(chat.view().messages).toHaveLength(4);
    expect(chats().of("space", "ann").view().messages).toEqual([]);
  });

  it("keeps a few conversations, the oldest dropped first", async () => {
    const storage = memoryStorage();
    const chats = keptConversations({ storage: () => storage, newId, limits: { conversations: 2 } });
    for (const person of ["ann", "bob", "cy"])
      await chats.of("space", person).send(`${person} asks`, [], agentPlaying([says("Yes.")]).start);
    const reloaded = keptConversations({ storage: () => storage, newId });
    expect(reloaded.of("space", "ann").view().messages).toEqual([]);
    expect(reloaded.of("space", "bob").view().messages).toHaveLength(2);
    expect(reloaded.of("space", "cy").view().messages).toHaveLength(2);
  });

  it("makes room by dropping the oldest copies when the browser is full", async () => {
    const storage = memoryStorage(1000);
    const chats = keptConversations({ storage: () => storage, newId });
    await chats.of("space", "ann").send("a".repeat(200), [], agentPlaying([says("Yes.")]).start);
    await chats.of("space", "bob").send("b".repeat(200), [], agentPlaying([says("Yes.")]).start);
    const reloaded = keptConversations({ storage: () => storage, newId });
    expect(reloaded.of("space", "ann").view().messages).toEqual([]);
    expect(reloaded.of("space", "bob").view().messages).toHaveLength(2);
  });

  it("still holds the conversation in this page when the browser keeps nothing", async () => {
    const full = memoryStorage(10);
    for (const storage of [() => undefined, () => full]) {
      const chats = keptConversations({ storage, newId });
      await chats.of("space", "ann").send("How many leads?", [], agentPlaying([says("Four.")]).start);
      expect(shown(chats.of("space", "ann").view().messages)).toHaveLength(2);
    }
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const chat = keptConversations({ storage: () => throwing, newId }).of("space", "ann");
    await chat.send("How many leads?", [], agentPlaying([says("Four.")]).start);
    chat.clear();
    expect(chat.view().messages).toEqual([]);
  });

  it("ignores a damaged copy, and removes it", () => {
    const storage = memoryStorage();
    storage.items.set("pb:chat:space:ann", "{not json");
    storage.items.set("pb:chat:space:bob", JSON.stringify({ v: 1, messages: "no" }));
    storage.items.set("pb:chat:index", "{}");
    const chats = keptConversations({ storage: () => storage, newId });
    expect(chats.of("space", "ann").view().messages).toEqual([]);
    expect(chats.of("space", "bob").view().messages).toEqual([]);
    expect(storage.items.has("pb:chat:space:ann")).toBe(false);
    expect(storage.items.has("pb:chat:space:bob")).toBe(false);
  });

  it("shows the answer as it comes, each step with its state", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    const seen: string[] = [];
    chat.subscribe(() => seen.push(chat.view().messages.at(-1)?.parts.map((p) => (p.type === "tool" ? p.state : "text")).join() ?? ""));
    await chat.send(
      "Go",
      [],
      agentPlaying([
        says("Hello"),
        says(" world"),
        { type: "tool-start", toolCallId: "t1", name: "getDrive", args: {} },
        { type: "tool-result", toolCallId: "t1", name: "getDrive", state: "done", result: { ok: 1 } },
        { type: "approval-request", toolCallId: "t2", name: "addActions", args: {} },
        { type: "tool-start", toolCallId: "t2", name: "addActions", args: {} },
        { type: "approval-resolved", toolCallId: "t2", approved: false },
        { type: "tool-start", toolCallId: "t3", name: "addActions", args: {} },
        { type: "approval-request", toolCallId: "t3", name: "addActions", args: {} },
        { type: "approval-resolved", toolCallId: "t3", approved: true },
        { type: "tool-result", toolCallId: "t3", name: "addActions", state: "error", error: "Refused" },
        says("Done."),
        { type: "usage", inputTokens: 10 },
        { type: "error", error: "The model stopped." },
        { type: "finish" },
      ]).start,
    );
    const view = chat.view();
    expect(shown(view.messages)[1]).toEqual(["assistant", "Hello world | getDrive:done | addActions:rejected | addActions:error | Done."]);
    expect(stepField(partOf(view.messages, 1, 3), "error")).toBe("Refused");
    expect(view.pendingApprovals).toEqual([]);
    expect(view.error).toBe("The model stopped.");
    expect(seen).toContain("text,done,awaiting-approval");
  });

  it("passes approvals to the agent that is answering", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    const agent = agentPlaying(
      [{ type: "approval-request", toolCallId: "t1", name: "addActions", args: {} }],
      { hold: never },
    );
    void chat.send("Go", [], agent.start);
    await settled();
    expect(chat.view().isStreaming).toBe(true);
    expect(chat.view().pendingApprovals).toEqual([{ toolCallId: "t1", name: "addActions", args: {} }]);
    chat.approve("t1");
    chat.reject("t2");
    chat.approveAll();
    expect(agent.calls).toMatchObject({ approved: ["t1"], rejected: ["t2"], approvedAll: 1 });
  });

  it("Stop ends the answer still coming", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    const agent = agentPlaying([], { hold: never });
    void chat.send("Go", [], agent.start);
    await settled();
    chat.stop();
    expect(agent.calls.starts[0]?.signal.aborted).toBe(true);
  });

  it("ignores an empty message, and another one while an answer is coming", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    const agent = agentPlaying([], { hold: never });
    await chat.send("   ", [], agent.start);
    void chat.send("Go", [], agent.start);
    void chat.send("Go again", [], agent.start);
    await settled();
    expect(agent.calls.starts).toHaveLength(1);
    expect(shown(chat.view().messages)).toEqual([["user", "Go"], ["assistant", ""]]);
  });

  it("says why when the agent cannot start, and adds nothing", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    await chat.send("Go", [], () => Promise.reject(new Error("The agent's tools could not load.")));
    expect(chat.view()).toMatchObject({ messages: [], error: "The agent's tools could not load.", isStreaming: false });
    // A rejection that is not an Error, as a library may give one.
    const notAnError = {
      then: (_: unknown, reject: (reason: unknown) => void) => reject("plain"),
    } as unknown as Promise<TurnAgent>;
    await chat.send("Go", [], () => notAnError);
    expect(chat.view().error).toBe("plain");
  });

  it("says why when the answer fails", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    const failing: StartTurn = (turn) =>
      agentPlaying([]).start(turn).then((agent) => ({ ...agent, send: () => Promise.reject(new Error("401 from the model")) }));
    await chat.send("Go", [], failing);
    expect(chat.view()).toMatchObject({ error: "401 from the model", isStreaming: false });
  });

  it("a conversation cleared while answering does not get the old answer back", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    let release = () => {};
    const agent = agentPlaying([], { hold: new Promise<void>((resolve) => (release = resolve)) });
    const turn = chat.send("Go", [], agent.start);
    await settled();
    chat.clear();
    agent.calls.starts[0]?.onEvent(says("Too late."));
    release();
    await turn;
    expect(chat.view()).toMatchObject({ messages: [], isStreaming: false, error: null });
    const next = agentPlaying([says("Fresh.")]);
    await chat.send("Again", [], next.start);
    expect(next.calls.starts[0]?.history).toEqual([]);
  });

  it("a conversation cleared while the agent starts does not start it", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    const agent = agentPlaying([says("Too late.")]);
    const turn = chat.send("Go", [], agent.start);
    chat.clear();
    await turn;
    expect(chat.view().messages).toEqual([]);
  });

  it("stops the answers still coming for anyone else when another person signs in", async () => {
    const chats = keptConversations({ storage: () => undefined, newId });
    const ann = agentPlaying([], { hold: never });
    const bob = agentPlaying([], { hold: never });
    void chats.of("space", "ann").send("Go", [], ann.start);
    void chats.of("other", "bob").send("Go", [], bob.start);
    await settled();
    chats.haltOthers("bob");
    expect(ann.calls.starts[0]?.signal.aborted).toBe(true);
    expect(bob.calls.starts[0]?.signal.aborted).toBe(false);
  });

  it("sends an image on its own", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    const image: ChatImage = { dataUrl: "data:image/png;base64,AAAA", mediaType: "image/png", name: "card.png" };
    await chat.send("  ", [image], agentPlaying([says("A card.")]).start);
    expect(chat.view().messages[0]?.parts).toEqual([{ type: "image", dataUrl: image.dataUrl, name: "card.png" }]);
  });

  it("leaves a long input to a step out of the copy too, and keeps a step without one as it is", async () => {
    const storage = memoryStorage();
    const chat = keptConversations({ storage: () => storage, newId }).of("space", "ann");
    await chat.send(
      "Write it",
      [],
      agentPlaying([
        { type: "tool-start", toolCallId: "t1", name: "addActions", args: { text: "z".repeat(5000) } },
        { type: "tool-start", toolCallId: "t2", name: "getDrives", args: undefined },
      ]).start,
    );
    const parts = keptConversations({ storage: () => storage, newId }).of("space", "ann").view().messages.at(1)?.parts;
    expect(parts?.map((p) => (p.type === "tool" ? p.args : undefined))).toEqual([{ note: RESULT_NOT_KEPT }, undefined]);
  });

  it("an agent failing after Clear changes nothing", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    let refuse = (_: Error) => {};
    const starting = chat.send("Go", [], () => new Promise((_, reject) => (refuse = reject)));
    chat.clear();
    refuse(new Error("too late"));
    await starting;
    expect(chat.view().error).toBeNull();

    let fail = (_: Error) => {};
    const failing: StartTurn = (turn) =>
      agentPlaying([]).start(turn).then((agent) => ({
        ...agent,
        send: () => new Promise<void>((_, reject) => (fail = reject)),
      }));
    const answering = chat.send("Go", [], failing);
    await settled();
    chat.clear();
    fail(new Error("too late"));
    await answering;
    expect(chat.view()).toMatchObject({ error: null, messages: [] });
  });

  it("makes its own message ids when given none", async () => {
    const chat = keptConversations({ storage: () => undefined }).of("space", "ann");
    await chat.send("Go", [], agentPlaying([says("Yes.")]).start);
    const messages = chat.view().messages;
    expect(messages.at(0)?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(messages.at(1)?.id).not.toBe(messages.at(0)?.id);
  });

  it("tells each listener of a change until it stops listening", async () => {
    const chat = keptConversations({ storage: () => undefined, newId }).of("space", "ann");
    let heard = 0;
    const stop = chat.subscribe(() => heard++);
    await chat.send("Go", [], agentPlaying([says("Yes.")]).start);
    const before = heard;
    expect(before).toBeGreaterThan(0);
    stop();
    chat.clear();
    expect(heard).toBe(before);
  });
});
