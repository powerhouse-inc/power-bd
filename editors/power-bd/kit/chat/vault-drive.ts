/**
 * Where the vault's tools read. On their own they read the drive open in
 * Connect, which in Power BD is the BD space, so a call that names no drive
 * reads the vault named in Settings instead.
 */

export interface VaultDrives {
  /** The vault named in Settings, if any. */
  vaultDriveId: string | null | undefined;
  /** The BD space the chat is opened from. */
  bdDriveId: string;
}

/** The call as it goes to the vault tool, or why it does not go. */
export type VaultRoute = { args: Record<string, unknown> } | { refusal: string };

const NOT_A_VAULT =
  "Refused: that drive is the BD space, not a vault. Read BD records with getDocuments and getDocument; leave driveId out to read the vault named in Settings.";
const NO_VAULT =
  "Refused: no vault is named in Power BD's Settings, so there is no vault to read. Tell the user to name one under Settings, or pass the driveId of a vault they name.";

/**
 * A vault tool's call with the drive it reads: the one it names, or else the
 * vault in Settings. The BD space is never read as a vault.
 */
export function routeVaultCall(
  args: Record<string, unknown>,
  { vaultDriveId, bdDriveId }: VaultDrives,
): VaultRoute {
  const named = typeof args.driveId === "string" && args.driveId !== "" ? args.driveId : null;
  if (named === bdDriveId) return { refusal: NOT_A_VAULT };
  if (named) return { args };
  if (!vaultDriveId) return { refusal: NO_VAULT };
  return { args: { ...args, driveId: vaultDriveId } };
}
