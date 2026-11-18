import { reducer as contactReducer, utils as contactUtils } from "document-models/contact/v1";
import { reducer as leadReducer, utils as leadUtils } from "document-models/lead/v1";
import { describe, expect, it } from "vitest";
import { leadActionsFor, organisationActions } from "./actions.js";
import { parseCsv } from "./csv.js";
import { guessMapping, planImport, type ImportContext } from "./plan.js";
import { runImport, type ImportDeps, type LeadChange, type OrganisationChange } from "./run.js";

const MARA = { name: "Mara Lind", address: "0x1111111111111111111111111111111111111111" };
const ctx: ImportContext = {
  organisations: [{ id: "org-setcce", name: "SETCCE d.o.o.", website: null, notes: "Trust services" }],
  leads: [{ id: "lead-old", name: "SETCCE", organisationId: "org-setcce" }],
  team: [MARA],
};
const rowsOf = (csv: string) => {
  const t = parseCsv(csv);
  return planImport(t, guessMapping(t.headers), ctx);
};

/** A drive in memory, applying every change through the real reducers. */
function memoryDrive(fail: { organisation?: string; lead?: string } = {}) {
  let n = 0;
  const contacts = new Map<string, ReturnType<typeof contactUtils.createDocument>>();
  const leads = new Map<string, ReturnType<typeof leadUtils.createDocument>>();
  contacts.set("org-setcce", contactUtils.createDocument());
  /** Resolves when every action was accepted, rejects with the first refusal. */
  const settle = (errors: (string | undefined)[]): Promise<void> => {
    const e = errors.find(Boolean);
    return e ? Promise.reject(new Error(e)) : Promise.resolve();
  };
  const deps: ImportDeps = {
    newId: () => `id-${++n}`,
    createOrganisation: (name) => {
      if (name === fail.organisation) return Promise.reject(new Error("The server refused it"));
      const id = `org-${++n}`;
      contacts.set(id, contactUtils.createDocument());
      return Promise.resolve(id);
    },
    changeOrganisation: (id, change: OrganisationChange) => {
      let doc = contacts.get(id)!;
      const before = doc.operations.global.length;
      for (const a of organisationActions(change)) doc = contactReducer(doc, a);
      contacts.set(id, doc);
      return settle(doc.operations.global.slice(before).map((o) => o.error));
    },
    createLead: (name) => {
      const id = `lead-${++n}`;
      leads.set(id, leadUtils.createDocument());
      if (name === fail.lead) return Promise.reject(new Error("No room for leads"));
      return Promise.resolve(id);
    },
    changeLead: (id, change: LeadChange) => {
      let doc = leads.get(id)!;
      const before = doc.operations.global.length;
      for (const a of leadActionsFor(change, "2026-11-18T09:00:00.000Z")) doc = leadReducer(doc, a);
      leads.set(id, doc);
      return settle(doc.operations.global.slice(before).map((o) => o.error));
    },
  };
  return { deps, contacts, leads };
}

describe("runImport", () => {
  it("creates organisations and leads that the reducers accept, as planned", async () => {
    const rows = rowsOf(
      "Name,Company,Role,Type,Status,Owner,Contact,Next step,Notes\n" +
        "Igor,Cosylab,CAIO,Exchange,In touch,Mara Lind,igor@cosylab.com,Propose a meeting,Talk on the AI mirror\n" +
        "Ana,Cosylab,CTO,Exchange,To contact,,,,Second contact\n" +
        "Svetlana,Setcce,CEO,Sales,Met,Mara Lind,,,From the booth",
    );
    const { deps, contacts, leads } = memoryDrive();
    const progress: string[] = [];
    const results = await runImport(rows, () => true, deps, (d, t) => progress.push(`${d}/${t}`));
    expect(results.map((r) => r.outcome)).toEqual(["created", "created", "created"]);
    expect(progress).toEqual(["0/3", "1/3", "2/3", "3/3"]);

    const cosylab = results[0].outcome === "created" ? results[0].organisationId! : "";
    expect(results[1]).toMatchObject({ organisationId: cosylab, organisationNew: false });
    const org = contacts.get(cosylab)!.state.global;
    expect(org.name).toBe("Cosylab");
    expect(org.people.map((p) => p.name)).toEqual(["Igor", "Ana"]);
    expect(org.notes).toBe("Notes: Talk on the AI mirror\n\nNotes: Second contact");
    expect(contacts.get("org-setcce")!.state.global.notes).toBe("Trust services\n\nNotes: From the booth");

    const igor = results[0].outcome === "created" ? leads.get(results[0].leadId)!.state.global : null;
    expect(igor).toMatchObject({ name: "Cosylab", kind: "EXCHANGE", status: "IN_TOUCH", owner: MARA.address, organisationId: cosylab });
    expect(igor?.nextSteps.map((s) => s.text)).toEqual(["Propose a meeting"]);
    expect(igor?.contactLinks).toEqual([expect.objectContaining({ contactId: cosylab, role: "CAIO" })]);
    const svetlana = results[2].outcome === "created" ? leads.get(results[2].leadId)!.state.global : null;
    expect(svetlana).toMatchObject({ status: "MET", organisationId: "org-setcce" });
  });

  it("skips blocked rows and existing leads unless asked, and says why", async () => {
    const rows = rowsOf("Company,Status\nSETCCE,Met\n,Met\nNew Co,");
    const { deps } = memoryDrive();
    const results = await runImport(rows, (r) => r.duplicateOf === null, deps);
    expect(results).toEqual([
      { row: 2, outcome: "skipped", why: 'Lead "SETCCE" already exists' },
      { row: 3, outcome: "skipped", why: "No organisation or lead name: this row can't be imported" },
      expect.objectContaining({ row: 4, outcome: "created", organisationNew: true }),
    ]);
  });

  it("ends only the failing row, saying which step and what exists, and later rows of its organisation say so", async () => {
    const rows = rowsOf("Company,Lead\nBroken Co,First\nBroken Co,Second\nFine Co,Third\nFine Co 2,Bad lead");
    const { deps } = memoryDrive({ organisation: "Broken Co", lead: "Bad lead" });
    const results = await runImport(rows, () => true, deps);
    expect(results[0]).toEqual({ row: 2, outcome: "failed", step: "organisation", message: "The server refused it" });
    expect(results[1]).toEqual({ row: 3, outcome: "failed", step: "organisation", message: "Its organisation, from row 2, wasn't created" });
    expect(results[2]).toMatchObject({ row: 4, outcome: "created" });
    expect(results[3]).toMatchObject({ row: 5, outcome: "failed", step: "lead", message: "No room for leads" });
    expect(results[3]).toHaveProperty("organisationId");
  });

  it("reports a refusal from the records as the row's failure", async () => {
    const rows = rowsOf("Company,Name\nX,Igor");
    const { deps } = memoryDrive();
    const refusing: ImportDeps = { ...deps, changeLead: () => Promise.reject(new Error("A won or lost lead is final")) };
    const [r] = await runImport(rows, () => true, refusing);
    expect(r).toMatchObject({ outcome: "failed", step: "lead", message: "A won or lost lead is final" });
  });
});

describe("a lead's source from the file", () => {
  it("records where each lead came from, as the lead's reducer accepts it", async () => {
    const rows = rowsOf("Company,Source\nCosylab,AI WEEK 2026\nSetcce,Referral\nKelvar,");
    const { deps, leads } = memoryDrive();
    const results = await runImport(rows, () => true, deps, () => undefined);
    expect(results.map((r) => r.outcome)).toEqual(["created", "created", "created"]);
    const sources = [...leads.values()].map((d) => [d.state.global.source, d.state.global.sourceDetail]);
    expect(sources).toEqual([["EVENT", "AI WEEK 2026"], ["REFERRAL", null], [null, null]]);
    for (const d of leads.values()) expect(d.operations.global.every((o) => !o.error)).toBe(true);
  });
});
