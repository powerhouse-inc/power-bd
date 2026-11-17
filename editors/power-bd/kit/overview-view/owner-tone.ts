/**
 * The colours an owner's mark can take. Red and orange are left out: on the
 * Overview they mean slipping.
 */
export const OWNER_TONES = [
  "blue",
  "green",
  "purple",
  "pink",
  "brown",
  "yellow",
] as const;
export type OwnerTone = (typeof OWNER_TONES)[number];

/**
 * A member's colour, from their place on the team list. Members are never
 * removed, only deactivated, so the colour stays theirs. `null` for nobody
 * and for someone not on the team: their mark stays grey.
 */
export function ownerTone(
  address: string | null,
  members: readonly { address: string }[],
): OwnerTone | null {
  if (address === null) return null;
  const wanted = address.toLowerCase();
  const at = members.findIndex((m) => m.address.toLowerCase() === wanted);
  return at < 0 ? null : OWNER_TONES[at % OWNER_TONES.length];
}
