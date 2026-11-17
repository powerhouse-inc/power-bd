import type { BdSettingsState } from "document-models/bd-settings";
import type {
  OwnerName,
  OverviewInput,
  ViewFilter,
  ViewItem,
} from "./types.js";

/** Leads, opportunities and decisions as list items; investor rows have no owner and are left out. */
export function viewItems(input: OverviewInput): ViewItem[] {
  return [
    ...input.leads.map((l) => ({
      kind: "lead" as const,
      id: l.id,
      name: l.state.name ?? "",
      status: l.state.status,
      owner: l.state.owner ?? null,
    })),
    ...input.opportunities.map((o) => ({
      kind: "opportunity" as const,
      id: o.id,
      name: o.state.name ?? "",
      status: o.state.status,
      owner: o.state.owner ?? null,
    })),
    ...input.decisions.map((d) => ({
      kind: "decision" as const,
      id: d.id,
      name: d.state.question ?? "",
      status: d.state.status,
      owner: d.state.owner ?? null,
    })),
  ];
}

const same = (a: string | null, b: string) =>
  a !== null && a.toLowerCase() === b.toLowerCase();

/** The "mine" view: items owned by the address, compared without regard to letter case. */
export const mine = (items: ViewItem[], address: string): ViewItem[] =>
  items.filter((i) => same(i.owner, address));

/** Items matching every filter that is given. */
export const filterItems = (items: ViewItem[], f: ViewFilter): ViewItem[] =>
  items.filter(
    (i) =>
      (f.kind === undefined || i.kind === f.kind) &&
      (f.owner === undefined || same(i.owner, f.owner)) &&
      (f.status === undefined || i.status === f.status),
  );

/**
 * An owner's team-list name; a deactivated member keeps their name.
 * Someone not on the list shows as their address. `null` without an owner.
 */
export function ownerName(
  address: string | null,
  team: BdSettingsState["teamMembers"],
): OwnerName | null {
  if (address === null) return null;
  const member = team.find((m) => same(m.address, address));
  return member
    ? { address, name: member.name, active: member.active }
    : { address, name: address, active: false };
}
