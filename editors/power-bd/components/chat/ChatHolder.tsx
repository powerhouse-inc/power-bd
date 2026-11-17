/**
 * The tab's one conversation with the agent. The Shell holds it, so an answer
 * keeps coming, an approval keeps waiting and the composer keeps its text
 * while the person moves between places, and while the chat moves between
 * the full view and the side panel. Whichever view shows it puts the held DOM
 * into its own pane: React cannot move a mounted tree between parents, and the
 * stack's ChatPanel keeps its composer to itself (Sektar's way). The
 * conversation itself lives outside the app (keptChats.ts): leaving the app
 * and coming back, or reloading, finds it as it was.
 *
 * Nothing is asked until a view first shows the chat. Then the agent's
 * service is asked once for the tab, and the stack's chat (the AI SDK,
 * markdown) loads with it.
 */
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { keptChats } from "./keptChats.js";
import { usePerson } from "./useChatChoices.js";
import type { ChatService } from "./useChatService.js";

/** The held conversation's DOM, for as long as the tab lives. */
export interface ChatSlots {
  /** The messages and the composer. */
  panel: HTMLElement;
  /** Clear, for the conversation's header. */
  clear: HTMLElement;
}

const HeldService = lazy(() => import("./HeldChat.js"));

interface Holder {
  slots: ChatSlots;
  /** The agent's service as this person sees it; undefined until it loads. */
  service: ChatService | undefined;
  start: () => void;
}

const HolderContext = createContext<Holder | undefined>(undefined);

function heldElement(className: string) {
  const element = document.createElement("div");
  element.className = className;
  return element;
}

/** Around the app: everything under it shares the tab's one conversation. */
export function ChatHolder({ driveId, children }: { driveId: string; children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [service, setService] = useState<ChatService>();
  const [slots] = useState<ChatSlots>(() => ({
    panel: heldElement("pb-chat__held"),
    clear: heldElement("pb-chat__held-clear"),
  }));
  const start = useCallback(() => setStarted(true), []);
  // Another person here now: the answers still coming for anyone else stop.
  const person = usePerson();
  useEffect(() => keptChats.haltOthers(person), [person]);
  const holder = useMemo(() => ({ slots, service, start }), [slots, service, start]);
  return (
    <HolderContext.Provider value={holder}>
      {children}
      {started ? (
        <Suspense fallback={null}>
          <HeldService driveId={driveId} slots={slots} onService={setService} />
        </Suspense>
      ) : null}
    </HolderContext.Provider>
  );
}

/** For a view that shows the chat: starts it on first use, and gives its service and slots. */
export function useHeldChat(): Holder {
  const holder = useContext(HolderContext);
  if (!holder) throw new Error("useHeldChat needs the Shell's ChatHolder");
  const { start } = holder;
  useLayoutEffect(start, [start]);
  return holder;
}

/** Shows a held element here; it lives on when this unmounts. */
export function ChatSlot({
  element,
  className,
  hidden,
}: {
  element: HTMLElement;
  className: string;
  hidden?: boolean;
}) {
  const place = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const host = place.current;
    host?.append(element);
    // Out of the page a list forgets its scroll; the conversation's place is its end.
    const list = element.querySelector(".ph-chat-list");
    if (list) list.scrollTop = list.scrollHeight;
    return () => {
      if (element.parentNode === host) element.remove();
    };
  }, [element]);
  return <div ref={place} className={className} hidden={hidden} />;
}
