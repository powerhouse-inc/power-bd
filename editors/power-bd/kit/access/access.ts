/**
 * Who may open and change the BD space, in the team's words, and the answers
 * the server gives about it.
 *
 * Access lives in the server's permission tables, one grant per address on the
 * space's drive. A grant on the drive covers every record in it. Grants are
 * allow-only: removing access means removing the grant. READ < WRITE < ADMIN is
 * a rank, so granting a level replaces the one an address held.
 */

export type Level = "READ" | "WRITE" | "ADMIN";

export const LEVELS: readonly Level[] = ["READ", "WRITE", "ADMIN"];

const RANK: Record<Level, number> = { READ: 1, WRITE: 2, ADMIN: 3 };

/** Each level as the app names it, and what it allows. */
export const LEVEL_WORDS: Record<Level, { label: string; meaning: string }> = {
  READ: { label: "View", meaning: "Can open the space and read every record." },
  WRITE: { label: "Edit", meaning: "Can also create and change records." },
  ADMIN: {
    label: "Manage",
    meaning: "Can also add and remove people, and change their access.",
  },
};

/** One grant as the server's `documentAccess` returns it. */
export interface Grant {
  documentId: string;
  userAddress: string;
  permission: Level;
  grantedBy: string;
  createdAt: string;
}

const ADDRESS = /^0x[0-9a-f]{40}$/;

/** A typed wallet address, in lower case, or what is wrong with it. */
export function readAddress(typed: string): { address: string } | { problem: string } {
  const text = typed.trim().toLowerCase();
  if (text === "") return { problem: "Type a wallet address." };
  return ADDRESS.test(text)
    ? { address: text }
    : { problem: "A wallet address starts with 0x, followed by 40 letters a–f and digits." };
}

/** `0xced9…8951`. */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export interface RosterRow {
  address: string;
  short: string;
  level: Level;
  label: string;
  isYou: boolean;
  /** "you", or the granter's short address. */
  grantedBy: string;
  grantedAt: string;
}

/** The drive's grants, Manage first, each marked when it is yours. */
export function rosterRows(grants: readonly Grant[], me: string | undefined): RosterRow[] {
  const mine = me?.toLowerCase();
  return grants
    .map((g) => {
      const address = g.userAddress.toLowerCase();
      const granter = g.grantedBy.toLowerCase();
      return {
        address,
        short: shortAddress(address),
        level: g.permission,
        label: LEVEL_WORDS[g.permission].label,
        isYou: address === mine,
        grantedBy: granter === mine ? "you" : shortAddress(granter),
        grantedAt: g.createdAt,
      };
    })
    .sort((a, b) => RANK[b.level] - RANK[a.level] || a.address.localeCompare(b.address));
}

/** What a call to the server's permission service came back with. */
export interface Answer<T = unknown> {
  data?: T;
  error?: string;
  /** The server refused: not signed in, or no right to ask. */
  forbidden?: boolean;
}

interface GraphQLBody {
  data?: unknown;
  errors?: { message?: string; extensions?: { code?: string } }[];
}

const UNSAID = "The server refused without saying why.";

/** An HTTP status and GraphQL body, as an answer. */
export function readAnswer(status: number, body: unknown): Answer {
  if (status === 401) return { error: "Not signed in, or the session has ended.", forbidden: true };
  if (status < 200 || status >= 300) return { error: `The server answered HTTP ${status}.` };
  const json = (body ?? {}) as GraphQLBody;
  const first = json.errors?.[0];
  if (first)
    return { error: first.message ?? UNSAID, forbidden: first.extensions?.code === "FORBIDDEN" };
  return { data: json.data };
}

export type Probe =
  | { kind: "allowed" }
  | { kind: "anonymous" }
  | { kind: "unauthorized" }
  | { kind: "unreachable"; detail: string };

/** What reading the drive itself said: the same check every view will face. */
export function probeVerdict(status: number, body: unknown): Probe {
  if (status === 401) return { kind: "anonymous" };
  if (status < 200 || status >= 300)
    return { kind: "unreachable", detail: `The server answered HTTP ${status}.` };
  const json = (body ?? {}) as GraphQLBody & {
    data?: { document?: { document?: { id?: string } | null } | null };
  };
  const first = json.errors?.[0];
  if (first) {
    const code = first.extensions?.code;
    if (code === "UNAUTHENTICATED") return { kind: "anonymous" };
    if (code === "FORBIDDEN") return { kind: "unauthorized" };
    return { kind: "unreachable", detail: first.message ?? UNSAID };
  }
  return json.data?.document?.document?.id
    ? { kind: "allowed" }
    : { kind: "unreachable", detail: "The space was not found on this server." };
}

/**
 * Whether reading a drive was refused to this person: signed out, or signed in
 * without access. An unreachable server is no refusal: nothing is hidden on a guess.
 */
export function refusesReading(probe: Probe): boolean {
  return probe.kind === "anonymous" || probe.kind === "unauthorized";
}

export type Verdict =
  | { kind: "allowed" }
  | { kind: "anonymous" }
  | { kind: "unauthorized"; address: string }
  | { kind: "unreachable"; detail: string };

/**
 * The gate's verdict. Signed out, any refusal means "sign in". Signed in, any
 * refusal means "ask an admin", with the address that needs the grant.
 */
export function gateVerdict(probe: Probe, address: string | undefined): Verdict {
  if (probe.kind === "allowed" || probe.kind === "unreachable") return probe;
  return address ? { kind: "unauthorized", address } : { kind: "anonymous" };
}

export type Standing = "admin" | "member" | "off";

/**
 * Whether the person administers the space, from the answer to asking for its
 * grants: an answer means admin, a refusal means member, and any other failure
 * means the server keeps no permission tables (access control off).
 */
export function standingOf(answer: Answer): Standing {
  return answer.data !== undefined ? "admin" : answer.forbidden ? "member" : "off";
}

/** Whether changing or removing this person would leave nobody able to manage access. */
export function isLastManager(rows: readonly RosterRow[], address: string): boolean {
  const managers = rows.filter((row) => row.level === "ADMIN");
  return managers.length === 1 && managers[0]?.address === address.toLowerCase();
}

/**
 * Whether the person may change the space, from asking the server
 * `canExecuteOperation` (the check every write faces); undefined when it
 * could not say, so a server that does not answer never locks anyone out.
 */
export function mayChange(answer: Answer): boolean | undefined {
  const value = (answer.data as { canExecuteOperation?: unknown } | undefined)?.canExecuteOperation;
  return typeof value === "boolean" ? value : undefined;
}

/** What a view-only member is told when they try to change something. */
export const VIEW_ONLY =
  "You can view this space but not change it. Ask an admin of the space for access to edit.";

