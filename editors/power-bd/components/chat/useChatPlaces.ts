import { useDrives } from "@powerhousedao/reactor-browser";
import type { ChatReads } from "./ChatFrame.js";
import { useBdSettingsDocumentsInSelectedDrive } from "../useDriveDocuments.js";
import { useVaultLocked } from "./useVaultLocked.js";

/** The space the chat is opened from and the vault named in Settings, with their names, and whether the vault refused this person. */
export function useChatPlaces(driveId: string): {
  vaultDriveId: string | null;
  reads: ChatReads;
} {
  const drives = useDrives();
  const vaultDriveId =
    useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global.vaultDriveId || null;
  const vaultLocked = useVaultLocked(vaultDriveId);
  const nameOf = (id: string) =>
    drives?.find((d) => d.header.id === id)?.state.global.name || undefined;
  return {
    vaultDriveId,
    reads: {
      space: nameOf(driveId) ?? "this space",
      vault: vaultDriveId ? (nameOf(vaultDriveId) ?? "named in Settings") : null,
      vaultLocked,
    },
  };
}
