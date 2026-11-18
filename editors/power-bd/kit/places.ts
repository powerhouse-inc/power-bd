import type { IconName } from "../../../design-system/icons.js";
import type { PlaceCounts } from "./drive-plan.js";

export type PlaceId =
  | "overview"
  | "leads"
  | "proposals"
  | "funding"
  | "investors"
  | "organisations"
  | "decisions"
  | "playbook"
  | "agent"
  | "settings";

export interface Place {
  id: PlaceId;
  label: string;
  icon: IconName;
  /** What the empty state says the place will hold. */
  empty: string;
}

/** The ten places, in sidebar order. The Agent and Settings sit at the sidebar's foot. */
export const PLACES: readonly Place[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "overview",
    empty: "What needs attention, and what is coming up, will appear here.",
  },
  {
    id: "leads",
    label: "Leads",
    icon: "leads",
    empty: "Your leads will appear here.",
  },
  {
    id: "proposals",
    label: "Proposals",
    icon: "proposal",
    empty: "Every proposal will appear here, with what it waits on.",
  },
  {
    id: "funding",
    label: "Funding",
    icon: "funding",
    empty: "Funding opportunities will appear here, by deadline.",
  },
  {
    id: "investors",
    label: "Investors",
    icon: "investors",
    empty: "Your investor list will appear here.",
  },
  {
    id: "organisations",
    label: "Organisations",
    icon: "organisations",
    empty: "Organisations and the people you know there will appear here.",
  },
  {
    id: "decisions",
    label: "Decisions",
    icon: "decisions",
    empty: "Questions waiting for an answer will appear here.",
  },
  {
    id: "playbook",
    label: "Playbook",
    icon: "playbook",
    empty: "Your positioning and messages will appear here.",
  },
  {
    id: "agent",
    label: "Agent",
    icon: "sparkles",
    empty: "Ask about your leads, funding and the vault.",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    empty: "Team, time zone and vault settings will appear here.",
  },
];

const BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p])) as Record<
  PlaceId,
  Place
>;

export function placeById(id: PlaceId): Place {
  return BY_ID[id];
}

/**
 * The hash that puts a place in the address (`/d/<drive>#leads`), so Back and
 * Forward move between places, a reload stays, and a link opens it. Every
 * place has one, the Overview too: an address without one is a fresh entry
 * of Connect's, still to be given its place.
 */
export function hashOf(id: PlaceId): string {
  return `#${id}`;
}

/** The place an address's hash names, or undefined when it names none. */
export function placeFromHash(hash: string): PlaceId | undefined {
  const id = hash.startsWith("#") ? hash.slice(1) : undefined;
  return id !== undefined && Object.hasOwn(BY_ID, id) ? (id as PlaceId) : undefined;
}

/** The count to show beside a place, or undefined when it has none. */
export function countFor(id: PlaceId, counts: PlaceCounts): number | undefined {
  if (
    id === "leads" ||
    id === "proposals" ||
    id === "funding" ||
    id === "decisions"
  )
    return counts[id];
  return undefined;
}

export type SaveState = "setting-up" | "up-to-date" | "offline" | "unreachable";

/**
 * The save state's label, icon and CSS modifier. Offline wins over the rest;
 * "unreachable" is a shared drive whose server did not answer the last read:
 * what shows may be out of date, and it reads again on its own.
 */
export function saveStateView(state: SaveState): {
  label: string;
  icon: IconName;
  className: string;
} {
  switch (state) {
    case "offline":
      return {
        label: "Offline",
        icon: "cloud-off",
        className: "pb-save-state is-offline",
      };
    case "unreachable":
      return {
        label: "Can't reach the server",
        icon: "cloud-off",
        className: "pb-save-state is-offline",
      };
    case "setting-up":
      return {
        label: "Setting up",
        icon: "cloud",
        className: "pb-save-state is-saving",
      };
    default:
      return { label: "Up to date", icon: "cloud", className: "pb-save-state" };
  }
}
