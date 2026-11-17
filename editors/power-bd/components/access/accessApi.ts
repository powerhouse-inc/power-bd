/**
 * The server calls behind Access: reading the drive the way every view will,
 * and the drive's grants in the server's permission tables. Signed with the
 * person's Renown identity. Every answer is read by the kit's tested readers.
 */
import { ambientRenownTokenProvider } from "@powerhousedao/reactor-browser";
import {
  probeVerdict,
  readAnswer,
  type Answer,
  type Grant,
  type Level,
  type Probe,
} from "../../kit/access/access.js";

type Reply = { status: number; body: unknown } | { failed: string };

async function post(url: string, query: string, variables: Record<string, unknown>): Promise<Reply> {
  let token: string | undefined;
  try {
    token = await ambientRenownTokenProvider();
  } catch {
    token = undefined;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    const body: unknown = await res.json().catch(() => null);
    return { status: res.status, body };
  } catch (error) {
    return { failed: error instanceof Error ? error.message : String(error) };
  }
}

const unreachable = (failed: string) => `The server could not be reached (${failed}).`;

/** Reads the drive itself: allowed, signed out, refused, or unreachable. */
export async function probeDrive(base: string, driveId: string): Promise<Probe> {
  const reply = await post(
    `${base}/graphql`,
    `query Probe($id: String!) { document(idOrSlug: $id) { document { id } } }`,
    { id: driveId },
  );
  return "failed" in reply
    ? { kind: "unreachable", detail: unreachable(reply.failed) }
    : probeVerdict(reply.status, reply.body);
}

async function auth<T>(base: string, query: string, variables: Record<string, unknown>): Promise<Answer<T>> {
  const reply = await post(`${base}/graphql/auth`, query, variables);
  return "failed" in reply
    ? { error: unreachable(reply.failed) }
    : (readAnswer(reply.status, reply.body) as Answer<T>);
}

/** The drive's grants. Answers only an admin of the drive. */
export const askGrants = (base: string, driveId: string) =>
  auth<{ documentAccess: { permissions: Grant[] } }>(
    base,
    `query A($id: String!) { documentAccess(documentIdOrSlug: $id) {
       permissions { documentId userAddress permission grantedBy createdAt } } }`,
    { id: driveId },
  );

/** Gives an address a level on the drive, replacing the one it held. */
export const grantAccess = (base: string, driveId: string, address: string, level: Level) =>
  auth(
    base,
    `mutation G($id: String!, $a: String!, $p: DocumentPermissionLevel!) {
       grantDocumentPermission(documentIdOrSlug: $id, userAddress: $a, permission: $p) {
         userAddress permission } }`,
    { id: driveId, a: address, p: level },
  );

/** Removes an address's grant on the drive. */
export const revokeAccess = (base: string, driveId: string, address: string) =>
  auth(
    base,
    `mutation R($id: String!, $a: String!) {
       revokeDocumentPermission(documentIdOrSlug: $id, userAddress: $a) }`,
    { id: driveId, a: address },
  );
