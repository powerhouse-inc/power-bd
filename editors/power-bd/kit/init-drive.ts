import { driveIconToSet } from "./app-icon.js";
import { planDriveSetup, type NodeLike } from "./drive-plan.js";

/** What the set-up needs from the server; the app passes Connect's functions. */
export interface SetupDeps {
  /** The drive's nodes, read from the server (not from a local copy). */
  loadNodes: () => Promise<readonly NodeLike[]>;
  addFolder: (name: string) => Promise<unknown>;
  addDocument: (name: string, documentType: string) => Promise<unknown>;
  /** The drive's icon now, and how to set it: the app gives an icon-less drive its own. */
  icon?: {
    current: string | null | undefined;
    set: (icon: string) => Promise<unknown>;
  };
}

/** Runs in flight, per drive, so a second call joins the first. */
const running = new Map<string, Promise<number>>();

/**
 * Creates what a BD drive is missing and returns how many things it made.
 * It reads the server's tree first, so a stale local copy cannot cause
 * duplicates; calls made while a run is in flight share that run. A failed
 * run is forgotten, so the next call tries again from a fresh read.
 */
export function setUpDrive(driveId: string, deps: SetupDeps): Promise<number> {
  const existing = running.get(driveId);
  if (existing) return existing;
  const run = (async () => {
    const plan = planDriveSetup(await deps.loadNodes());
    for (const name of plan.folders) await deps.addFolder(name);
    for (const s of plan.singletons)
      await deps.addDocument(s.name, s.documentType);
    const icon = deps.icon && driveIconToSet(deps.icon.current);
    // The tile's look is not worth failing the set-up for: a refusal leaves the default.
    if (icon) await deps.icon?.set(icon).catch(() => undefined);
    return plan.folders.length + plan.singletons.length;
  })().finally(() => running.delete(driveId));
  running.set(driveId, run);
  return run;
}
