import { useMemo } from "react";
import { memberName, type MemberLike } from "../../kit/settings/settings.js";
import { useBdSettingsDocumentsInSelectedDrive } from "../useDriveDocuments.js";

export interface Team {
  /** Every member, inactive ones included, in the order they were added. */
  members: readonly MemberLike[];
  /** Members who can still be given work. */
  active: readonly MemberLike[];
  /** The name for an address, or undefined when nobody on the team has it. */
  nameFor: (address: string | null | undefined) => string | undefined;
  /** The name for an owner's address; "Someone not on the team" when nobody has it. */
  ownerName: (address: string) => string;
}

/** The team list from the drive's settings, and a way to turn an address into a name. */
export function useTeam(): Team {
  const settings = useBdSettingsDocumentsInSelectedDrive()?.[0];
  const members = settings?.state.global.teamMembers;
  return useMemo(() => {
    const all: readonly MemberLike[] = members ?? [];
    return {
      members: all,
      active: all.filter((m) => m.active),
      nameFor: (address) => memberName(all, address),
      ownerName: (address) =>
        memberName(all, address) ?? "Someone not on the team",
    };
  }, [members]);
}
