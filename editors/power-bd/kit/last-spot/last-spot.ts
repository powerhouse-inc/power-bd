/**
 * Where a person last was in a space, so opening it again comes back there:
 * from Connect's sidebar after following a citation into the vault, or on
 * another day. The spot is the place, the record open in it, whether the
 * agent was beside it, and where the agent's full view was opened from. It is
 * kept for each person in each space, in this browser.
 *
 * An address that names a place or a record still wins: a link or a reload
 * opens what it says. Whether the agent is beside comes back either way, so
 * Back to a place finds the conversation open as it was.
 */
import type { ChoiceStorage } from "../chat/person-choice.js";
import { placeFromHash, type PlaceId } from "../places.js";

/** Where the agent's full view was opened from: where leaving it goes back to. */
export interface CameFrom {
  place: PlaceId;
  recordId?: string;
}

export interface Spot {
  place: PlaceId;
  /** The record open in the place, if any. */
  recordId?: string;
  /** The agent's panel open beside the place. */
  beside: boolean;
  /** Where the full view was opened from. */
  from?: CameFrom;
}

/** How a space opens. `record` is one to open again; the address names none. */
export interface Opening {
  place: PlaceId;
  beside: boolean;
  from?: CameFrom;
  record?: string;
}

/** What an address says on opening: its place (`#leads`), and whether it names a record. */
export interface Address {
  place: PlaceId | undefined;
  namesRecord: boolean;
}

/** How the space opens: what the address says, and otherwise where the person last was. */
export function openingSpot(address: Address, saved: Spot | undefined): Opening {
  const kept = { beside: saved?.beside ?? false, ...(saved?.from ? { from: saved.from } : {}) };
  if (address.place) return { place: address.place, ...kept };
  if (address.namesRecord || !saved) return { place: "overview", ...kept };
  // The agent's full view shows no record.
  const record = saved.place === "agent" ? undefined : saved.recordId;
  return { place: saved.place, ...kept, ...(record ? { record } : {}) };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const placeOf = (value: unknown): PlaceId | undefined =>
  typeof value === "string" ? placeFromHash(`#${value}`) : undefined;

const idOf = (value: unknown): string | undefined =>
  typeof value === "string" && value ? value : undefined;

/** A kept spot as it was written, or undefined when it is not one. */
export function parseSpot(text: string | null | undefined): Spot | undefined {
  if (!text) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (!isRecord(value)) return undefined;
  const place = placeOf(value.place);
  if (!place) return undefined;
  const recordId = idOf(value.recordId);
  const from = isRecord(value.from) ? placeOf(value.from.place) : undefined;
  const fromRecord = isRecord(value.from) ? idOf(value.from.recordId) : undefined;
  return {
    place,
    ...(recordId ? { recordId } : {}),
    beside: value.beside === true,
    ...(from ? { from: { place: from, ...(fromRecord ? { recordId: fromRecord } : {}) } } : {}),
  };
}

export interface SpotStore {
  read: (space: string, person: string) => Spot | undefined;
  write: (space: string, person: string, spot: Spot) => void;
}

/**
 * Spots kept in the browser's storage, and in memory when it keeps nothing
 * (then they last until the page reloads). A write that changes nothing is
 * not made.
 */
export function spotStore(storage: () => ChoiceStorage | undefined): SpotStore {
  const keyOf = (space: string, person: string) => `pb:last-spot:${space}:${person}`;
  const known = new Map<string, string>();
  return {
    read(space, person) {
      const key = keyOf(space, person);
      let text = known.get(key);
      if (text === undefined) {
        try {
          text = storage()?.getItem(key) ?? undefined;
        } catch {
          text = undefined;
        }
      }
      return parseSpot(text);
    },
    write(space, person, spot) {
      const key = keyOf(space, person);
      const text = JSON.stringify(spot);
      if (known.get(key) === text) return;
      known.set(key, text);
      try {
        storage()?.setItem(key, text);
      } catch {
        // Kept in this page only.
      }
    },
  };
}
