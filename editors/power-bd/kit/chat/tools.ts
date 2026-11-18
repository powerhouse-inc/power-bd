/**
 * The chat's tools: the host's, narrowed to what BD needs and wrapped so the
 * rules hold whatever the model asks. The reactor's document tools read and
 * change records; the vault's tools read notes; Power BD's own read the BD
 * space's history. Drive administration, workflows and switchboard schemas
 * are left out. Every write, the people-only steps included, asks on
 * the stack's approval card unless the person turned auto-approve on.
 *
 * For a shared space the reactor's tools come from Power BD, built on the
 * space's Switchboard (tool-client.ts), in place of Connect's.
 */
import type { ZodRawShape } from "zod";
import { refused } from "./envelope.js";
import { RECENT_CHANGES_TOOL, RECORD_HISTORY_TOOL } from "./history-tools.js";
import { redactToolResult } from "./redact.js";
import { routeVaultCall, type VaultDrives } from "./vault-drive.js";

/**
 * A tool as the chat agent takes it. Structurally the stack's
 * `PhAiToolDescriptor`, with the callback as a method so a descriptor whose
 * callback takes `never` is accepted as it is.
 */
export interface ChatTool {
  name: string;
  description?: string;
  /** The arguments, as zod fields (the stack's `PhAiToolDescriptor`). */
  inputSchema: ZodRawShape;
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
  callback(args: Record<string, unknown>, context?: unknown): Promise<unknown>;
}

/** The reactor's own tools (`reactorTools()` in reactor-mcp). */
const REACTOR_TOOLS = new Set([
  "getDocumentModels",
  "getDocumentModelSchema",
  "getDrives",
  "getDrive",
  "getDocuments",
  "getDocument",
  "createDocument",
  "addActions",
  "deleteDocument",
]);

/** How the vault package marks each of its tools' descriptions. */
const VAULT_MARK = "Knowledge vault — ";

const isVaultTool = (tool: ChatTool) => tool.description?.startsWith(VAULT_MARK) === true;

/** The chat's tools that read or change the BD space; every other one it offers reads the vault. */
const SPACE_TOOLS = new Set([...REACTOR_TOOLS, RECENT_CHANGES_TOOL, RECORD_HISTORY_TOOL]);

/** Whether a tool the chat offers reads the vault, by its name (as a conversation keeps it). */
export const readsTheVault = (toolName: string) => !SPACE_TOOLS.has(toolName);

/** Tools Power BD brings to the chat itself. */
export interface OwnTools {
  /** The reactor's tools on the space's Switchboard, in place of the host's. */
  reactor?: readonly ChatTool[];
  /** Power BD's own tools, such as the BD space's history. */
  bd?: readonly ChatTool[];
  /** Leave the vault's tools out: the person may not read the vault. */
  withoutVault?: boolean;
  /**
   * Why a record may not be deleted, or null when it may: the record page's
   * rule, checked before the agent's delete reaches the server.
   */
  deleteCheck?: (documentId: string) => Promise<string | null>;
}

/** The tools the chat offers, each wrapped by the rules that apply to it. */
export function bdChatTools(
  tools: readonly ChatTool[],
  drives: VaultDrives,
  own: OwnTools = {},
): ChatTool[] {
  const check = own.deleteCheck;
  const reactor = (own.reactor ?? tools.filter((tool) => REACTOR_TOOLS.has(tool.name))).map((tool) =>
    tool.name === "deleteDocument" && check ? guardedDelete(tool, check) : tool,
  );
  const vault = own.withoutVault ? [] : tools.filter(isVaultTool).map((tool) => routed(tool, drives));
  const taken = new Set([...reactor, ...vault].map((tool) => tool.name));
  const bd = (own.bd ?? []).filter((tool) => !taken.has(tool.name));
  return [...reactor, ...vault, ...bd].map(redacted);
}

/** The delete tool, refusing what the record page keeps before anything is sent. */
function guardedDelete<T extends ChatTool>(tool: T, check: (documentId: string) => Promise<string | null>): T {
  return {
    ...tool,
    callback: async (args: Record<string, unknown>, context?: unknown) => {
      const target = typeof args.documentId === "string" ? args.documentId : typeof args.id === "string" ? args.id : undefined;
      const refusal = target ? await check(target) : "Say which record to delete.";
      return refusal ? refused(refusal) : tool.callback(args, context);
    },
  };
}

/** Any tool, its result cleaned of confidential items before the model reads it. */
function redacted<T extends ChatTool>(tool: T): T {
  return {
    ...tool,
    callback: async (args: Record<string, unknown>, context?: unknown) =>
      redactToolResult(args, await tool.callback(args, context)),
  };
}

/** A vault tool, reading the vault in Settings unless the model names another. */
function routed<T extends ChatTool>(tool: T, drives: VaultDrives): T {
  return {
    ...tool,
    callback: async (args: Record<string, unknown>, context?: unknown) => {
      const route = routeVaultCall(args, drives);
      return "refusal" in route ? refused(route.refusal) : tool.callback(route.args, context);
    },
  };
}
