import { describe, expect, it } from "vitest";
import { lead } from "../overview/fixtures.js";
import { agentPrompt, briefMarkdown, buildBrief, type BriefInput } from "./brief.js";

const MARA = "0x1111111111111111111111111111111111111111";
const ORG = {
  id: "org-1",
  name: "Kelvar Institute",
  website: "https://kelvar.example",
  country: "SI",
  tags: ["customer"],
  notes: "Research institute with 40 staff.\nSecond paragraph that the brief leaves out.",
  people: [
    { id: "p1", name: "Ana Novak", role: "Head of IT" },
    { id: "p2", name: "Luka Kos", role: null },
  ],
};
const PARTNER = { id: "org-2", name: "Brightwater", tags: [], people: [{ id: "q1", name: "Eva Horvat", role: "Advisor" }] };

const input = (over: Partial<BriefInput["lead"]> = {}, rest: Partial<BriefInput> = {}): BriefInput => ({
  lead: {
    ...lead({ name: "Kelvar data partnership", status: "MET", kind: "PARTNERSHIP", owner: MARA, organisationId: "org-1" }),
    angles: [
      { id: "a1", summary: "Later idea", fit: "LATER", positioningId: null },
      { id: "a2", summary: "Signed records for their lab data", fit: "BEST", positioningId: "pos-1" },
    ],
    interactions: [
      { id: "i1", kind: "CALL", status: "HELD", at: "2026-11-02T09:00:00.000Z", timeZone: "Europe/Ljubljana", summary: "Intro call", people: [], teamMembers: [MARA], notesSource: null, outcome: null },
      { id: "i2", kind: "MEETING", status: "SCHEDULED", at: "2026-11-19T09:00:00.000Z", timeZone: "Europe/Ljubljana", summary: "Data workshop", people: [{ contactId: "org-1", personId: "p1" }], teamMembers: [MARA], notesSource: null, outcome: null },
      { id: "i3", kind: "EMAIL", status: "HELD", at: "2026-11-10T09:00:00.000Z", timeZone: null, summary: null, people: [], teamMembers: [], notesSource: null, outcome: null },
    ],
    nextSteps: [
      { id: "s1", text: "Send the outline", owner: MARA, dueDate: "2026-11-16T00:00:00.000Z", doneAt: null },
      { id: "s2", text: "Done already", owner: MARA, dueDate: "2026-11-01T00:00:00.000Z", doneAt: "2026-11-01T10:00:00.000Z" },
      { id: "s3", text: "Undated", owner: null, dueDate: null, doneAt: null },
      { id: "s4", text: "Book a room", owner: MARA, dueDate: "2026-11-20T00:00:00.000Z", doneAt: null },
    ],
    contactLinks: [
      { id: "c1", contactId: "org-1", personId: "p1", role: "Champion", dealRole: null },
      { id: "c2", contactId: "org-2", personId: "q1", role: null, dealRole: null },
    ],
    references: [
      { id: "r1", kind: "COMPARABLE", documentId: "n1", title: "Larkspire" },
      { id: "r2", kind: "LEAD", documentId: "l9", title: "Another lead" },
      { id: "r3", kind: "NOTE", documentId: "n2", title: "Workshop notes" },
    ],
    confidentialItems: [{ id: "x1", subjectContactId: null, text: "Their budget is €40k", addedBy: MARA, addedAt: "2026-11-01T10:00:00.000Z" }],
    ...over,
  },
  organisations: [ORG, PARTNER],
  proposals: [
    { title: "Data pilot", status: "SENT", statusLabel: "Sent", value: "€15,000.00", validUntilLabel: "Fri 4 Dec", waitLabel: "Waits on the client" },
    { title: "Old one", status: "WITHDRAWN", statusLabel: "Withdrawn", value: "€1.00", validUntilLabel: null, waitLabel: "" },
  ],
  neverClaims: [{ claim: "Our signatures are eIDAS qualified", reason: "They are not" }, { claim: "No reason given" }],
  positioning: [{ id: "pos-1", title: "Signed decision records" }],
  ownerName: (a) => (a === MARA ? "Mara Lind" : a),
  today: "2026-11-18",
  when: (at, zone) => `${at.slice(0, 16)}${zone ? ` ${zone}` : ""}`,
  ...rest,
});
const section = (b: ReturnType<typeof buildBrief>, id: string) => b.sections.find((s) => s.id === id);

describe("buildBrief", () => {
  it("names the lead and sums it up", () => {
    const b = buildBrief(input());
    expect(b.title).toBe("Brief: Kelvar data partnership");
    expect(b.summary).toBe("Met · Partnership · Mara Lind owns it · Kelvar Institute");
    expect(b.sections.map((s) => s.id)).toEqual(["organisation", "people", "angles", "history", "steps", "proposal", "references", "never", "internal"]);
  });

  it("says who they are from the first paragraph of the notes, and who is who", () => {
    const b = buildBrief(input());
    expect(section(b, "organisation")?.lines).toEqual([
      { text: "Kelvar Institute", detail: "https://kelvar.example · SI · customer" },
      { text: "Research institute with 40 staff." },
    ]);
    expect(section(b, "people")?.lines).toEqual([
      { text: "Ana Novak", detail: "Head of IT · on this lead: Champion" },
      { text: "Luka Kos" },
      { text: "Eva Horvat", detail: "Brightwater" },
    ]);
  });

  it("puts the best angles first, with the positioning they stand for", () => {
    expect(section(buildBrief(input()), "angles")?.lines).toEqual([
      { text: "Signed records for their lab data", detail: "Best fit · stands for: Signed decision records" },
      { text: "Later idea", detail: "Later fit" },
    ]);
  });

  it("lists the history latest first and the open steps by date, late ones marked", () => {
    const b = buildBrief(input());
    expect(section(b, "history")?.lines.map((l) => l.text)).toEqual(["Meeting: Data workshop", "Email", "Call: Intro call"]);
    expect(section(b, "history")?.lines[1].detail).toBe("Held · 2026-11-10T09:00");
    expect(section(b, "steps")?.lines).toEqual([
      { text: "Send the outline", detail: "was due 2026-11-16 · Mara Lind", late: true },
      { text: "Book a room", detail: "due 2026-11-20 · Mara Lind" },
      { text: "Undated", detail: "no date · no owner" },
    ]);
  });

  it("shows only the live proposal, the notes to read, the never-claims and the confidential items as internal", () => {
    const b = buildBrief(input());
    expect(section(b, "proposal")?.lines).toEqual([{ text: "Data pilot: Sent", detail: "€15,000.00 · valid until Fri 4 Dec · Waits on the client" }]);
    expect(section(b, "references")?.lines).toEqual([
      { text: "Larkspire", detail: "Comparable" },
      { text: "Workshop notes", detail: "Note" },
    ]);
    expect(section(b, "never")?.lines).toEqual([{ text: "Our signatures are eIDAS qualified", detail: "They are not" }, { text: "No reason given" }]);
    expect(section(b, "internal")).toMatchObject({ internal: true, lines: [{ text: "Their budget is €40k" }] });
  });

  it("opens with the meeting it is for, and leaves it out of the history", () => {
    const b = buildBrief(input(), { meetingId: "i2" });
    expect(b.title).toBe("Brief: meeting with Kelvar Institute");
    expect(section(b, "meeting")?.lines).toEqual([
      { text: "Meeting: Data workshop", detail: "2026-11-19T09:00 Europe/Ljubljana · with Ana Novak · for us: Mara Lind" },
    ]);
    expect(section(b, "history")?.lines).toHaveLength(2);
  });

  it("says what is missing on an empty lead", () => {
    const b = buildBrief(
      input({ organisationId: null, owner: null, angles: [], interactions: [], nextSteps: [], contactLinks: [], references: [], confidentialItems: [], name: null }, { proposals: [], neverClaims: [] }),
      { meetingId: "nope" },
    );
    expect(b.title).toBe("Brief: Untitled lead");
    expect(b.summary).toBe("Met · Partnership · No owner · No organisation linked");
    expect(b.sections.every((s) => s.lines.length === 0)).toBe(true);
    expect(section(b, "organisation")?.empty).toBe("No organisation is linked to this lead.");
  });

  it("cuts a long first paragraph and meets a meeting with no time or people", () => {
    const long = "x".repeat(500);
    const b = buildBrief(
      input({ interactions: [{ id: "m", kind: "MEETING", status: "SCHEDULED", at: null, timeZone: null, summary: null, people: [], teamMembers: [], notesSource: null, outcome: null }] }, { organisations: [{ ...ORG, notes: long, website: null, country: null, tags: [] }, PARTNER] }),
      { meetingId: "m" },
    );
    expect(section(b, "organisation")?.lines[0]).toEqual({ text: "Kelvar Institute" });
    expect(section(b, "organisation")?.lines[1].text).toHaveLength(400);
    expect(section(b, "meeting")?.lines[0]).toEqual({ text: "Meeting", detail: "No time set" });
  });
});

describe("briefMarkdown and agentPrompt", () => {
  it("writes markdown, with the confidential section only when asked and marked", () => {
    const b = buildBrief(input());
    const shared = briefMarkdown(b, { internal: false });
    expect(shared).toContain("# Brief: Kelvar data partnership");
    expect(shared).toContain("- **Late:** Send the outline (was due 2026-11-16 · Mara Lind)");
    expect(shared).not.toContain("€40k");
    const team = briefMarkdown(b, { internal: true });
    expect(team).toContain("## Internal only (confidential: do not share)");
    expect(team).toContain("- Their budget is €40k");
    const empty = briefMarkdown(buildBrief(input({ confidentialItems: [] })), { internal: true });
    expect(empty).toContain("_Nothing confidential on this lead._");
  });

  it("asks the agent with the brief and never the confidential items", () => {
    const prompt = agentPrompt(buildBrief(input()));
    expect(prompt).toMatch(/^Prepare me for this meeting\./);
    expect(prompt).toContain("five questions");
    expect(prompt).toContain("## Never claim");
    expect(prompt).not.toContain("€40k");
    expect(prompt).not.toContain("Internal only");
  });
});
