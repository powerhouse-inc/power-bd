import { useSwitchboards, useUser } from "@powerhousedao/reactor-browser";
import {
  AI_GATEWAY_PATH,
  gatewayConnection,
  resetAiGatewayKey,
  setAiGatewayDemoKey,
  setAiGatewayKey,
  watchAiGatewayAccess,
  type AiGatewayAccess,
  type AiGatewayStatus,
  type UseAiGatewayResult,
} from "@powerhousedao/reactor-browser/ai";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * The agent's service on the server that holds this BD space, as the
 * signed-in person sees it. The stack's `useAiGateway()` asks the page's own
 * origin, which only works where Connect proxies its switchboard's `/api/`
 * (Vetra Studio does not); this asks the switchboard the host's directory
 * places the space on, and the page's origin when it can't place it.
 */
export function useBdGateway(driveId: string): UseAiGatewayResult {
  const address = useUser()?.address;
  const directory = useSwitchboards();
  const [located, setLocated] = useState<{ driveId: string; url: string }>();
  useEffect(() => {
    const ask = new AbortController();
    const place = async () => {
      try {
        return await directory?.locate(driveId, ask.signal);
      } catch {
        return undefined;
      }
    };
    void place().then((entry) => {
      if (!ask.signal.aborted)
        setLocated({ driveId, url: entry ? `${entry.base}${AI_GATEWAY_PATH}` : AI_GATEWAY_PATH });
    });
    return () => ask.abort();
  }, [directory, driveId]);
  const url = located?.driveId === driveId ? located.url : undefined;

  // An answer counts only for the person and the server it was asked for.
  const asked = `${address ?? ""} ${url ?? ""}`;
  const [answer, setAnswer] = useState<{ asked: string; access: AiGatewayAccess }>();
  useEffect(() => {
    if (!url) return;
    return watchAiGatewayAccess((access) => setAnswer({ asked, access }), { url });
  }, [asked, url]);
  const gateway = answer?.asked === asked ? answer.access : undefined;

  // A key set, replaced or removed answers with the new status.
  const admin = useCallback(
    async (call: () => Promise<AiGatewayStatus>) => {
      const status = await call();
      setAnswer({ asked, access: { access: "admin", status } });
    },
    [asked],
  );
  const setKey = useCallback(
    (value: string) => admin(() => setAiGatewayKey(value, { url })),
    [admin, url],
  );
  const setDemoKey = useCallback(() => admin(() => setAiGatewayDemoKey({ url })), [admin, url]);
  const resetKey = useCallback(() => admin(() => resetAiGatewayKey({ url })), [admin, url]);

  const model =
    gateway?.access === "admin" && gateway.status.configured ? gateway.status.model : undefined;
  const connection = useMemo(
    () => (model && url ? gatewayConnection(model, { url }) : undefined),
    [model, url],
  );
  return { gateway, connection, setKey, setDemoKey, resetKey };
}
