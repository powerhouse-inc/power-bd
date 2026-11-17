import { organisationView } from "../organisation/organisation.js";
import type { OrganisationInput } from "../organisation/types.js";

export type ContactLike = {
  id: string;
  state: {
    name?: string | null;
    tags: string[];
    address: { country?: string | null };
  };
};

export type OrganisationRow = {
  id: string;
  name: string;
  country: string;
  tags: string[];
  /** Leads, funding opportunities, investor rows and proposals gathered under it. */
  relationships: number;
};

/** What an organisation without a name is called in the UI. */
export const UNNAMED_ORGANISATION = "Unnamed organisation";

/** An organisation's name, or the placeholder when it has none. */
export function organisationLabel(name: string | null | undefined): string {
  return name || UNNAMED_ORGANISATION;
}

/** One row per contact for the Organisations list, by name. */
export function organisationRows(
  contacts: readonly ContactLike[],
  records: Omit<OrganisationInput, "contactId">,
): OrganisationRow[] {
  return contacts
    .map((c) => {
      const v = organisationView({ contactId: c.id, ...records });
      return {
        id: c.id,
        name: organisationLabel(c.state.name?.trim()),
        country: c.state.address.country ?? "",
        tags: c.state.tags,
        relationships:
          v.leads.length +
          v.opportunities.length +
          v.investorRows.length +
          v.proposals.length,
      };
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );
}
