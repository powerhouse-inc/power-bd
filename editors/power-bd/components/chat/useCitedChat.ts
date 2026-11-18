/**
 * The conversation as the panel shows it: the agent's `[[documentId]]`
 * markers as numbered chips, and "From the vault" under each answer, every
 * document by its title, opening in the vault app (kit/chat/citations.ts).
 *
 * A document opens where Connect would open it: the vault's drive and the
 * document's entry in it, as `getNodeTarget` names them, at the address
 * Connect's navigation builds (its base path included). That is the same
 * page on localhost and on a deployed Connect. A document the vault's copy in
 * this Connect does not list yet opens by its id, which Connect resolves too.
 *
 * A plain click opens the document in this tab, through Connect's navigation,
 * as the vault's own chat opens its citations: the app is already signed in
 * and holds the vault's drive, where a fresh tab on a protected host may not
 * reach the document. A modified or middle click still opens a new tab. The
 * conversation is kept, so Back finds it as it was.
 */
import {
  extractDriveSlugFromPath,
  extractNodeSlugFromPath,
  getNodeTarget,
  getTargetHref,
  isFileNodeKind,
  isPlainClick,
  makeDriveSlug,
  openTarget,
  useDrives,
  type PHNavigationTarget,
} from "@powerhousedao/reactor-browser";
import type { UseReactorChatResult } from "@powerhousedao/reactor-browser/ai";
import { useEffect, useMemo } from "react";
import {
  citeConversation,
  readsTheVault,
  type CitationSource,
  type CitedDocument,
} from "../../kit/chat/index.js";

type Drive = NonNullable<ReturnType<typeof useDrives>>[number];

/** The file entry for a document in a drive, if the drive lists it. */
function entryIn(drive: Drive | undefined, documentId: string) {
  return drive?.state.global.nodes.filter(isFileNodeKind).find((n) => n.id === documentId);
}

/**
 * The conversation, its citations resolved against the vault named in Settings.
 * A vault that refused this person gets no links: they could not open them.
 */
export function useCitedChat(
  chat: UseReactorChatResult,
  vaultDriveId: string | null,
  vaultLocked = false,
): UseReactorChatResult {
  const drives = useDrives();
  const source = useMemo<CitationSource>(() => {
    const driveFor = (ref: string) => drives?.find((d) => d.header.id === ref || d.header.slug === ref);
    const vault = vaultDriveId ? driveFor(vaultDriveId) : undefined;
    return {
      readsVault: readsTheVault,
      lookUp: (documentId) => {
        const entry = entryIn(vault, documentId);
        return entry ? { name: entry.name, documentType: entry.documentType } : undefined;
      },
      hrefFor: ({ documentId, driveId }: CitedDocument) => {
        const ref = driveId ?? vaultDriveId;
        if (!ref || (vaultLocked && ref === vaultDriveId)) return undefined;
        const drive = driveFor(ref);
        const entry = entryIn(drive, documentId);
        const target: PHNavigationTarget = (drive && entry && getNodeTarget(entry, drive)) || {
          driveSlug: drive ? makeDriveSlug(drive) : ref,
          nodeSlug: documentId,
        };
        return new URL(getTargetHref(target), window.location.origin).href;
      },
    };
  }, [drives, vaultDriveId, vaultLocked]);
  const messages = useMemo(
    () => citeConversation(chat.messages, source, chat.isStreaming),
    [chat.messages, chat.isStreaming, source],
  );
  return useMemo(() => ({ ...chat, messages }), [chat, messages]);
}

/** Where a link in this Connect opens, as a drive and an entry; undefined for any other link. */
function inAppTarget(anchor: HTMLAnchorElement): PHNavigationTarget | undefined {
  let url: URL;
  try {
    url = new URL(anchor.href);
  } catch {
    return undefined;
  }
  if (url.origin !== window.location.origin) return undefined;
  const driveSlug = extractDriveSlugFromPath(url.pathname);
  const nodeSlug = extractNodeSlugFromPath(url.pathname);
  if (!driveSlug || !nodeSlug) return undefined;
  try {
    return { driveSlug: decodeURIComponent(driveSlug), nodeSlug: decodeURIComponent(nodeSlug) };
  } catch {
    return undefined;
  }
}

/**
 * Opens the conversation's links to documents in this Connect in this tab, on
 * a plain click; every other click is the browser's (a new tab).
 */
export function useCitationClicks(element: HTMLElement): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isPlainClick(event) || !(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      const target = anchor instanceof HTMLAnchorElement ? inAppTarget(anchor) : undefined;
      if (!target) return;
      event.preventDefault();
      openTarget(target);
    };
    element.addEventListener("click", onClick);
    return () => element.removeEventListener("click", onClick);
  }, [element]);
}
