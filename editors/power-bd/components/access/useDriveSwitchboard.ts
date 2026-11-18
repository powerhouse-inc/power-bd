import { useSwitchboards } from "@powerhousedao/reactor-browser";
import { useEffect, useState } from "react";

/** Where a drive is kept, as the host's directory places it. */
export type DriveHome =
  /** On a server: `base` is its address. */
  | { kind: "server"; base: string }
  /** Only in this browser. */
  | { kind: "here" }
  /** The directory could not be asked. */
  | { kind: "unknown" };

type Directory = ReturnType<typeof useSwitchboards>;

/** Asks the host's directory where a drive is kept. */
export async function placeDrive(
  directory: Directory,
  driveId: string,
  signal?: AbortSignal,
): Promise<DriveHome> {
  if (!directory) return { kind: "unknown" };
  try {
    const entry = await directory.locate(driveId, signal);
    return entry ? { kind: "server", base: entry.base } : { kind: "here" };
  } catch {
    return { kind: "unknown" };
  }
}

/** Where this drive is kept, or undefined while it is being looked up. */
export function useDriveHome(driveId: string | undefined): DriveHome | undefined {
  const directory = useSwitchboards();
  const [found, setFound] = useState<{ driveId: string; home: DriveHome }>();
  useEffect(() => {
    if (!driveId) return;
    const ask = new AbortController();
    void placeDrive(directory, driveId, ask.signal).then((home) => {
      if (!ask.signal.aborted) setFound({ driveId, home });
    });
    return () => ask.abort();
  }, [directory, driveId]);
  return driveId && found?.driveId === driveId ? found.home : undefined;
}

/**
 * The address of the server that holds this drive, as the host's directory
 * places it ("" for the page's own origin when it can't), or undefined while
 * it is being looked up. The same lookup the chat uses for its service.
 */
export function useDriveSwitchboard(driveId: string | undefined): string | undefined {
  const home = useDriveHome(driveId);
  if (home === undefined) return undefined;
  return home.kind === "server" ? home.base : "";
}
