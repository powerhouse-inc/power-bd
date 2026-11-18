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
 */
import {
  getNodeTarget,
  getTargetHref,
  isFileNodeKind,
  makeDriveSlug,
  useDrives,
  type PHNavigationTarget,
} from "@powerhousedao/reactor-browser";
import type { UseReactorChatResult } from "@powerhousedao/reactor-browser/ai";
import { useMemo } from "react";
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

/** The conversation, its citations resolved against the vault named in Settings. */
export function useCitedChat(chat: UseReactorChatResult, vaultDriveId: string | null): UseReactorChatResult {
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
        if (!ref) return undefined;
        const drive = driveFor(ref);
        const entry = entryIn(drive, documentId);
        const target: PHNavigationTarget = (drive && entry && getNodeTarget(entry, drive)) || {
          driveSlug: drive ? makeDriveSlug(drive) : ref,
          nodeSlug: documentId,
        };
        return new URL(getTargetHref(target), window.location.origin).href;
      },
    };
  }, [drives, vaultDriveId]);
  const messages = useMemo(
    () => citeConversation(chat.messages, source, chat.isStreaming),
    [chat.messages, chat.isStreaming, source],
  );
  return useMemo(() => ({ ...chat, messages }), [chat, messages]);
}
