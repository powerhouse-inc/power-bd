/**
 * What a BD drive must hold, and what is missing from one. Pure: it reads a
 * list of the drive's nodes and returns a plan, so it needs no React and no
 * server.
 */

/** The parts of a drive node this module reads (a Connect node satisfies it). */
export interface NodeLike {
  id: string;
  name: string;
  kind: string;
  parentFolder?: string | null;
  documentType?: string;
}

/** Folders at the drive's top level, in the order they are created. */
export const FOLDER_NAMES = [
  "Organisations",
  "Leads",
  "Opportunities",
  "Decisions",
  "Proposals",
] as const;

/** Records the drive holds exactly one of. */
export const SINGLETONS = [
  { name: "Settings", documentType: "powerbd/settings" },
  { name: "Playbook", documentType: "powerbd/playbook" },
  { name: "Investor list", documentType: "powerbd/investor-list" },
] as const;

export type Singleton = (typeof SINGLETONS)[number];

export interface DrivePlan {
  folders: string[];
  singletons: Singleton[];
}

const norm = (name: string) => name.trim().toLowerCase();

/** The folders and single records that the drive does not have yet. */
export function planDriveSetup(nodes: readonly NodeLike[]): DrivePlan {
  const topFolders = new Set(
    nodes
      .filter((n) => n.kind === "folder" && n.parentFolder == null)
      .map((n) => norm(n.name)),
  );
  const types = new Set(
    nodes.filter((n) => n.kind === "file").map((n) => n.documentType),
  );
  return {
    folders: FOLDER_NAMES.filter((name) => !topFolders.has(norm(name))),
    singletons: SINGLETONS.filter((s) => !types.has(s.documentType)),
  };
}

/** Counts shown beside a place in the sidebar. */
export interface PlaceCounts {
  leads: number;
  /** Proposals not yet answered, withdrawn or superseded. */
  proposals: number;
  funding: number;
  decisions: number;
}

/**
 * Records per place. Places without a count of their own (yet) are left out.
 * The open proposals are counted from their states, which the nodes do not hold.
 */
export function countsByPlace(
  nodes: readonly NodeLike[],
  openProposals = 0,
): PlaceCounts {
  const of = (type: string) =>
    nodes.filter((n) => n.kind === "file" && n.documentType === type).length;
  return {
    leads: of("powerbd/lead"),
    proposals: openProposals,
    funding: of("powerbd/opportunity"),
    decisions: of("powerbd/decision"),
  };
}

export type FolderName = (typeof FOLDER_NAMES)[number];

/** The id of a top-level folder by its name (any letter case), if the drive has it. */
export function topFolderId(
  nodes: readonly NodeLike[],
  name: FolderName,
): string | undefined {
  return nodes.find(
    (n) =>
      n.kind === "folder" && !n.parentFolder && norm(n.name) === norm(name),
  )?.id;
}
