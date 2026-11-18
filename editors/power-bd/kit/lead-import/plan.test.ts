import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv.js";
import { guessMapping, hostOf, mergedNotes, parseDay, planImport, sameName, type ImportContext, parseSource } from "./plan.js";

const MARA = { name: "Mara Lind", address: "0x1111111111111111111111111111111111111111" };
const ctx: ImportContext = {
  organisations: [
    { id: "org-setcce", name: "SETCCE d.o.o.", website: "https://www.setcce.si", notes: "Trust services" },
    { id: "org-kelvar", name: "Kelvar Institute", website: null },
  ],
  leads: [{ id: "lead-1", name: "Kelvar Institute", organisationId: "org-kelvar" }],
  team: [MARA],
};
const TEAM_HEADER = "Name,Company,Role,Type,Status,Source,Meeting date,Owner,Contact,Next step,Notes";

describe("guessMapping", () => {
  it("reads the team's own leads file", () => {
    expect(guessMapping(TEAM_HEADER.split(","))).toEqual([
      "person", "organisation", "role", "kind", "status", "source", "notes", "owner", "email", "nextStep", "notes",
    ]);
  });

  it("takes Name as the organisation when there is no company column, and guesses each field once", () => {
    expect(guessMapping(["Name", "Website", "Stage", "Status"])).toEqual(["organisation", "website", "status", "ignore"]);
    expect(guessMapping(["Lead", "Due date", "Something else"])).toEqual(["leadName", "nextStepDue", "ignore"]);
  });
});

describe("matching", () => {
  it("compares names without case, punctuation or legal forms, and websites by host", () => {
    expect(sameName("SETCCE d.o.o.")).toBe(sameName("Setcce"));
    expect(sameName("Conduct AI Ltd")).toBe("conduct ai");
    expect(hostOf("https://www.setcce.si/en")).toBe("setcce.si");
    expect(hostOf("setcce.si")).toBe("setcce.si");
    expect(hostOf("not a url ::")).toBeNull();
    expect(hostOf(" ")).toBeNull();
  });

  it("reads ISO and European dates, and nothing else", () => {
    expect(parseDay("2026-11-20")).toBe("2026-11-20");
    expect(parseDay("20.11.2026")).toBe("2026-11-20");
    expect(parseDay("5/1/2027")).toBe("2027-01-05");
    expect(parseDay("31.02.2026")).toBeNull();
    expect(parseDay("next Friday")).toBeNull();
  });

  it("adds notes after the existing ones, never replacing them", () => {
    expect(mergedNotes("Trust services", "Source: AI WEEK")).toBe("Trust services\n\nSource: AI WEEK");
    expect(mergedNotes(null, "Source: AI WEEK")).toBe("Source: AI WEEK");
    expect(mergedNotes("Kept", null)).toBe("Kept");
  });
});

describe("planImport", () => {
  const plan = (csv: string) => {
    const t = parseCsv(csv);
    return planImport(t, guessMapping(t.headers), ctx);
  };

  it("imports a row of the team's file as the records' rules allow", () => {
    const [r] = plan(`${TEAM_HEADER}\nSvetlana Šaljić,Setcce,CEO,Sales,Meeting set,AI WEEK 2026,2026-11-11,Mara Lind,s@setcce.si,Send the follow-up,Met at the booth`);
    expect(r).toMatchObject({
      row: 2,
      leadName: "Setcce",
      organisation: { kind: "existing", id: "org-setcce", existingNotes: "Trust services", notes: "Meeting date: 2026-11-11\nNotes: Met at the booth" },
      source: { source: "EVENT", detail: "AI WEEK 2026" },
      person: { name: "Svetlana Šaljić", role: "CEO", email: "s@setcce.si", phone: null },
      kind: "SALES",
      status: "MEETING_SET",
      owner: MARA.address,
      nextStep: { text: "Send the follow-up", dueDate: null },
      problems: [],
      blocked: false,
      duplicateOf: null,
    });
  });

  it("creates a new organisation once and reuses it for later rows", () => {
    const rows = plan("Company,Name,Website\nCosylab,Igor,cosylab.com\nCOSYLAB,Ana,\nOther,,www.setcce.si");
    expect(rows[0].organisation).toEqual({ kind: "new", name: "Cosylab", website: "cosylab.com", notes: null });
    expect(rows[1].organisation).toEqual({ kind: "earlier", row: 2, name: "COSYLAB", notes: null });
    expect(rows[2].organisation).toMatchObject({ kind: "existing", id: "org-setcce" });
  });

  it("says what it changes: unknown kind, owner or status, statuses that need a reason or an owner", () => {
    const rows = plan(
      "Company,Type,Status,Owner\n" +
        "A,Friendship,In touch,Mara Lind\n" +
        "B,Sales,Met,Nobody\n" +
        "C,Sales,Won,Mara Lind\n" +
        "D,Investor,Proposal,0x1111111111111111111111111111111111111111\n" +
        "E,Sales,Stalled,\n" +
        "F,Sales,To contact,",
    );
    expect(rows[0]).toMatchObject({ kind: null, status: "IN_TOUCH", problems: ['"Friendship" is not a kind of lead: left unset'] });
    expect(rows[1]).toMatchObject({ owner: null, status: "TO_CONTACT" });
    expect(rows[1].problems).toEqual([
      '"Nobody" is not in the team: imported without an owner',
      "Past To contact a lead needs an owner and an organisation: imported as To contact",
    ]);
    expect(rows[2]).toMatchObject({ status: "TO_CONTACT", problems: ["Won needs a reason: imported as To contact; set it on the lead page"] });
    expect(rows[3]).toMatchObject({ kind: "INVESTOR", status: "MET", problems: ["An investor lead goes no further than met: imported as Met"] });
    expect(rows[4]).toMatchObject({ status: "TO_CONTACT", problems: ['"Stalled" is not a status: imported as To contact'] });
    expect(rows[5]).toMatchObject({ status: "TO_CONTACT", problems: [] });
  });

  it("names a lead without an organisation after itself, and blocks a row with neither", () => {
    const rows = plan("Lead,Company,Notes,Role,Next step due\nPilot,,Hot lead,CTO,soon\n,,,,");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ leadName: "Pilot", organisation: null, person: null, blocked: false });
    expect(rows[0].problems).toEqual([
      "Notes are kept on the organisation, and this row has none: they are left out",
      "A role, email or phone without a contact person's name is left out",
      '"soon" is not a date: the next step has no due date',
      "A due date without a next step is left out",
    ]);
    const blocked = plan("Lead,Company,Status\n,,Met");
    expect(blocked[0]).toMatchObject({ blocked: true, leadName: "" });
    expect(blocked[0].problems[0]).toBe("No organisation or lead name: this row can't be imported");
  });

  it("keeps a contact person only with an organisation, and dates a next step", () => {
    const [r] = plan("Lead,Contact name,Next step,Due\nPilot,Igor,Call,20.11.2026");
    expect(r.person).toBeNull();
    expect(r.problems).toContain("A contact person is kept on the organisation, and this row has none: left out");
    expect(r.nextStep).toEqual({ text: "Call", dueDate: "2026-11-20T00:00:00.000Z" });
  });

  it("finds a lead that already exists for the organisation", () => {
    expect(plan("Company\nKelvar Institute")[0].duplicateOf).toEqual({ id: "lead-1", name: "Kelvar Institute" });
    expect(plan("Company,Lead\nKelvar Institute,Second pilot")[0].duplicateOf).toBeNull();
  });
});

describe("where a lead came from", () => {
  it("takes a source's own name, and keeps other words as the detail", () => {
    expect(parseSource("Referral")).toEqual({ source: "REFERRAL", detail: null });
    expect(parseSource("inbound")).toEqual({ source: "INBOUND", detail: null });
    expect(parseSource("AI WEEK 2026")).toEqual({ source: "EVENT", detail: "AI WEEK 2026" });
    expect(parseSource("Seyforum conference")).toEqual({ source: "EVENT", detail: "Seyforum conference" });
    expect(parseSource("Referred by Nika")).toEqual({ source: "REFERRAL", detail: "Referred by Nika" });
    expect(parseSource("Partner intro via SAP")).toEqual({ source: "REFERRAL", detail: "Partner intro via SAP" });
    expect(parseSource("Website contact form")).toEqual({ source: "INBOUND", detail: "Website contact form" });
    expect(parseSource("Cold email")).toEqual({ source: "OUTBOUND", detail: "Cold email" });
    expect(parseSource("Reseller partner")).toEqual({ source: "PARTNER", detail: "Reseller partner" });
    expect(parseSource("A friend")).toEqual({ source: "OTHER", detail: "A friend" });
  });
});
