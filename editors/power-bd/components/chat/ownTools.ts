/**
 * The tools Power BD brings to the chat itself, on the client that holds the
 * open space: the space's Switchboard for a shared space, read and written
 * with the person's own identity like the rest of the app (driveData.tsx),
 * and Connect for a space kept only in this browser.
 */
import { getPHStore } from "@powerhousedao/reactor-browser";
import { reactorTools, toMcpTool } from "@powerhousedao/reactor-mcp/tools";
import {
  bdHistoryTools,
  historySource,
  serverToolClient,
  type HistoryClient,
  type ModelLookups,
  type OwnTools,
} from "../../kit/chat/index.js";
import type { DriveBackend } from "../data/driveData.js";
import { serverClient } from "../serverWrites.js";

/**
 * Connect's reactor client, for what `needs` names. Its type lists fewer reads
 * than it has (Connect's own tools call the model and relationship reads on
 * it), so each one used is checked here rather than assumed.
 */
function connectClient<T extends object>(needs: readonly (keyof T)[]): T {
  const client = getPHStore()?.reactorClient as Partial<T> | undefined;
  if (!client || needs.some((name) => typeof client[name] !== "function"))
    throw new Error("The reactor client is not available yet. Try again shortly.");
  return client as T;
}

const MODEL_READS = [
  "getDocumentModelModules",
  "getDocumentModelModule",
  "getDocumentModelModuleForDocument",
] as const satisfies readonly (keyof ModelLookups)[];
const HISTORY_READS = ["get", "getOutgoingRelationships", "getOperations"] as const satisfies readonly (keyof HistoryClient)[];

/** Power BD's own tools for the open space; resolved at each message, so the latest team names apply. */
export function ownTools(
  backend: DriveBackend | undefined,
  bdDriveId: string,
  nameFor: (address: string) => string | undefined,
): OwnTools {
  if (backend?.kind === "server") {
    const server = serverClient(backend.base);
    const client = serverToolClient(server, connectClient<ModelLookups>(MODEL_READS));
    return {
      reactor: reactorTools().map((tool) => toMcpTool(tool, { client })),
      bd: bdHistoryTools(historySource(server, bdDriveId, nameFor), bdDriveId),
    };
  }
  const connect = connectClient<HistoryClient>(HISTORY_READS);
  return { bd: bdHistoryTools(historySource(connect, bdDriveId, nameFor), bdDriveId) };
}
