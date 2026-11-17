/**
 * The chat's tools: the host's, narrowed to what BD needs and wrapped so the
 * rules hold whatever the model asks. The reactor's document tools read and
 * change records; the vault's tools read notes. Drive administration,
 * workflows and switchboard schemas are left out. Every write, the eight
 * people-only steps included, asks on the stack's approval card unless the
 * person turned auto-approve on.
 */
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
  inputSchema: unknown;
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

/** A tool's answer that it refused, as the MCP envelope the agent unwraps. */
function refused(message: string) {
  return { isError: true, content: [{ type: "text", text: `Error: ${message}` }] };
}

/** The tools the chat offers, each wrapped by the rules that apply to it. */
export function bdChatTools<T extends ChatTool>(tools: readonly T[], drives: VaultDrives): T[] {
  return tools
    .filter((tool) => REACTOR_TOOLS.has(tool.name) || isVaultTool(tool))
    .map((tool) => redacted(isVaultTool(tool) ? routed(tool, drives) : tool));
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
