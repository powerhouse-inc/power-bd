/**
 * The first-run guide: which set-up steps a drive has done, which comes next,
 * and whether the Overview shows the guide, a small strip or nothing. Pure:
 * it reads counts and the viewer's choices, and needs no React and no server.
 */

export type SetupStepId =
  | "team"
  | "time"
  | "vault"
  | "organisation"
  | "relationship";

export interface SetupStepInfo {
  id: SetupStepId;
  /** The step as an instruction, for the panel's heading. */
  title: string;
  /** Two or three words, for the numbered strip. */
  short: string;
  /** One line on why the step matters. */
  why: string;
  /** An optional step can be skipped. */
  optional: boolean;
}

/** The five steps, in the order a new team does them. */
export const SETUP_STEPS: readonly SetupStepInfo[] = [
  {
    id: "team",
    title: "Add your team",
    short: "Team",
    why: "Owners are chosen from this list, and “Mine” shows each person their own work.",
    optional: false,
  },
  {
    id: "time",
    title: "Set your time zone and what counts as due",
    short: "Time zone",
    why: "Every deadline and meeting is shown in your time zone, and “Coming up” looks this many days ahead.",
    optional: false,
  },
  {
    id: "vault",
    title: "Choose the vault",
    short: "Vault",
    why: "Notes you link from a lead or a funding opportunity are looked up in this vault.",
    optional: true,
  },
  {
    id: "organisation",
    title: "Add your first organisation",
    short: "Organisation",
    why: "Every lead and funding opportunity belongs to an organisation: a customer, a partner or a funder.",
    optional: false,
  },
  {
    id: "relationship",
    title: "Add your first lead or funding opportunity",
    short: "First lead",
    why: "With an owner and a next step it shows on the board, and the Overview can tell you when it slips.",
    optional: false,
  },
];

/** What the drive holds, as far as set-up is concerned. */
export interface SetupFacts {
  /** False until the drive's settings exist; the guide cannot save before. */
  settingsReady: boolean;
  /** People on the team who can be given work. */
  teamMembers: number;
  timeZone: string | null | undefined;
  vaultDriveId: string | null | undefined;
  organisations: number;
  /** Leads and funding opportunities. */
  relationships: number;
}

/** The viewer's choices about the guide, kept per drive in the browser. */
export interface GuidePrefs {
  hidden: boolean;
  skipped: SetupStepId[];
}

export type SetupStepState = "done" | "skipped" | "current" | "todo";

export interface SetupStep extends SetupStepInfo {
  number: number;
  state: SetupStepState;
}

/**
 * - `waiting`: the settings are not there yet, and there is nothing else to show.
 * - `guide`: the guide stands in for the board.
 * - `strip`: the board shows, with the steps left in a small strip above it.
 * - `none`: nothing to show: all done, skipped or hidden.
 */
export type SetupMode = "waiting" | "guide" | "strip" | "none";

export interface SetupProgress {
  steps: SetupStep[];
  /** The first step that is neither done nor skipped. */
  current: SetupStepId | null;
  done: number;
  total: number;
  /** Steps neither done nor skipped. */
  remaining: number;
  /** "2 of 5 done". */
  label: string;
  mode: SetupMode;
}

const set = (text: string | null | undefined) => (text ?? "").trim() !== "";

function isDone(id: SetupStepId, facts: SetupFacts): boolean {
  switch (id) {
    case "team":
      return facts.teamMembers > 0;
    case "time":
      return set(facts.timeZone);
    case "vault":
      return set(facts.vaultDriveId);
    case "organisation":
      return facts.organisations > 0;
    case "relationship":
      return facts.relationships > 0;
  }
}

/** The steps with their state, the progress line, and what the Overview shows. */
export function setupProgress(
  facts: SetupFacts,
  prefs: GuidePrefs,
): SetupProgress {
  let current: SetupStepId | null = null;
  const steps = SETUP_STEPS.map((info, index): SetupStep => {
    let state: SetupStepState = "todo";
    if (isDone(info.id, facts)) state = "done";
    else if (prefs.skipped.includes(info.id)) state = "skipped";
    else if (current === null) {
      current = info.id;
      state = "current";
    }
    return { ...info, number: index + 1, state };
  });
  const done = steps.filter((s) => s.state === "done").length;
  const remaining = steps.filter(
    (s) => s.state === "current" || s.state === "todo",
  ).length;
  const started = facts.relationships > 0;

  let mode: SetupMode;
  if (!facts.settingsReady) mode = started ? "none" : "waiting";
  else if (remaining === 0 || prefs.hidden) mode = "none";
  else mode = started ? "strip" : "guide";

  return {
    steps,
    current,
    done,
    total: steps.length,
    remaining,
    label: `${done} of ${steps.length} done`,
    mode,
  };
}

/** Where a drive's guide choices are kept in the browser. */
export const guidePrefsKey = (driveId: string) =>
  `power-bd:set-up-guide:${driveId}`;

const canSkip = (id: unknown): id is SetupStepId =>
  SETUP_STEPS.some((s) => s.optional && s.id === id);

/** The stored choices; an open guide when the text is missing or broken. */
export function parseGuidePrefs(text: string | null): GuidePrefs {
  const open: GuidePrefs = { hidden: false, skipped: [] };
  if (!text) return open;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return open;
  }
  if (typeof value !== "object" || value === null) return open;
  const { hidden, skipped } = value as { hidden?: unknown; skipped?: unknown };
  return {
    hidden: hidden === true,
    skipped: Array.isArray(skipped) ? skipped.filter(canSkip) : [],
  };
}

export const serialiseGuidePrefs = (prefs: GuidePrefs) => JSON.stringify(prefs);

/** Skips an optional step; any other step is left as it is. */
export function skipStep(prefs: GuidePrefs, id: SetupStepId): GuidePrefs {
  if (!canSkip(id) || prefs.skipped.includes(id)) return prefs;
  return { ...prefs, skipped: [...prefs.skipped, id] };
}

export const hideGuide = (prefs: GuidePrefs): GuidePrefs => ({
  ...prefs,
  hidden: true,
});

/** The guide as it first was: showing, with nothing skipped. */
export const reopenGuide = (): GuidePrefs => ({ hidden: false, skipped: [] });

/** The browser's time zone when the list offers it, else UTC. */
export function browserTimeZone(
  resolved: string | undefined,
  known: readonly string[],
): string {
  return resolved && known.includes(resolved) ? resolved : "UTC";
}

/**
 * An amount typed with or without grouping ("250,000", "250 000.50").
 * Null when nothing was typed; undefined when it is not an amount.
 */
export function parseAmount(text: string): number | null | undefined {
  const clean = text.trim().replace(/[\s,']/g, "");
  if (clean === "") return null;
  return /^\d+(\.\d+)?$/.test(clean) ? Number(clean) : undefined;
}

export interface RelationshipDraft {
  name: string;
  owner: string;
  nextStep: string;
}

/** What the guide asks of a first lead or opportunity, beyond the model's own rules. */
export function missingFields(
  draft: RelationshipDraft,
): Partial<Record<keyof RelationshipDraft, string>> {
  const missing: Partial<Record<keyof RelationshipDraft, string>> = {};
  if (!set(draft.name)) missing.name = "Give it a name.";
  if (!set(draft.owner)) missing.owner = "Choose who owns it.";
  if (!set(draft.nextStep)) missing.nextStep = "Write the next step.";
  return missing;
}

/** The part of a record this module reads: its operations, by scope, each with the reason it was refused. */
export interface RecordLike {
  operations: Record<string, readonly { error?: string }[] | undefined>;
}

/**
 * Why the model would refuse these actions on a record, or null when it takes
 * them all. Run on a new record before it is created, so a refusal shows in
 * the form and no half-filled record is left behind. The rules stay the
 * model's own: this only runs its reducer.
 */
export function firstRefusal<D extends RecordLike, A>(
  reducer: (document: D, action: A) => D,
  document: D,
  actions: readonly A[],
): string | null {
  const after = actions.reduce(reducer, document);
  for (const operations of Object.values(after.operations))
    for (const operation of operations ?? [])
      if (operation.error) return operation.error;
  return null;
}

/** The vault app's id, as a drive's `header.meta.preferredEditor` names it. */
export const VAULT_APP_ID = "knowledge-vault";

export interface DriveLike {
  header: { id: string; meta?: { preferredEditor?: string | null } | null };
  state: { global: { name?: string | null } };
}

/** The drives a vault can be chosen from: those opened with the vault app, never this one. */
export function vaultDrives(
  drives: readonly DriveLike[] | undefined,
  ownDriveId: string,
): { id: string; name: string }[] {
  return (drives ?? [])
    .filter(
      (d) =>
        d.header.id !== ownDriveId &&
        d.header.meta?.preferredEditor === VAULT_APP_ID,
    )
    .map((d) => ({
      id: d.header.id,
      name: d.state.global.name || "Unnamed vault",
    }));
}
