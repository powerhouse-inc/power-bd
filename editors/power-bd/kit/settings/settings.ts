/** Pure helpers for the Settings view and for what other views need from settings. */

export interface MemberLike {
  id: string;
  name: string;
  address: string;
  active: boolean;
}

/** UTC first, then the runtime's zones sorted, without repeats. */
export function timeZoneOptions(supported: readonly string[]): string[] {
  const rest = [...new Set(supported)].filter((zone) => zone !== "UTC").sort();
  return ["UTC", ...rest];
}

/** The zones the running browser knows, plus UTC. */
export function runtimeTimeZones(): string[] {
  try {
    return timeZoneOptions(Intl.supportedValuesOf("timeZone"));
  } catch {
    return timeZoneOptions([]);
  }
}

/** A team member's name for an address (any letter case), active or not. */
export function memberName(
  members: readonly MemberLike[],
  address: string | null | undefined,
): string | undefined {
  if (!address) return undefined;
  const wanted = address.toLowerCase();
  return members.find((m) => m.address.toLowerCase() === wanted)?.name;
}

export function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase());
  return letters.length ? letters.join("") : "?";
}

export const isAddress = (text: string) =>
  /^0x[0-9a-fA-F]{40}$/.test(text.trim());

/** What to say when `isAddress` fails. */
export const ADDRESS_FORMAT =
  "A vault address is 0x followed by 40 letters and digits.";

/** A whole number from text, or undefined. */
export function parseWholeNumber(text: string): number | undefined {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : undefined;
}
