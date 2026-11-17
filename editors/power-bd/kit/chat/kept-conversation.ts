/**
 * The conversation with the agent, kept for each person in each space.
 *
 * The stack's `useReactorChat` keeps a conversation in component state, so it
 * ended when the drive app closed (the person opened another drive in
 * Connect) and came back empty. This keeps it outside React: it lives as long
 * as the page does, so an answer still coming keeps coming and an approval
 * keeps waiting while the app is closed, and a copy in the browser's storage
 * brings it back after a reload. The copy leaves out what is long or heavy:
 * long tool results and images, which the model can ask for again. A few
 * conversations are kept, the oldest dropped first.
 *
 * The events and the way they become messages are the stack's own
 * (`useReactorChat` in reactor-browser).
 */
import type {
  AgentEvent,
  AiChatImage,
  ChatImage,
  ChatMessage,
  ChatPart,
  PendingApproval,
  ReactorChatAgent,
} from "@powerhousedao/reactor-browser/ai";
import type { ChoiceStorage } from "./person-choice.js";

/** A message in the model's history, as the stack's agent keeps it. */
export type ModelMessage = ReturnType<ReactorChatAgent["getHistory"]>[number];

/** What the conversation shows. */
export interface ConversationView {
  messages: ChatMessage[];
  isStreaming: boolean;
  pendingApprovals: PendingApproval[];
  error: string | null;
}

/** The agent answering one message: the stack's `ReactorChatAgent`. */
export type TurnAgent = Pick<
  ReactorChatAgent,
  "send" | "getHistory" | "getChatImages" | "approve" | "approveAll" | "reject" | "reset"
>;

/** What an answer starts from; the app makes the agent from it, with its tools and connection. */
export interface TurnStart {
  history: ModelMessage[];
  chatImages: AiChatImage[];
  onEvent: (event: AgentEvent) => void;
  signal: AbortSignal;
}

export type StartTurn = (turn: TurnStart) => Promise<TurnAgent>;

export interface KeptConversation {
  /** What it shows now: the same object until something changes. */
  view: () => ConversationView;
  /** Called after every change; returns the way to stop. */
  subscribe: (listener: () => void) => () => void;
  /** Sends a message; resolves when its answer has ended. */
  send: (text: string, images: ChatImage[], start: StartTurn) => Promise<void>;
  stop: () => void;
  approve: (toolCallId: string) => void;
  approveAll: () => void;
  reject: (toolCallId: string) => void;
  /** Ends the conversation and removes its kept copy. */
  clear: () => void;
}

export interface KeptConversations {
  /** This person's conversation in this space: the same one every time. */
  of: (space: string, person: string) => KeptConversation;
  /** Stops the answers still coming for anyone but this person. */
  haltOthers: (person: string) => void;
}

export interface KeptLimits {
  /** How many conversations the browser keeps. */
  conversations: number;
  /** The most one kept copy may take, in characters. */
  chars: number;
  /** A tool result or input longer than this is left out of the copy. */
  resultChars: number;
}

const LIMITS: KeptLimits = { conversations: 6, chars: 300_000, resultChars: 4_000 };

/** In a step whose result was left out of the kept copy. */
export const RESULT_NOT_KEPT = "Too long to keep once the page closed. Ask again to see it.";
/** Where an image was, in a kept copy. */
export const IMAGE_NOT_KEPT = "An image was attached here. Images are not kept once the page closes.";
/** A step still running when the page closed. */
export const STOPPED_STEP = "Stopped: the page closed before this step finished.";
/** Under a conversation whose last answer the page's closing cut off. */
export const STOPPED_BY_RELOAD = "The last answer stopped when the page closed. Ask again to go on.";
/** What the model reads where a long result was. */
const RESULT_LEFT_OUT =
  "This result was not kept. Call the tool again with the same input if you need it.";
const IMAGE_LEFT_OUT = "(An image was attached here; it is no longer available.)";

const PREFIX = "pb:chat:";
const INDEX = `${PREFIX}index`;
const VERSION = 1;

/** The kept copy of one conversation. */
interface Copy {
  v: typeof VERSION;
  /** An answer was still coming when it was kept. */
  streaming: boolean;
  messages: ChatMessage[];
  history: ModelMessage[];
}

const EMPTY: ConversationView = { messages: [], isStreaming: false, pendingApprovals: [], error: null };

export function keptConversations({
  storage,
  newId = () => crypto.randomUUID(),
  limits,
}: {
  storage: () => ChoiceStorage | undefined;
  newId?: () => string;
  limits?: Partial<KeptLimits>;
}): KeptConversations {
  const limit = { ...LIMITS, ...limits };
  const shelf = shelfIn(storage, limit);
  const open = new Map<string, { person: string; chat: KeptConversation }>();
  return {
    of(space, person) {
      const key = `${PREFIX}${space}:${person}`;
      let entry = open.get(key);
      if (!entry) {
        entry = { person, chat: conversation(key, shelf, limit, newId) };
        open.set(key, entry);
      }
      return entry.chat;
    },
    haltOthers(person) {
      for (const entry of open.values()) if (entry.person !== person) entry.chat.stop();
    },
  };
}

type ToolPart = Extract<ChatPart, { type: "tool" }>;

function conversation(
  key: string,
  shelf: Shelf,
  limit: KeptLimits,
  newId: () => string,
): KeptConversation {
  const restored = restore(shelf.read(key));
  let view = restored.view;
  let history = restored.history;
  let chatImages: AiChatImage[] = [];
  let agent: TurnAgent | null = null;
  let abort: AbortController | null = null;
  let assistantId: string | null = null;
  // A message is being answered, or its agent is starting.
  let busy = false;
  // Counts the Clears: an answer from before one changes nothing.
  let epoch = 0;
  const pending = new Set<string>();
  const listeners = new Set<() => void>();

  /** Keeps a copy as it is now, or removes it when there is nothing, or too much, to keep. */
  function save() {
    if (view.messages.length === 0) return shelf.remove(key);
    let text = JSON.stringify(copyOf(view, history, limit.resultChars));
    if (text.length > limit.chars) text = JSON.stringify(copyOf(view, history, 0));
    if (text.length > limit.chars) shelf.remove(key);
    else shelf.write(key, text);
  }

  function show(change: Partial<ConversationView>, keep = true) {
    view = { ...view, ...change };
    if (keep) save();
    for (const listener of listeners) listener();
  }

  const inAnswer = (update: (parts: ChatPart[]) => ChatPart[]) =>
    view.messages.map((m) => (m.id === assistantId ? { ...m, parts: update(m.parts) } : m));
  const inStep = (toolCallId: string, change: Partial<ToolPart>) =>
    inAnswer((parts) =>
      parts.map((p) => (p.type === "tool" && p.toolCallId === toolCallId ? { ...p, ...change } : p)),
    );

  function onEvent(event: AgentEvent) {
    switch (event.type) {
      case "text-delta":
        // Not kept on every word: the copy is kept at each step and at the end.
        return show(
          {
            messages: inAnswer((parts) => {
              const last = parts.at(-1);
              return last?.type === "text"
                ? [...parts.slice(0, -1), { ...last, text: last.text + event.delta }]
                : [...parts, { type: "text", text: event.delta }];
            }),
          },
          false,
        );
      case "tool-start":
        return show({
          messages: inAnswer((parts) => [
            ...parts,
            {
              type: "tool",
              toolCallId: event.toolCallId,
              name: event.name,
              args: event.args,
              state: pending.has(event.toolCallId) ? "awaiting-approval" : "executing",
            },
          ]),
        });
      case "approval-request":
        pending.add(event.toolCallId);
        return show({
          messages: inStep(event.toolCallId, { state: "awaiting-approval" }),
          pendingApprovals: [
            ...view.pendingApprovals,
            { toolCallId: event.toolCallId, name: event.name, args: event.args },
          ],
        });
      case "approval-resolved":
        pending.delete(event.toolCallId);
        return show({
          pendingApprovals: view.pendingApprovals.filter((a) => a.toolCallId !== event.toolCallId),
          ...(event.approved ? {} : { messages: inStep(event.toolCallId, { state: "rejected" }) }),
        });
      case "tool-result":
        return show({
          messages: inStep(event.toolCallId, {
            state: event.state,
            result: event.result,
            error: event.error,
          }),
        });
      case "error":
        return show({ error: event.error });
    }
  }

  return {
    view: () => view,
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    async send(text, images, start) {
      const trimmed = text.trim();
      if ((!trimmed && images.length === 0) || busy) return;
      busy = true;
      const turn = epoch;
      show({ error: null }, false);
      const controller = new AbortController();
      let current: TurnAgent;
      try {
        current = await start({
          history,
          chatImages,
          onEvent: (event) => {
            if (turn === epoch) onEvent(event);
          },
          signal: controller.signal,
        });
      } catch (error) {
        if (turn === epoch) {
          busy = false;
          show({ error: messageOf(error) }, false);
        }
        return;
      }
      if (turn !== epoch) return;
      agent = current;
      abort = controller;
      assistantId = newId();
      show({
        isStreaming: true,
        messages: [
          ...view.messages,
          {
            id: newId(),
            role: "user",
            parts: [
              ...(trimmed ? [{ type: "text" as const, text: trimmed }] : []),
              ...images.map((image) => ({ type: "image" as const, dataUrl: image.dataUrl, name: image.name })),
            ],
          },
          { id: assistantId, role: "assistant", parts: [] },
        ],
      });
      try {
        await current.send(trimmed, images);
      } catch (error) {
        if (turn === epoch) show({ error: messageOf(error) }, false);
      } finally {
        if (turn === epoch) {
          busy = false;
          abort = null;
          history = current.getHistory();
          chatImages = current.getChatImages();
          show({ isStreaming: false });
        }
      }
    },
    stop: () => abort?.abort(),
    approve: (toolCallId) => agent?.approve(toolCallId),
    approveAll: () => agent?.approveAll(),
    reject: (toolCallId) => agent?.reject(toolCallId),
    clear() {
      epoch++;
      busy = false;
      abort?.abort();
      agent?.reset();
      agent = null;
      abort = null;
      assistantId = null;
      history = [];
      chatImages = [];
      pending.clear();
      show(EMPTY);
    },
  };
}

const messageOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** The conversation a kept copy holds; an answer it cut off comes back stopped, and says so. */
function restore(copy: Copy | undefined): { view: ConversationView; history: ModelMessage[] } {
  if (!copy) return { view: EMPTY, history: [] };
  if (!copy.streaming) return { view: { ...EMPTY, messages: copy.messages }, history: copy.history };
  const messages = copy.messages
    .map((m) => ({
      ...m,
      parts: m.parts.map((p) =>
        p.type === "tool" && (p.state === "executing" || p.state === "awaiting-approval")
          ? { ...p, state: "error" as const, error: STOPPED_STEP }
          : p,
      ),
    }))
    .filter((m) => m.role === "user" || m.parts.length > 0);
  return { view: { ...EMPTY, messages, error: STOPPED_BY_RELOAD }, history: copy.history };
}

/** Whether a value takes more than `chars` characters as JSON; undefined takes none. */
const longer = (value: unknown, chars: number) =>
  ((JSON.stringify(value) as string | undefined)?.length ?? 0) > chars;

/** What is kept of a conversation: no images, and no tool input or result longer than `chars`. */
function copyOf(view: ConversationView, history: ModelMessage[], chars: number): Copy {
  return {
    v: VERSION,
    streaming: view.isStreaming,
    messages: view.messages.map((message) => ({
      ...message,
      parts: message.parts.map((part): ChatPart => {
        if (part.type === "image") return { type: "text", text: IMAGE_NOT_KEPT };
        if (part.type !== "tool") return part;
        return {
          ...part,
          args: longer(part.args, chars) ? { note: RESULT_NOT_KEPT } : part.args,
          ...(part.result !== undefined && longer(part.result, chars)
            ? { result: { note: RESULT_NOT_KEPT } }
            : {}),
        };
      }),
    })),
    history: history.map((message): ModelMessage => {
      if (message.role === "tool")
        return {
          ...message,
          content: message.content.map((part) =>
            part.type === "tool-result" && longer(part.output, chars)
              ? { ...part, output: { type: "text" as const, value: RESULT_LEFT_OUT } }
              : part,
          ),
        };
      if (message.role === "user" && Array.isArray(message.content))
        return {
          ...message,
          content: message.content.map((part) =>
            part.type === "text" ? part : { type: "text" as const, text: IMAGE_LEFT_OUT },
          ),
        };
      return message;
    }),
  };
}

/** A kept copy as it was written, or nothing when it is not one. */
function parse(raw: string): Copy | undefined {
  try {
    const copy = JSON.parse(raw) as Partial<Copy> | null;
    return copy?.v === VERSION && Array.isArray(copy.messages) && Array.isArray(copy.history)
      ? { v: VERSION, streaming: copy.streaming === true, messages: copy.messages, history: copy.history }
      : undefined;
  } catch {
    return undefined;
  }
}

interface Shelf {
  read: (key: string) => Copy | undefined;
  write: (key: string, text: string) => void;
  remove: (key: string) => void;
}

/**
 * The kept copies in the browser's storage, with a list of them, the most
 * recent last. A browser that keeps nothing, or refuses, changes nothing in
 * the page: the conversation lasts until it reloads.
 */
function shelfIn(storage: () => ChoiceStorage | undefined, limit: KeptLimits): Shelf {
  const attempt = (task: (s: ChoiceStorage) => void) => {
    try {
      const s = storage();
      if (s) task(s);
    } catch {
      // Not kept; the page still holds it.
    }
  };
  const listIn = (s: ChoiceStorage): string[] => {
    try {
      const list: unknown = JSON.parse(s.getItem(INDEX) ?? "[]");
      return Array.isArray(list) ? list.filter((k): k is string => typeof k === "string") : [];
    } catch {
      return [];
    }
  };
  const drop = (s: ChoiceStorage, key: string) => {
    s.removeItem(key);
    s.setItem(INDEX, JSON.stringify(listIn(s).filter((k) => k !== key)));
  };
  return {
    read(key) {
      let copy: Copy | undefined;
      attempt((s) => {
        const raw = s.getItem(key);
        if (raw === null) return;
        copy = parse(raw);
        if (!copy) drop(s, key);
      });
      return copy;
    },
    write(key, text) {
      attempt((s) => {
        const list = listIn(s).filter((k) => k !== key);
        // The oldest go first: past the limit, and while the browser is full.
        while (list.length >= limit.conversations) s.removeItem(list.shift() as string);
        for (;;) {
          try {
            s.setItem(key, text);
            break;
          } catch {
            const oldest = list.shift();
            if (oldest === undefined) {
              s.removeItem(key);
              s.setItem(INDEX, JSON.stringify(list));
              return;
            }
            s.removeItem(oldest);
          }
        }
        s.setItem(INDEX, JSON.stringify([...list, key]));
      });
    },
    remove(key) {
      attempt((s) => drop(s, key));
    },
  };
}
