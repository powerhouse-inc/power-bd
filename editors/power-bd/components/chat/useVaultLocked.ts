/**
 * Whether the vault named in Settings refused this person: read the way every
 * view reads a drive (`probeDrive`), on the server the host's directory places
 * the vault on, once per person and vault for the page. Only a refusal counts:
 * while the answer is coming, or when the server can't give one, the vault is
 * taken as readable, so nothing is hidden on a guess.
 */
import { useUser } from "@powerhousedao/reactor-browser";
import { useEffect, useState } from "react";
import { refusesReading } from "../../kit/access/access.js";
import { probeDrive } from "../access/accessApi.js";
import { useDriveSwitchboard } from "../access/useDriveSwitchboard.js";

const answers = new Map<string, Promise<boolean>>();

export function useVaultLocked(vaultDriveId: string | null): boolean {
  const base = useDriveSwitchboard(vaultDriveId ?? undefined);
  const me = useUser()?.address ?? "";
  const key = vaultDriveId && base !== undefined ? `${base}\n${vaultDriveId}\n${me}` : undefined;
  const [answer, setAnswer] = useState<{ key: string; locked: boolean }>();
  useEffect(() => {
    if (key === undefined || !vaultDriveId || base === undefined) return;
    let live = true;
    let asked = answers.get(key);
    if (!asked) {
      asked = probeDrive(base, vaultDriveId).then(refusesReading, () => false);
      answers.set(key, asked);
    }
    void asked.then((locked) => {
      if (live) setAnswer({ key, locked });
    });
    return () => {
      live = false;
    };
  }, [key, base, vaultDriveId]);
  return answer !== undefined && answer.key === key && answer.locked;
}
