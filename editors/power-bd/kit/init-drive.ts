import { driveIconToSet } from "./app-icon.js";
import { planDriveSetup, type NodeLike } from "./drive-plan.js";

/** A drive as the place that keeps it holds it. */
export interface DriveSnapshot {
  nodes: readonly NodeLike[];
  icon: string | null | undefined;
}

/** What the set-up needs; the app passes Connect's functions and the server's read. */
export interface SetupDeps {
  /**
   * The drive as the place that keeps it holds it: its server for a shared
   * drive, this browser for one kept only here. Never a copy still filling
   * up: judged from one, a new member's first visit would make a second set
   * of folders and records, which the server refuses.
   */
  loadDrive: () => Promise<DriveSnapshot>;
  /** Adds these folders at the drive's top level, in one change. */
  addFolders: (names: readonly string[]) => Promise<unknown>;
  addDocument: (name: string, documentType: string) => Promise<unknown>;
  /** Gives an icon-less drive the app's own icon. */
  setIcon?: (icon: string) => Promise<unknown>;
}

/** Runs in flight, per drive, so a second call joins the first. */
const running = new Map<string, Promise<number>>();

/**
 * Creates what a BD drive is missing and returns how many things it made.
 * It decides from the drive as its home holds it, read afresh for each run,
 * so neither a stale copy nor one still arriving can cause duplicates; when
 * the home can't be read, nothing is made. Calls made while a run is in
 * flight share that run. A failed run is forgotten, so the next call tries
 * again from a fresh read.
 */
export function setUpDrive(driveId: string, deps: SetupDeps): Promise<number> {
  const existing = running.get(driveId);
  if (existing) return existing;
  const run = (async () => {
    const drive = await deps.loadDrive();
    const plan = planDriveSetup(drive.nodes);
    if (plan.folders.length > 0) await deps.addFolders(plan.folders);
    for (const s of plan.singletons)
      await deps.addDocument(s.name, s.documentType);
    const icon = deps.setIcon && driveIconToSet(drive.icon);
    // The tile's look is not worth failing the set-up for: a refusal leaves the default.
    if (icon) await deps.setIcon?.(icon).catch(() => undefined);
    return plan.folders.length + plan.singletons.length;
  })().finally(() => running.delete(driveId));
  running.set(driveId, run);
  return run;
}
