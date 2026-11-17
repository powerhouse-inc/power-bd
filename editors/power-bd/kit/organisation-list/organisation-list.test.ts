import { describe, expect, it } from "vitest";
import { lead } from "../organisation/fixtures.js";
import { organisationLabel, organisationRows } from "./organisation-list.js";

const none = { leads: [], opportunities: [], investorLists: [], proposals: [] };
const c = (id: string, name: string | null, country: string | null = null) => ({
  id,
  state: { name, tags: ["Ally"], address: { country } },
});

describe("organisation rows", () => {
  it("counts the relationships gathered under each organisation", () => {
    const rows = organisationRows(
      [c("C1", "Acme Co", "Spain"), c("C2", "Other Ltd")],
      { ...none, leads: [{ id: "L1", state: lead({ organisationId: "C1" }) }] },
    );
    expect(rows.find((r) => r.id === "C1")).toMatchObject({
      name: "Acme Co",
      country: "Spain",
      tags: ["Ally"],
      relationships: 1,
    });
    expect(rows.find((r) => r.id === "C2")?.relationships).toBe(0);
  });

  it("sorts by name and names an unnamed organisation", () => {
    const rows = organisationRows(
      [c("C1", "Zed"), c("C2", null), c("C3", "alpha")],
      none,
    );
    expect(rows.map((r) => r.name)).toEqual([
      "alpha",
      "Unnamed organisation",
      "Zed",
    ]);
  });
});

describe("organisationLabel", () => {
  it("keeps a name and names the nameless", () => {
    expect(organisationLabel("Acme")).toBe("Acme");
    expect(organisationLabel("")).toBe("Unnamed organisation");
    expect(organisationLabel(undefined)).toBe("Unnamed organisation");
  });
});
