/**
 * Reading a drive's tree from its server. The set-up decides from this, not
 * from the copy in the browser: on a member's first visit that copy is still
 * empty, and a set-up judged from it would remake what the drive holds.
 */
import { readAnswer } from "../access/access.js";
import type { NodeLike } from "../drive-plan.js";
import type { DriveSnapshot } from "../init-drive.js";

/** Reads a drive's state, which holds its tree and its icon. */
export const DRIVE_TREE_QUERY =
  "query Tree($id: String!) { document(idOrSlug: $id) { document { state } } }";

interface TreeData {
  document?: { document?: { state?: unknown } | null } | null;
}

/** One entry of a drive's tree, or undefined when it is not one. */
export function asNode(raw: unknown): NodeLike | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const n = raw as Record<string, unknown>;
  if (typeof n.id !== "string" || typeof n.name !== "string" || typeof n.kind !== "string")
    return undefined;
  return {
    id: n.id,
    name: n.name,
    kind: n.kind,
    parentFolder: typeof n.parentFolder === "string" ? n.parentFolder : null,
    ...(typeof n.documentType === "string" ? { documentType: n.documentType } : {}),
  };
}

/** The server's answer to the tree query: the drive it holds, or why it gave none. */
export function serverDriveFrom(
  status: number,
  body: unknown,
): { drive: DriveSnapshot } | { problem: string } {
  const answer = readAnswer(status, body);
  if (answer.error !== undefined) return { problem: answer.error };
  const state = (answer.data as TreeData | undefined)?.document?.document?.state as
    | { global?: { nodes?: unknown; icon?: unknown } }
    | undefined;
  const nodes = state?.global?.nodes;
  if (!Array.isArray(nodes))
    return { problem: "The server did not hand over the drive's contents." };
  const icon = state?.global?.icon;
  return {
    drive: {
      nodes: nodes.map(asNode).filter((n): n is NodeLike => n !== undefined),
      icon: typeof icon === "string" ? icon : null,
    },
  };
}
