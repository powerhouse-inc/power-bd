import {
  getNodeTarget,
  useDriveNode,
  useDrives,
  useLinkProps,
} from "@powerhousedao/reactor-browser";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  SEARCH_RULES,
  linkView,
  openPlan,
  searchText,
  type SearchResult,
  type VaultNote,
} from "../../kit/vault/index.js";
import { noteStore, vaultClient, vaultSearch } from "./vault.js";
import { useBdSettingsDocumentsInSelectedDrive } from "../useDriveDocuments.js";

/** The vault named in this space's Settings; null while none is. */
export function useVaultDriveId(): string | null {
  const settings = useBdSettingsDocumentsInSelectedDrive()?.[0];
  return settings?.state.global.vaultDriveId?.trim() || null;
}

const subscribe = (listener: () => void) => noteStore.subscribe(listener);

/**
 * How a linked note shows today, and the props of the link that opens it in
 * the vault app (none when it can't be opened from here; `why` says so when
 * that helps). Reads only: the record keeps the title it was linked with.
 */
export function useVaultLink(note: VaultNote) {
  const vaultDriveId = useVaultDriveId();
  const entry = useSyncExternalStore(subscribe, () =>
    vaultDriveId ? noteStore.get(vaultDriveId, note.id) : undefined,
  );
  useEffect(() => {
    if (vaultDriveId) noteStore.want(vaultDriveId, note.id);
  }, [vaultDriveId, note.id]);
  const view = linkView(note, vaultDriveId, entry);
  const drive = useDrives()?.find((d) => d.header.id === vaultDriveId);
  const node = useDriveNode(
    view.state === "live" && drive ? drive.header.id : null,
    note.id,
  );
  const target = drive && node ? getNodeTarget(node, drive) : undefined;
  const linkProps = useLinkProps(target);
  const plan = openPlan(view, {
    drive: drive !== undefined,
    node: node !== undefined,
  });
  return {
    view,
    link: plan.can && target ? linkProps : undefined,
    why: plan.why,
  };
}

/** The vault's last answer for what is typed in a picker, asked once typing rests. */
export function useVaultSearch(
  vaultDriveId: string | null,
  query: string,
): { text: string; result: SearchResult } | null {
  const text = searchText(query);
  const [last, setLast] = useState<{
    driveId: string;
    text: string;
    result: SearchResult;
  } | null>(null);

  useEffect(() => {
    if (!vaultDriveId || !text) return;
    const abort = new AbortController();
    const timer = setTimeout(() => {
      vaultClient
        .search(vaultDriveId, text, SEARCH_RULES.pickerLimit, abort.signal)
        .then(
          (result) => {
            if (!abort.signal.aborted)
              setLast({ driveId: vaultDriveId, text, result });
          },
          // Only a withdrawn request throws; a newer one is on its way.
          () => {},
        );
    }, SEARCH_RULES.restMs);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [vaultDriveId, text]);

  return last && last.driveId === vaultDriveId ? last : null;
}

/** Points the ⌘K palette's vault group at the vault named in Settings; returns it. */
export function useVaultPaletteSource(): string | null {
  const vaultDriveId = useVaultDriveId();
  useEffect(() => {
    vaultSearch.setSource(
      vaultDriveId
        ? {
            driveId: vaultDriveId,
            search: (text, limit, signal) =>
              vaultClient.search(vaultDriveId, text, limit, signal),
          }
        : null,
    );
  }, [vaultDriveId]);
  return vaultDriveId;
}
