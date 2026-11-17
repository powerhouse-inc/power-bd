/**
 * The vault choice in Settings: the vaults open in this browser, plus the one
 * chosen earlier when it is not among them, so a saved choice is never lost
 * or shown as an id. Pure.
 */
import { vaultDrives, type DriveLike } from "../first-run/index.js";

/** How the vault chosen earlier reads when this browser does not have it open. */
export const EARLIER_VAULT =
  "The vault chosen earlier (not open in this browser)";

export interface VaultChoice {
  /** The selected value: the saved vault, or "" while none is chosen. */
  value: string;
  options: { value: string; label: string }[];
  /** The empty option's label while nothing is chosen; null once a vault is. */
  placeholder: string | null;
  disabled: boolean;
  help: string;
}

export function vaultChoice(
  drives: readonly DriveLike[] | undefined,
  ownDriveId: string,
  saved: string | null | undefined,
): VaultChoice {
  const open = vaultDrives(drives, ownDriveId);
  const value = saved?.trim() ? saved : "";
  const options = open.map((d) => ({ value: d.id, label: d.name }));
  if (value && !open.some((d) => d.id === value))
    options.unshift({ value, label: EARLIER_VAULT });
  return {
    value,
    options,
    placeholder: value
      ? null
      : open.length > 0
        ? "Choose a vault"
        : "No vault open in this browser",
    disabled: options.length === 0,
    help:
      open.length > 0
        ? "Notes linked from leads, funding opportunities, investors and the playbook are looked up and searched in this vault. Only vaults open in this browser are listed."
        : "No vault is open in this browser yet. Add the vault in Connect, then choose it here.",
  };
}
