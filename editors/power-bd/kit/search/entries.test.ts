import { searchEntries } from "./entries.js";
import { MARA, TOM, space, spaceWithConfidential } from "./fixtures.js";

const entries = searchEntries(space());
const byKey = (key: string) => {
  const e = entries.find((x) => x.key === key);
  if (!e) throw new Error(`no entry ${key}`);
  return e;
};
const field = (key: string, label: string) =>
  byKey(key)
    .fields.filter((f) => f.label === label)
    .map((f) => f.text);

describe("searchEntries: leads", () => {
  it("names the lead, its organisation, status and owner", () => {
    const e = byKey("lead:lead-1");
    expect(e).toMatchObject({
      group: "lead",
      icon: "leads",
      title: "Pilot with Brisa Labs",
      detail: "Brisa Labs",
      tag: { label: "In touch", tone: "blue" },
      owner: MARA,
      target: { type: "record", id: "lead-1" },
      changedAt: "2026-11-16T09:00:00.000Z",
    });
    expect(field("lead:lead-1", "Organisation")).toEqual(["Brisa Labs"]);
    expect(field("lead:lead-1", "Status")).toEqual(["In touch"]);
    expect(field("lead:lead-1", "Kind")).toEqual(["Sales"]);
    expect(field("lead:lead-1", "Owner")).toEqual(["Mara Lind"]);
  });

  it("keeps open next steps, linked people it can name, and the history", () => {
    expect(field("lead:lead-1", "Next step")).toEqual([
      "Send the pilot outline",
    ]);
    expect(field("lead:lead-1", "Person")).toEqual(["Inês Caldeira"]);
    expect(field("lead:lead-1", "History")).toEqual([
      "Intro call about the tide sensors",
    ]);
  });

  it("gives a lead without a name, kind, organisation or owner a title and no empty fields", () => {
    const e = byKey("lead:lead-2");
    expect(e.title).toBe("Untitled lead");
    expect(e.detail).toBeNull();
    expect(e.owner).toBeNull();
    expect(e.tag).toEqual({ label: "Won", tone: "green" });
    expect(e.fields).toEqual([
      { label: "Status", text: "Won" },
      { label: "Reason", text: "Signed after the workshop" },
    ]);
  });
});

describe("searchEntries: funding opportunities", () => {
  it("names the funder, the round, the programme and the partners", () => {
    const e = byKey("opportunity:opp-1");
    expect(e).toMatchObject({
      group: "opportunity",
      icon: "funding",
      title: "Harbour Innovation Fund, round 3",
      detail: "Harbour Foundation",
      tag: { label: "Preparing", tone: "blue" },
      owner: TOM,
      target: { type: "record", id: "opp-1" },
    });
    expect(field("opportunity:opp-1", "Funder")).toEqual([
      "Harbour Foundation",
    ]);
    expect(field("opportunity:opp-1", "Instrument")).toEqual(["Grant"]);
    expect(field("opportunity:opp-1", "Round")).toEqual(["Autumn window"]);
    expect(field("opportunity:opp-1", "Programme")).toEqual([
      "Blue economy programme",
    ]);
    expect(field("opportunity:opp-1", "Where to apply")).toEqual([
      "portal.harbour.example",
    ]);
    expect(field("opportunity:opp-1", "Next step")).toEqual([
      "Draft the budget",
    ]);
    expect(field("opportunity:opp-1", "Partner")).toEqual(["Brisa Labs"]);
    expect(field("opportunity:opp-1", "Owner")).toEqual(["Tom Okafor"]);
  });

  it("titles an unnamed one and skips a partner it cannot name", () => {
    const e = byKey("opportunity:opp-2");
    expect(e.title).toBe("Untitled funding opportunity");
    expect(e.detail).toBeNull();
    expect(e.fields).toEqual([{ label: "Status", text: "Watching" }]);
    expect(e.changedAt).toBeNull();
  });
});

describe("searchEntries: organisations and their people", () => {
  it("indexes the organisation with its tags, website and notes", () => {
    const e = byKey("organisation:org-1");
    expect(e).toMatchObject({
      group: "organisation",
      icon: "organisations",
      title: "Brisa Labs",
      detail: null,
      tag: null,
      target: { type: "record", id: "org-1" },
    });
    expect("owner" in e).toBe(false);
    expect(field("organisation:org-1", "Tag")).toEqual(["sensors", "ports"]);
    expect(field("organisation:org-1", "Website")).toEqual(["brisa.example"]);
    expect(field("organisation:org-1", "Email")).toEqual([
      "hello@brisa.example",
    ]);
    expect(field("organisation:org-1", "Notes")).toEqual([
      "Met at the Lisbon harbour fair",
    ]);
  });

  it("marks an archived organisation and names an unnamed one", () => {
    expect(byKey("organisation:org-2").tag).toEqual({
      label: "Archived",
      tone: "default",
    });
    expect(byKey("organisation:org-3").title).toBe("Unnamed organisation");
  });

  it("makes each person a result that opens their organisation", () => {
    const e = byKey("person:org-1:p1");
    expect(e).toMatchObject({
      group: "person",
      icon: "user",
      title: "Inês Caldeira",
      detail: "Head of operations · Brisa Labs",
      tag: null,
      target: { type: "record", id: "org-1" },
      changedAt: null,
    });
    expect(e.fields).toEqual([
      { label: "Organisation", text: "Brisa Labs" },
      { label: "Role", text: "Head of operations" },
      { label: "Email", text: "ines@brisa.example" },
    ]);
    expect(byKey("person:org-1:p2").detail).toBe("Brisa Labs");
  });
});

describe("searchEntries: investors on the list", () => {
  it("makes each row a result that opens the row in Investors", () => {
    expect(byKey("investor:r1")).toMatchObject({
      group: "investor",
      icon: "investors",
      title: "Tallgrass Ventures",
      detail: "Climate seed funds 2026",
      tag: { label: "Shortlisted", tone: "blue" },
      target: { type: "investor-row", rowId: "r1" },
      changedAt: null,
    });
    expect(field("investor:r1", "List")).toEqual(["Climate seed funds 2026"]);
    expect(field("investor:r1", "Website")).toEqual(["tallgrass.example"]);
  });

  it("keeps why a row was excluded and the organisation it became", () => {
    const e = byKey("investor:r2");
    expect(e.detail).toBeNull();
    expect(field("investor:r2", "Reason")).toEqual([
      "Only invests after series B",
    ]);
    expect(field("investor:r2", "Organisation")).toEqual(["Brisa Labs"]);
  });
});

describe("searchEntries: proposals", () => {
  it("keeps the short code, the lead, its organisation, owner and the recipient", () => {
    const e = byKey("proposal:prop-1");
    expect(e).toMatchObject({
      group: "proposal",
      icon: "proposal",
      title: "Tide sensor pilot",
      detail: "BRI-26-01 · Pilot with Brisa Labs",
      tag: { label: "Sent", tone: "purple" },
      owner: MARA,
      target: { type: "record", id: "prop-1" },
    });
    expect(field("proposal:prop-1", "Code")).toEqual(["BRI-26-01"]);
    expect(field("proposal:prop-1", "Lead")).toEqual([
      "Pilot with Brisa Labs",
    ]);
    expect(field("proposal:prop-1", "Organisation")).toEqual(["Brisa Labs"]);
    expect(field("proposal:prop-1", "Person")).toEqual(["Rui Fontes"]);
  });

  it("titles an untitled one after its untitled lead, and leaves a loose one without lead or owner", () => {
    expect(byKey("proposal:prop-2")).toMatchObject({
      title: "Untitled proposal",
      detail: "Untitled lead",
      owner: null,
    });
    const loose = byKey("proposal:prop-3");
    expect(loose.detail).toBeNull();
    expect(loose.owner).toBeNull();
    expect(loose.fields).toEqual([
      { label: "Organisation", text: "Harbour Foundation" },
      { label: "Status", text: "Withdrawn" },
      { label: "Reason", text: "Budget froze" },
    ]);
  });
});

describe("searchEntries: decisions", () => {
  it("is found by its question, context, answer and reason", () => {
    expect(byKey("decision:dec-1")).toMatchObject({
      group: "decision",
      icon: "decisions",
      title: "Which entity applies to EU calls?",
      tag: { label: "Open", tone: "yellow" },
      owner: MARA,
      target: { type: "record", id: "dec-1" },
    });
    expect(field("decision:dec-1", "Context")).toEqual([
      "EU calls need an EU-registered applicant",
    ]);
    const answered = byKey("decision:dec-2");
    expect(answered.title).toBe("Untitled decision");
    expect(field("decision:dec-2", "Answer")).toEqual([
      "Use the Lisbon entity",
    ]);
    expect(field("decision:dec-2", "Reason")).toEqual(["Lowest co-funding"]);
  });
});

describe("searchEntries: playbook", () => {
  it("indexes positioning, proof cases and never-claim items, each opening the Playbook", () => {
    expect(byKey("playbook:po1")).toMatchObject({
      group: "playbook",
      icon: "playbook",
      title: "Sensors for small ports",
      detail: "Positioning",
      tag: { label: "Approved", tone: "green" },
      target: { type: "playbook" },
      changedAt: null,
    });
    expect(field("playbook:po1", "Text")).toEqual([
      "We instrument quays without downtime",
    ]);
    expect(byKey("playbook:pc1")).toMatchObject({
      title: "Quay 4 retrofit",
      detail: "Proof case",
      tag: null,
    });
    expect(field("playbook:pc1", "Summary")).toEqual([
      "Cut manual readings by half",
    ]);
    expect(byKey("playbook:pc2").fields).toEqual([]);
    expect(byKey("playbook:nc1")).toMatchObject({
      title: "Certified for offshore use",
      detail: "Never claim",
    });
    expect(field("playbook:nc1", "Phrase")).toEqual([
      "offshore certified",
      "ATEX rated",
    ]);
    expect(field("playbook:nc1", "Reason")).toEqual(["No certificate yet"]);
    expect(byKey("playbook:nc2").fields).toEqual([]);
  });
});

describe("searchEntries: the whole index", () => {
  it("gives every entry its own key", () => {
    const keys = entries.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("shows a stored value it has no label for in plain words, never the code", () => {
    const [e] = searchEntries(
      space({
        leads: [
          {
            id: "l",
            state: {
              name: "Odd",
              status: "ON_HOLD_NOW",
              kind: "SIDE_DEAL",
              nextSteps: [],
              contactLinks: [],
              interactions: [],
            },
          },
        ],
      }),
    );
    expect(e.tag).toEqual({ label: "On hold now", tone: "default" });
    expect(e.fields).toContainEqual({ label: "Kind", text: "Side deal" });
  });

  it("names what was saved without a name", () => {
    const blank = searchEntries(
      space({
        contacts: [
          {
            id: "o",
            state: {
              name: "Org",
              status: "ACTIVE",
              tags: [],
              people: [{ id: "p", name: " " }],
            },
          },
        ],
        investorLists: [
          { id: "l", state: { rows: [{ id: "r", name: "", state: "LISTED" }] } },
        ],
        playbooks: [
          {
            id: "b",
            state: {
              positioning: [],
              proofCases: [{ id: "c", title: "" }],
              neverClaims: [],
            },
          },
        ],
      }),
    );
    const title = (key: string) => blank.find((e) => e.key === key)?.title;
    expect(title("person:o:p")).toBe("Unnamed person");
    expect(title("investor:r")).toBe("Unnamed investor");
    expect(title("playbook:c")).toBe("Untitled proof case");
  });

  it("names an owner who is not on the team without showing the address", () => {
    const [e] = searchEntries(space({ members: [] }));
    expect(e.fields.some((f) => f.label === "Owner")).toBe(false);
    expect(JSON.stringify(e)).toContain(MARA); // the mark still needs it
    expect(e.fields.some((f) => f.text.includes("0x"))).toBe(false);
  });

  it("never holds a word of a confidential item", () => {
    const all = JSON.stringify(searchEntries(spaceWithConfidential()));
    for (const word of ["lock-in", "Zephyrcorp", "jury", "Quillfeather"])
      expect(all).not.toContain(word);
    expect(searchEntries(spaceWithConfidential())).toEqual(entries);
  });
});
