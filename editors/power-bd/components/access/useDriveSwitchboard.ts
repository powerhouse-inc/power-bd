import { useSwitchboards } from "@powerhousedao/reactor-browser";
import { useEffect, useState } from "react";

/**
 * The address of the server that holds this drive, as the host's directory
 * places it ("" for the page's own origin when it can't), or undefined while
 * it is being looked up. The same lookup the chat uses for its service.
 */
export function useDriveSwitchboard(driveId: string | undefined): string | undefined {
  const directory = useSwitchboards();
  const [found, setFound] = useState<{ driveId: string; base: string }>();
  useEffect(() => {
    if (!driveId) return;
    const ask = new AbortController();
    const place = async () => {
      try {
        return (await directory?.locate(driveId, ask.signal))?.base ?? "";
      } catch {
        return "";
      }
    };
    void place().then((base) => {
      if (!ask.signal.aborted) setFound({ driveId, base });
    });
    return () => ask.abort();
  }, [directory, driveId]);
  return driveId && found?.driveId === driveId ? found.base : undefined;
}
