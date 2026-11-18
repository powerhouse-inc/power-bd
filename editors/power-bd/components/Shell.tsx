import {
  addDocument,
  dispatchActions,
  loadDriveNodes,
  useSelectedNode,
  useSetSelectedNode,
} from "@powerhousedao/reactor-browser";
import { setDriveIcon } from "@powerhousedao/shared/document-drive";
import type { ReactNode } from "react";
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  isShortcut,
  placeOf,
  type Entry,
  type QuickAction,
} from "../kit/search/index.js";
import { driveIconToSet } from "../kit/app-icon.js";
import { countsByPlace, planDriveSetup } from "../kit/drive-plan.js";
import { setUpDrive, type SetupDeps } from "../kit/init-drive.js";
import { openingSpot, spotStore, type CameFrom } from "../kit/last-spot/last-spot.js";
import {
  hashOf,
  placeById,
  placeFromHash,
  type PlaceId,
  type SaveState,
} from "../kit/places.js";
import { openProposalCount } from "../kit/proposal-list/index.js";
import { recordTitle } from "../kit/record-name/index.js";
import {
  InvestorRowProvider,
  PlaceProvider,
  type InvestorRowRequest,
} from "./PlaceContext.js";
import { SEARCH_PROVIDERS } from "./search/providers.js";
import { SearchPalette } from "./search/SearchPalette.js";
import { readServerDrive } from "./access/accessApi.js";
import {
  useDriveBackend,
  useDriveIcon,
  useDriveNodes,
  useDriveProblem,
  useDriveWritable,
  useRecordSafe,
} from "./data/driveData.js";
import { addTopFolders } from "./driveSetup.js";
import { isLiveRecord, LiveRecord } from "./LiveRecord.js";
import { currentRequest, requestOpen, useRequestedRecord } from "./shared/useOpenRecord.js";
import { addFoldersOnServer, createOnServer, setIconOnServer } from "./serverWrites.js";
import { useCreateRecord } from "./shared/useCreateRecord.js";
import { Sidebar } from "./Sidebar.js";
import { ShellProvider } from "./ShellContext.js";
import { PLACE_VIEWS } from "./placeViews.js";
import { Sprite } from "./Icon.js";
import { PlaceLoading } from "./PlaceLoading.js";
import { TopBar } from "./TopBar.js";
import { AgentView } from "./chat/AgentView.js";
import { ChatDock } from "./chat/ChatDock.js";
import { ChatHolder } from "./chat/ChatHolder.js";
import { browserStorage, useChatPresentation, usePerson } from "./chat/useChatChoices.js";
import { useProposalDocumentsInSelectedDrive } from "./useDriveDocuments.js";

function subscribeOnline(notify: () => void) {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
}
const useOnline = () =>
  useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

/** Drives whose records this page has loaded once: coming back paints at once. */
const loadedOnce = new Set<string>();

/** Where each person last was in each space, in this browser (kit/last-spot). */
const spots = spotStore(browserStorage);

/** This address with another hash; an empty one removes it. */
const addressWith = (hash: string) => `${window.location.pathname}${window.location.search}${hash}`;
/** How long a record opened or closed here may take before the address is given its place anyway. */
const MOVE_PATIENCE_MS = 5000;
/** Whether the address shows the record Connect has selected (or, with none, no record): no move under way. */
const addressShows = (pathname: string, recordId: string | undefined) => {
  // Connect's addresses are …/d/<drive>/<record>, under any base path.
  const parts = pathname.split("/").filter(Boolean);
  const at = parts.indexOf("d");
  const nodeSlug = at === -1 ? undefined : parts[at + 2];
  return recordId ? (nodeSlug?.endsWith(recordId) ?? false) : nodeSlug === undefined;
};

/**
 * The app's frame: sidebar, top bar and the place being shown. An open
 * record's editor (`children`) takes the place's spot, and the sidebar stays.
 */
export function Shell({
  driveId,
  children,
}: {
  driveId: string;
  children: ReactNode;
}) {
  // Where the space opens: the place the address names (`#leads`), so a reload
  // stays and a link opens it; else where this person last was here, with the
  // record and the agent as they were. So opening the space from Connect's
  // sidebar, after following a citation into the vault, comes back.
  const person = usePerson();
  const [opening] = useState(() =>
    openingSpot(
      {
        place: placeFromHash(window.location.hash),
        namesRecord: !addressShows(window.location.pathname, undefined),
      },
      spots.read(driveId, person),
    ),
  );
  const [place, setPlace] = useState<PlaceId>(opening.place);
  // The record this person had open, still to open again (see below); any move
  // the person makes first cancels it, so it never lands on top of their choice.
  const reopen = useRef(opening.record);
  const [searching, setSearching] = useState(false);
  const [investorRow, setInvestorRow] = useState<InvestorRowRequest>();
  // The agent: in full view it is the Agent place; beside, a panel that
  // stays open across places. "Ask the agent" opens the person's choice.
  const [chatBeside, setChatBeside] = useState(opening.beside);
  const [cameFrom, setCameFrom] = useState<CameFrom | undefined>(opening.from);
  const [presentation, setPresentation] = useChatPresentation();
  const online = useOnline();
  const nodes = useDriveNodes();
  // A shared drive whose server did not answer the last read: say so, not "Up to date".
  const problem = useDriveProblem();
  const selected = useSelectedNode();
  const setSelectedNode = useSetSelectedNode();
  // The record asked for here: a shared drive's record shows from the live
  // copy at once, before Connect's own copy holds it (see useOpenRecord).
  const requested = useRequestedRecord();

  // The drive's icon as the set-up finds it: an icon-less drive gets the app's own.
  const icon = useDriveIcon(driveId);
  const driveIcon = useRef(icon);
  useEffect(() => {
    driveIcon.current = icon;
  }, [icon]);

  // What the drive is missing, as far as the records known here show. A space
  // set up before asks nothing on opening. One that looks incomplete asks the
  // drive's home: its server for a shared drive, so a member whose copy is
  // still arriving makes nothing (the server would refuse the second set),
  // and this browser for a drive kept only here. Unplaced, nothing is made.
  const known = nodes !== undefined;
  const plan = known ? planDriveSetup(nodes) : undefined;
  const missing = plan !== undefined && plan.folders.length + plan.singletons.length > 0;
  const needsSetUp = missing || (known && driveIconToSet(icon) !== null);
  const [setUpFailed, setSetUpFailed] = useState<string>();

  // The records' first load runs in the background: the place shows its
  // loading state until what it needs is there, then the place and the
  // sidebar's counts fill in together. Committing a fallback instead would
  // hold the content back for React's 300 ms reveal throttle.
  const ready = useDeferredValue(known, known && loadedOnce.has(driveId));
  useEffect(() => {
    if (ready) loadedOnce.add(driveId);
  }, [ready, driveId]);
  const backend = useDriveBackend();
  const writable = useDriveWritable();
  useEffect(() => {
    if (!needsSetUp || !backend || !writable) return;
    // A shared drive is set up on its server, where a member's writes are
    // checked against the drive; one kept only here, through Connect.
    const server = backend.kind === "server" ? backend : undefined;
    const deps: SetupDeps = server
        ? {
            loadDrive: () => readServerDrive(server.base, driveId),
            addFolders: (names) => addFoldersOnServer(server.base, driveId, names),
            addDocument: (name, type) => createOnServer(server.base, driveId, name, type),
            setIcon: (icon) => setIconOnServer(server.base, driveId, icon),
          }
        : {
            loadDrive: async () => ({
              nodes: await loadDriveNodes(driveId, { refresh: true }),
              icon: driveIcon.current,
            }),
            addFolders: (names) => addTopFolders(driveId, names),
            addDocument: (name, type) => addDocument(driveId, name, type),
            setIcon: (icon) => dispatchActions(setDriveIcon({ icon }), driveId),
          };
    setUpDrive(driveId, deps)
      .then((made) => (server && made > 0 ? server.live.syncTree() : undefined))
      .catch((error: unknown) => {
        console.error("Power BD: drive set-up failed", error);
        setSetUpFailed(driveId);
      });
  }, [driveId, needsSetUp, backend, writable]);

  // ⌘K or Ctrl+K opens search from anywhere in the app, and closes it again.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isShortcut(e)) return;
      e.preventDefault();
      setSearching((on) => !on);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The same create flow as each place's "New" button.
  const creators = {
    "new-lead": useCreateRecord(
      driveId,
      "Leads",
      "powerbd/lead",
      "The lead could not be created.",
    ),
    "new-opportunity": useCreateRecord(
      driveId,
      "Opportunities",
      "powerbd/opportunity",
      "The opportunity could not be created.",
    ),
    "new-organisation": useCreateRecord(
      driveId,
      "Organisations",
      "powerbd/contact",
      "The organisation could not be created.",
    ),
  };
  const NEW_NAMES: Record<QuickAction["id"], string> = {
    "new-lead": "New lead",
    "new-opportunity": "New opportunity",
    "new-organisation": "New organisation",
  };

  const saveState: SaveState = !online
    ? "offline"
    : problem
      ? "unreachable"
      : !writable
        ? "view-only"
        : missing && setUpFailed !== driveId
      ? "setting-up"
      : "up-to-date";
  const current = placeById(place);
  const PlaceView = place === "agent" ? undefined : PLACE_VIEWS[place];
  const liveId = backend?.kind === "server" ? (requested ?? selected?.id) : undefined;
  const liveDocument = useRecordSafe(liveId);
  const liveRecord = liveDocument && isLiveRecord(liveDocument) ? liveDocument : undefined;
  const record = liveRecord ? <LiveRecord document={liveRecord} /> : children;
  const open = liveRecord
    ? { id: liveRecord.header.id, name: liveRecord.header.name }
    : children
      ? selected
      : undefined;
  const atAgent = place === "agent" && !record;
  const besideOpen = chatBeside && !atAgent;
  // The crumb reads the record's own title once it has loaded (the entry's
  // name can lag behind it), without holding up the frame until then.
  const openDocument = useRecordSafe(open?.id);
  const openTitle = open
    ? (recordTitle(openDocument?.header.documentType, openDocument?.state) ??
      open.name)
    : undefined;
  /** A record opened or closed here that Connect has not finished moving to yet. */
  const connectMove = useRef<{ to: string | undefined; at: number } | null>(null);
  const goTo = (id: PlaceId, recordId?: string) => {
    reopen.current = undefined;
    requestOpen(recordId);
    setPlace(id);
    setInvestorRow(undefined);
    // Opening or closing a record is Connect's move, with its own history
    // entry (the place joins it below); a move between places is ours.
    if (selected?.id !== recordId) {
      connectMove.current = { to: recordId, at: Date.now() };
      setSelectedNode(recordId);
    } else if (id !== place) window.history.pushState(window.history.state, "", addressWith(hashOf(id)));
  };

  // Back and Forward: the address names the place, and Connect restores the record.
  useEffect(() => {
    const onPop = () => {
      reopen.current = undefined;
      requestOpen(undefined);
      setPlace(placeFromHash(window.location.hash) ?? "overview");
      setInvestorRow(undefined);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Every address carries its place. Connect's new entries (a record opened
  // or closed) and its own rewrites (a record renamed gets a new address)
  // come without one and get it here, after every render. An address that
  // names a place is never written over, because Connect's router can redraw
  // for Back and Forward before the app hears of them. Nothing is written
  // while Connect is still moving: writing the address under a move it has
  // started left the record open with the address saying it was closed.
  const selectedId = selected?.id;
  // A record asked for here gives way to Connect's selection once it moves on:
  // to another record (Back, Forward, a link), or away from the asked record
  // (its toolbar closed it). A selection that drops a record it could not find
  // leaves the request standing.
  const wasSelected = useRef(selectedId);
  useEffect(() => {
    const was = wasSelected.current;
    wasSelected.current = selectedId;
    const asked = currentRequest();
    if (asked === undefined) return;
    if (selectedId !== undefined ? selectedId !== asked : was === asked) requestOpen(undefined);
  }, [selectedId]);
  // A request belongs to the drive it was made in.
  useEffect(() => () => requestOpen(undefined), [driveId]);
  useEffect(() => {
    const move = connectMove.current;
    if (move) {
      if (selectedId !== move.to && Date.now() - move.at < MOVE_PATIENCE_MS) return;
      connectMove.current = null;
    }
    if (!addressShows(window.location.pathname, selectedId)) return;
    if (placeFromHash(window.location.hash) === undefined)
      window.history.replaceState(window.history.state, "", addressWith(hashOf(place)));
  });
  // The record this person had open, opened again once the space's records are
  // known, if it is still here and they have not moved first (another place,
  // or a record Connect opened). It takes the opening's history entry, so Back
  // does not lead to the space without it.
  useEffect(() => {
    const id = reopen.current;
    if (id === undefined) return;
    if (place !== opening.place || selectedId !== undefined) {
      reopen.current = undefined;
      return;
    }
    if (!nodes) return;
    reopen.current = undefined;
    if (!nodes.some((n) => n.kind === "file" && n.id === id)) return;
    requestOpen(id);
    connectMove.current = { to: id, at: Date.now() };
    setSelectedNode(id, { replace: true });
  }, [nodes, setSelectedNode, place, opening.place, selectedId]);
  // Where this person is, kept for the next time the space opens: never while
  // a record is still to reopen or Connect is still moving, and a record only
  // when it is this space's.
  const openId = open?.id;
  useEffect(() => {
    if (reopen.current !== undefined || connectMove.current) return;
    const recordId = place !== "agent" && openId && nodes?.some((n) => n.id === openId) ? openId : undefined;
    spots.write(driveId, person, {
      place,
      ...(recordId ? { recordId } : {}),
      beside: chatBeside,
      ...(cameFrom ? { from: cameFrom } : {}),
    });
  });
  /** The full view: remembers where the person was, and closes the side panel. */
  const openFull = () => {
    if (place !== "agent") setCameFrom({ place, recordId: open?.id });
    setChatBeside(false);
    goTo("agent");
  };
  /** Back where the person came from (the Overview if nowhere), with the panel or without. */
  const leaveFull = (beside: boolean) => {
    goTo(cameFrom?.place ?? "overview", cameFrom?.recordId);
    setChatBeside(beside);
  };
  const pick = (id: PlaceId) => (id === "agent" ? openFull() : goTo(id));
  const askTheAgent = () => {
    if (besideOpen) setChatBeside(false);
    else if (atAgent) leaveFull(false);
    else if (presentation === "side") setChatBeside(true);
    else openFull();
  };

  /** Opens what search found, in the place it lives in. */
  const openEntry = ({ group, target }: Entry) => {
    const home = placeOf(group);
    switch (target.type) {
      case "record":
        goTo(home ?? place, target.id);
        break;
      case "investor-row":
        pick("investors");
        setInvestorRow({ rowId: target.rowId, asked: Date.now() });
        break;
      case "playbook":
        pick("playbook");
        break;
      case "provider":
        SEARCH_PROVIDERS.find((p) => p.id === target.providerId)?.open(
          target.ref,
        );
    }
  };
  const runAction = async (action: QuickAction) => {
    // The place first, so the new record's entry is given it; back if it fails.
    const before = place;
    setPlace(action.place);
    const id = await creators[action.id].create(NEW_NAMES[action.id]);
    if (id === undefined) setPlace(before);
    return id !== undefined;
  };
  const closeSearch = () => {
    setSearching(false);
    for (const c of Object.values(creators)) c.setError(null);
  };

  // Until the drive's records have loaded, a place is loading, never empty.
  const shown = !ready ? (
    <PlaceLoading place={current} />
  ) : (
    record ||
    (PlaceView ? (
      <PlaceView driveId={driveId} />
    ) : (
      <AgentView
        driveId={driveId}
        onBeside={() => {
          setPresentation("side");
          leaveFull(true);
        }}
      />
    ))
  );

  return (
    <ShellProvider value={true}>
      <PlaceProvider value={pick}>
        <ChatHolder driveId={driveId}>
        <div className="pb-root pb-fill-height pb-fill-height--full">
          <Sprite />
          <div className={besideOpen ? "pb-app pb-app--chat" : "pb-app"}>
            <Suspense
              fallback={
                <Sidebar active={place} counts={countsByPlace(nodes ?? [])} onPick={pick} />
              }
            >
              {ready ? (
                <CountedSidebar active={place} nodes={nodes ?? []} onPick={pick} />
              ) : (
                <Sidebar active={place} counts={countsByPlace(nodes ?? [])} onPick={pick} />
              )}
            </Suspense>
            <main className="pb-main">
              <TopBar
                place={current}
                record={openTitle}
                saveState={saveState}
                onPlace={() => pick(place)}
                onSearch={() => setSearching(true)}
                chatOpen={besideOpen || atAgent}
                onChat={askTheAgent}
              />
              <div className={atAgent ? "pb-scroll pb-scroll--fill" : "pb-scroll"}>
                <InvestorRowProvider value={investorRow}>
                  {/* The first load waits here, in the place's pane; the frame is already up. */}
                  <Suspense fallback={<PlaceLoading place={current} />}>{shown}</Suspense>
                </InvestorRowProvider>
              </div>
            </main>
            {besideOpen ? (
              <ChatDock
                driveId={driveId}
                onClose={() => setChatBeside(false)}
                onFull={() => {
                  setPresentation("full");
                  openFull();
                }}
              />
            ) : null}
          </div>
          <SearchPalette
            open={searching}
            onClose={closeSearch}
            onOpen={openEntry}
            onAction={runAction}
            error={Object.values(creators).find((c) => c.error)?.error ?? null}
          />
        </div>
        </ChatHolder>
      </PlaceProvider>
    </ShellProvider>
  );
}

/** The sidebar once the records have loaded: the open proposals join its counts. */
function CountedSidebar({
  active,
  nodes,
  onPick,
}: {
  active: PlaceId;
  nodes: Parameters<typeof countsByPlace>[0];
  onPick: (id: PlaceId) => void;
}) {
  const proposals = useProposalDocumentsInSelectedDrive() ?? [];
  const open = openProposalCount(proposals.map((d) => d.state.global.status));
  return <Sidebar active={active} counts={countsByPlace(nodes, open)} onPick={onPick} />;
}
