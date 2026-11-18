import {
  dispatchActions,
  renameDriveNode,
  useDocumentCache,
  useDocumentSafe,
  useDocuments,
  useDriveById,
  useNodesInSelectedDrive,
  useSelectedDriveId,
  useSwitchboards,
  type DocumentDispatch,
} from "@powerhousedao/reactor-browser";
import type { Action, PHDocument } from "document-model";
import {
  createContext,
  use,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createLoadableChecks } from "../../kit/drive/loadable.js";
import { createLiveDrive, type LiveDrive } from "../../kit/live-drive/live-drive.js";
import { placeDrive, type DriveHome } from "../access/useDriveSwitchboard.js";
import { renameOnServer, serverDriveSource, startLiveFeed } from "../serverWrites.js";

/**
 * Where the open drive's data comes from, for every view and record.
 *
 * A drive kept on a Switchboard is read from and written to that server: the
 * app keeps its own live copy, so a member's first visit sees what the drive
 * holds, and a member's changes are checked against the drive like the
 * owner's. Connect's copy of such a drive can start empty, and changes sent
 * through it leave as batches the server refuses from anyone who is not its
 * admin. A drive kept only in this browser stays on Connect. Connect's shared
 * client and cache are left alone: another package may swap them.
 */
export type DriveBackend =
  | { kind: "server"; base: string; driveId: string; live: LiveDrive; ready: Promise<void> }
  | { kind: "connect"; driveId: string };

const BackendContext = createContext<DriveBackend | undefined>(undefined);

/** How often the server is read again while its change feed is down, and while it is up. */
const FEED_DOWN_MS = 60_000;
const SAFETY_NET_MS = 5 * 60_000;

const homes = new WeakMap<object, Map<string, Promise<DriveHome>>>();
const NO_DIRECTORY = {};
/** One lookup per directory and drive, so `use` meets the same promise on every render. */
function homeOf(directory: Parameters<typeof placeDrive>[0], driveId: string): Promise<DriveHome> {
  const key = directory ?? NO_DIRECTORY;
  let byDrive = homes.get(key);
  if (!byDrive) homes.set(key, (byDrive = new Map<string, Promise<DriveHome>>()));
  let home = byDrive.get(driveId);
  if (!home) byDrive.set(driveId, (home = placeDrive(directory, driveId)));
  return home;
}

const lives = new Map<string, Extract<DriveBackend, { kind: "server" }>>();
/** One live copy per server and drive for the page, read once when first asked for. */
function serverBackend(base: string, driveId: string) {
  const key = `${base}\n${driveId}`;
  let backend = lives.get(key);
  if (!backend) {
    const live = createLiveDrive(driveId, serverDriveSource(base, driveId));
    backend = { kind: "server", base, driveId, live, ready: live.refresh() };
    lives.set(key, backend);
  }
  return backend;
}

/** Keeps a server drive's live copy current: the change feed, and a read on a slow clock as a safety net. */
function useKeptCurrent(backend: DriveBackend) {
  useEffect(() => {
    if (backend.kind !== "server") return;
    const { base, driveId, live } = backend;
    let down = false;
    let lastRead = Date.now();
    const read = () => {
      lastRead = Date.now();
      void live.refresh();
    };
    const listen = () =>
      startLiveFeed(base, driveId, live, {
        onEvent: () => {
          down = false;
        },
        onDown: (error) => {
          down = true;
          console.warn("Power BD: live updates paused; checking the server every minute.", error);
        },
      });
    let stop = listen();
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastRead >= (down ? FEED_DOWN_MS : SAFETY_NET_MS)) read();
    }, 15_000);
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (down) {
        stop();
        stop = listen();
      }
      if (Date.now() - lastRead >= FEED_DOWN_MS) read();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stop();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [backend]);
}

/** Decides where the drive's data comes from and keeps a server drive's copy current. */
export function DriveDataProvider({ driveId, children }: { driveId: string; children: ReactNode }) {
  const directory = useSwitchboards();
  const home = use(homeOf(directory, driveId));
  const backend = useMemo<DriveBackend>(
    () => (home.kind === "server" ? serverBackend(home.base, driveId) : { kind: "connect", driveId }),
    [home, driveId],
  );
  useKeptCurrent(backend);
  return <BackendContext value={backend}>{children}</BackendContext>;
}

/** The open drive's backend; undefined outside the app (a record opened on its own). */
export function useDriveBackend(): DriveBackend | undefined {
  return useContext(BackendContext);
}

const noSubscribe = () => () => undefined;
const nothing = () => undefined;
function useLiveSnapshot(backend: DriveBackend | undefined) {
  const live = backend?.kind === "server" ? backend.live : undefined;
  return useSyncExternalStore(live ? live.subscribe : noSubscribe, live ? live.getSnapshot : nothing);
}

/** The drive's tree, or undefined until known. */
export function useDriveNodes() {
  const backend = useDriveBackend();
  const connect = useNodesInSelectedDrive();
  const snapshot = useLiveSnapshot(backend);
  return backend?.kind === "server" ? snapshot?.nodes : connect;
}

// Each record left out is named once per session, however many views ask.
const named = new Set<string>();
const check = createLoadableChecks({
  onRefused: (ids) => {
    const fresh = ids.filter((id) => !named.has(id));
    if (fresh.length === 0) return;
    fresh.forEach((id) => named.add(id));
    console.warn(
      `Power BD: left out ${fresh.length} record(s) this server refuses or no longer has: ${fresh.join(", ")}. A stale copy of the drive in this browser is the usual cause.`,
    );
  },
});

/**
 * Connect's records of the open drive, as the stack's `useDocumentsInSelectedDrive`
 * returns them, except that a record the server refuses is left out instead of
 * failing every view. It suspends while they first load; later changes keep the
 * views on what they show until the new set has loaded.
 */
function useConnectDocuments(enabled: boolean) {
  const nodes = useNodesInSelectedDrive();
  const cache = useDocumentCache();
  const listed = useMemo(
    () => (enabled ? nodes?.filter((node) => node.kind === "file").map((node) => node.id) : undefined),
    [nodes, enabled],
  );
  const ids = useDeferredValue(listed);
  const loadable = ids?.length && cache ? use(check(cache, ids)) : undefined;
  const documents = useDocuments(loadable?.ok as string[] | undefined);
  return ids === undefined ? undefined : documents;
}

/**
 * The open drive's records. It suspends while they first load and stays live;
 * a record the server refuses or no longer has is left out.
 */
export function useDriveDocuments(): readonly PHDocument[] | undefined {
  const backend = useDriveBackend();
  const server = backend?.kind === "server" ? backend : undefined;
  const snapshot = useLiveSnapshot(backend);
  const connect = useConnectDocuments(!server);
  if (!server) return connect;
  if (!snapshot || snapshot.status === "loading") use(server.ready);
  return snapshot?.documents;
}

/** Whether the server drive's last read failed, and why; nothing for a drive kept here. */
export function useDriveProblem(): string | undefined {
  const snapshot = useLiveSnapshot(useDriveBackend());
  return snapshot?.error;
}

/** One record, without waiting: undefined until it is held. */
export function useRecordSafe(id: string | undefined): PHDocument | undefined {
  const backend = useDriveBackend();
  const snapshot = useLiveSnapshot(backend);
  const connect = useDocumentSafe(backend?.kind === "server" ? undefined : id).data;
  return backend?.kind === "server" ? (id ? snapshot?.byId.get(id) : undefined) : connect;
}

/** The drive's icon as kept. */
export function useDriveIcon(driveId: string): string | null | undefined {
  const backend = useDriveBackend();
  const snapshot = useLiveSnapshot(backend);
  // Connect always holds the open drive; the live copy's version is fresher for a shared one.
  const [drive] = useDriveById(driveId);
  const kept = backend?.kind === "server" && snapshot?.drive ? snapshot.drive.state : drive.state;
  return (kept as { global?: { icon?: string | null } } | undefined)?.global?.icon;
}

type OnErrors = (errors: Error[]) => void;
type OnSuccess = Parameters<DocumentDispatch>[2];

export interface DriveWrite {
  /** Sends actions to a document, as Connect's `dispatchActions`. */
  dispatchTo: (actions: Action | Action[], documentId: string, onErrors?: OnErrors, onSuccess?: OnSuccess) => Promise<void>;
  /** A document's dispatch, as Connect hands one to an editor; the same function each time. */
  dispatcher: <A extends Action>(documentId: string) => DocumentDispatch<A>;
  /** Renames a record and its entry in the drive. */
  rename: (documentId: string, name: string) => Promise<void>;
}

function writesFor(backend: DriveBackend | undefined, selectedDriveId: string | undefined): DriveWrite {
  const dispatchTo: DriveWrite["dispatchTo"] =
    backend?.kind === "server"
      ? async (actions, documentId, onErrors, onSuccess) => {
          try {
            const { document, rejected } = await backend.live.write(documentId, Array.isArray(actions) ? actions : [actions]);
            if (rejected.length > 0) onErrors?.(rejected);
            onSuccess?.(document, { rejected });
          } catch (e) {
            onErrors?.([e instanceof Error ? e : new Error(String(e))]);
          }
        }
      : async (actions, documentId, onErrors, onSuccess) => {
          await dispatchActions(actions, documentId, onErrors, onSuccess);
        };
  const dispatchers = new Map<string, DocumentDispatch<Action>>();
  return {
    dispatchTo,
    dispatcher: <A extends Action>(documentId: string) => {
      let d = dispatchers.get(documentId);
      if (!d) {
        d = (actions, onErrors, onSuccess) => {
          if (actions !== undefined) void dispatchTo(actions, documentId, onErrors, onSuccess);
        };
        dispatchers.set(documentId, d);
      }
      return d;
    },
    rename: async (documentId, name) => {
      if (backend?.kind === "server") {
        await renameOnServer(backend.base, backend.driveId, documentId, name);
        await backend.live.syncTree();
        return;
      }
      const driveId = backend?.driveId ?? selectedDriveId;
      if (driveId) await renameDriveNode(driveId, documentId, name);
    },
  };
}

/** How the open drive is written to: its server for a shared drive, Connect otherwise. */
export function useDriveWrite(): DriveWrite {
  const backend = useDriveBackend();
  const selected = useSelectedDriveId();
  return useMemo(() => writesFor(backend, selected ?? undefined), [backend, selected]);
}

/** The dispatch of a record not known yet: it says so instead of sending anything. */
const notLoaded: DocumentDispatch = (_actions, onErrors) => onErrors?.([new Error("This record has not loaded yet.")]);

/** A record and its dispatch, as the generated `use…DocumentById` hooks give them; suspends while records first load. */
export function useRecordById<D extends PHDocument, A extends Action>(
  id: string | null | undefined,
  is: (document: PHDocument) => document is D,
): [D | undefined, DocumentDispatch<A>] {
  const documents = useDriveDocuments();
  const write = useDriveWrite();
  const found = id ? documents?.find((d) => d.header.id === id) : undefined;
  const dispatch = useMemo(() => (id ? write.dispatcher<A>(id) : (notLoaded as DocumentDispatch<A>)), [write, id]);
  return [found && is(found) ? found : undefined, dispatch];
}

/**
 * A record editor's document and dispatch. Inside the app, for a shared drive,
 * the live copy's document (fresher than Connect's) and a dispatch that writes
 * to the drive's server; anywhere else, what Connect handed the editor.
 */
export function useEditorRecord<D extends PHDocument, A extends Action>(
  document: D,
  dispatch: DocumentDispatch<A>,
): [D, DocumentDispatch<A>] {
  const backend = useDriveBackend();
  const server = backend?.kind === "server";
  const live = useRecordSafe(server ? document.header.id : undefined);
  const write = useDriveWrite();
  if (!server) return [document, dispatch];
  return [(live as D | undefined) ?? document, write.dispatcher<A>(document.header.id)];
}
