/**
 * A tool's answer as the stack's agent unwraps it: the MCP `CallToolResult`
 * envelope, the same shape the reactor's and the vault's tools return.
 */

/** A tool's answer: the value as text for the model, and as it is. */
export function answer(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data };
}

/** A tool's answer that it refused; the agent turns it into a tool error. */
export function refused(message: string) {
  return { isError: true, content: [{ type: "text", text: `Error: ${message}` }] };
}
