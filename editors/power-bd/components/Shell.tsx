import {
  addDocument,
  addFolder,
  dispatchActions,
  loadDriveNodes,
  useDocumentById,
  useDriveById,
  useNodesInSelectedDrive,
  useSelectedNode,
  useSetSelectedNode,
} from "@powerhousedao/reactor-browser";
import { setDriveIcon } from "@powerhousedao/shared/document-drive";
import type { ReactNode } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  isShortcut,
  placeOf,
  type Entry,
  type QuickAction,
} from "../kit/search/index.js";
import { countsByPlace } from "../kit/drive-plan.js";
import { setUpDrive } from "../kit/init-drive.js";
import { placeById, type PlaceId, type SaveState } from "../kit/places.js";
import { openProposalCount } from "../kit/proposal-list/index.js";
import { recordTitle } from "../kit/record-name/index.js";
import {
  InvestorRowProvider,
  PlaceProvider,
  type InvestorRowRequest,
} from "./PlaceContext.js";
import { SEARCH_PROVIDERS } from "./search/providers.js";
import { SearchPalette } from "./search/SearchPalette.js";
import { useCreateRecord } from "./shared/useCreateRecord.js";
import { Sidebar } from "./Sidebar.js";
import { ShellProvider } from "./ShellContext.js";
import { PLACE_VIEWS } from "./placeViews.js";
import { Sprite } from "./Icon.js";
import { TopBar } from "./TopBar.js";
import { AgentView } from "./chat/AgentView.js";
import { ChatDock } from "./chat/ChatDock.js";
import { ChatHolder } from "./chat/ChatHolder.js";
import { useChatPresentation } from "./chat/useChatChoices.js";
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
  const [place, setPlace] = useState<PlaceId>("overview");
  const [settingUp, setSettingUp] = useState(true);
  const [searching, setSearching] = useState(false);
  const [investorRow, setInvestorRow] = useState<InvestorRowRequest>();
  // The agent: in full view it is the Agent place; beside, a panel that
  // stays open across places. "Ask the agent" opens the person's choice.
  const [chatBeside, setChatBeside] = useState(false);
  const [cameFrom, setCameFrom] = useState<{ place: PlaceId; recordId?: string }>();
  const [presentation, setPresentation] = useChatPresentation();
  const online = useOnline();
  const nodes = useNodesInSelectedDrive();
  const selected = useSelectedNode();
  const setSelectedNode = useSetSelectedNode();
  const proposals = useProposalDocumentsInSelectedDrive() ?? [];

  // The drive's icon as the set-up finds it: an icon-less drive gets the app's own.
  const [drive] = useDriveById(driveId);
  const icon = drive.state.global.icon;
  const driveIcon = useRef(icon);
  useEffect(() => {
    driveIcon.current = icon;
  }, [icon]);

  // First open: create the folders and single records the drive is missing.
  useEffect(() => {
    let live = true;
    setUpDrive(driveId, {
      loadNodes: () => loadDriveNodes(driveId, { refresh: true }),
      addFolder: (name) => addFolder(driveId, name),
      addDocument: (name, type) => addDocument(driveId, name, type),
      icon: {
        current: driveIcon.current,
        set: (icon) => dispatchActions(setDriveIcon({ icon }), driveId),
      },
    })
      .catch((error: unknown) =>
        console.error("Power BD: drive set-up failed", error),
      )
      .finally(() => {
        if (live) setSettingUp(false);
      });
    return () => {
      live = false;
    };
  }, [driveId]);

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
    : settingUp
      ? "setting-up"
      : "up-to-date";
  const current = placeById(place);
  const PlaceView = place === "agent" ? undefined : PLACE_VIEWS[place];
  const open = children ? selected : undefined;
  const atAgent = place === "agent" && !children;
  const besideOpen = chatBeside && !atAgent;
  const [openDocument] = useDocumentById(open?.id);
  // The crumb reads the record's own title; the entry's name can lag behind it.
  const openTitle = open
    ? (recordTitle(openDocument?.header.documentType, openDocument?.state) ??
      open.name)
    : undefined;
  const goTo = (id: PlaceId, recordId?: string) => {
    setPlace(id);
    setInvestorRow(undefined);
    setSelectedNode(recordId);
  };
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
        if (home) setPlace(home);
        setInvestorRow(undefined);
        setSelectedNode(target.id);
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
    const id = await creators[action.id].create(NEW_NAMES[action.id]);
    if (id) setPlace(action.place);
    return id !== undefined;
  };
  const closeSearch = () => {
    setSearching(false);
    for (const c of Object.values(creators)) c.setError(null);
  };

  return (
    <ShellProvider value={true}>
      <PlaceProvider value={pick}>
        <ChatHolder driveId={driveId}>
        <div className="pb-root pb-fill-height pb-fill-height--full">
          <Sprite />
          <div className={besideOpen ? "pb-app pb-app--chat" : "pb-app"}>
            <Sidebar
              active={place}
              counts={countsByPlace(
                nodes ?? [],
                openProposalCount(proposals.map((d) => d.state.global.status)),
              )}
              onPick={pick}
            />
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
                  {children ||
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
                    ))}
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
