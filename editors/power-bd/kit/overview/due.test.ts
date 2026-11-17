import { describe, expect, it } from "vitest";
import { ALICE, BOB, decision, input, lead, opportunity } from "./fixtures.js";
import { overview } from "./overview.js";

const due = (i: Parameters<typeof input>[0]) => overview(input(i)).due;
const step = (over: object) => ({
  id: "st",
  kind: "CUT_OFF",
  label: "Cut-off",
  at: "2026-11-18T07:30:00.000Z",
  timeZone: "America/Los_Angeles",
  targeted: true,
  source: "call",
  checkedAt: "2026-11-01T00:00:00.000Z",
  ...over,
});
const ns = (over: object) => ({
  id: "n",
  text: "Send deck",
  owner: ALICE,
  dueDate: "2026-11-20",
  doneAt: null,
  ...over,
});

describe("what's due", () => {
  it("lists an open next step inside the window with its owner", () => {
    const d = due({
      leads: [
        { id: "L", state: lead({ name: "Acme Corp", nextSteps: [ns({})] }) },
      ],
    });
    expect(d).toEqual([
      {
        due: "NEXT_STEP",
        source: { kind: "lead", id: "L", name: "Acme Corp" },
        label: "Send deck",
        day: "2026-11-20",
        people: [ALICE],
      },
    ]);
  });

  it("leaves out done steps, steps outside the window, overdue steps and steps of closed items", () => {
    const steps = [
      ns({ id: "1", doneAt: "2026-11-10T00:00:00.000Z" }),
      ns({ id: "2", dueDate: "2026-11-24" }),
      ns({ id: "3", dueDate: "2026-11-15" }),
      ns({ id: "4", dueDate: null }),
    ];
    expect(
      due({ leads: [{ id: "L", state: lead({ nextSteps: steps }) }] }),
    ).toEqual([]);
    expect(
      due({
        leads: [
          {
            id: "L",
            state: lead({ status: "WON", nextSteps: [ns({})] } as never),
          },
        ],
      }),
    ).toEqual([]);
  });

  it("includes the first and the last day of the window", () => {
    const d = due({
      leads: [
        {
          id: "L",
          state: lead({
            nextSteps: [
              ns({ id: "a", dueDate: "2026-11-16" }),
              ns({ id: "b", dueDate: "2026-11-23" }),
            ],
          }),
        },
      ],
    });
    expect(d.map((x) => x.day)).toEqual(["2026-11-16", "2026-11-23"]);
  });

  it("shows a next step without an owner for nobody", () => {
    const d = due({
      opportunities: [
        { id: "O", state: opportunity({ nextSteps: [ns({ owner: null })] }) },
      ],
    });
    expect(d[0].people).toEqual([]);
    expect(d[0].source.kind).toBe("opportunity");
  });

  it("gives a meeting once, for each attendee, in our time and the meeting's", () => {
    const meeting = {
      id: "m",
      kind: "MEETING",
      status: "SCHEDULED",
      at: "2026-11-17T08:00:00.000Z",
      timeZone: "Asia/Tokyo",
      summary: "Intro call",
      people: [],
      teamMembers: [ALICE, BOB],
    };
    const d = due({
      leads: [
        {
          id: "L",
          state: lead({
            interactions: [
              meeting,
              { ...meeting, id: "h", status: "HELD" },
              { ...meeting, id: "n", at: null },
            ],
          } as never),
        },
      ],
    });
    expect(d).toEqual([
      {
        due: "MEETING",
        source: { kind: "lead", id: "L", name: "Acme Corp" },
        label: "Intro call",
        day: "2026-11-17",
        ourTime: "09:00",
        theirDay: "2026-11-17",
        theirTime: "17:00",
        theirTimeZone: "Asia/Tokyo",
        people: [ALICE, BOB],
      },
    ]);
  });

  it("labels a meeting without a summary by its kind", () => {
    const meeting = {
      id: "m",
      kind: "CALL",
      status: "SCHEDULED",
      at: "2026-11-17T08:00:00.000Z",
      timeZone: null,
      summary: null,
      people: [],
      teamMembers: [],
    };
    const d = due({
      leads: [{ id: "L", state: lead({ interactions: [meeting] } as never) }],
    });
    expect(d[0]).toMatchObject({
      label: "CALL",
      theirTimeZone: "Europe/Zurich",
      theirTime: "09:00",
    });
  });

  it("converts a funder deadline nine hours behind us across a date change", () => {
    const d = due({
      opportunities: [
        { id: "O", state: opportunity({ steps: [step({})] } as never) },
      ],
    });
    expect(d).toEqual([
      {
        due: "OPPORTUNITY_STEP",
        source: { kind: "opportunity", id: "O", name: "Fund X" },
        label: "Cut-off",
        day: "2026-11-18",
        ourTime: "08:30",
        theirDay: "2026-11-17",
        theirTime: "23:30",
        theirTimeZone: "America/Los_Angeles",
        people: [ALICE],
      },
    ]);
  });

  it("puts a step that is past or outside the window out of the list", () => {
    const steps = [
      step({ id: "a", at: "2026-11-16T08:00:00.000Z" }),
      step({ id: "b", at: "2026-11-30T08:00:00.000Z" }),
    ];
    expect(
      due({
        opportunities: [{ id: "O", state: opportunity({ steps } as never) }],
      }),
    ).toEqual([]);
  });

  it("lists decide-by dates of opportunities being evaluated and of open decisions only", () => {
    const d = due({
      opportunities: [
        {
          id: "O1",
          state: opportunity({
            status: "TO_EVALUATE",
            decideBy: "2026-11-19",
            nextSteps: [],
          } as never),
        },
        {
          id: "O2",
          state: opportunity({
            status: "DECIDING",
            decideBy: "2026-11-18",
            nextSteps: [],
          } as never),
        },
        {
          id: "O3",
          state: opportunity({
            status: "PREPARING",
            decideBy: "2026-11-19",
            nextSteps: [],
          } as never),
        },
      ],
      decisions: [
        {
          id: "D1",
          state: decision({
            question: "Which entity?",
            decideBy: "2026-11-17",
            owner: BOB,
          }),
        },
        {
          id: "D2",
          state: decision({ status: "ANSWERED", decideBy: "2026-11-17" }),
        },
        { id: "D3", state: decision({ decideBy: null }) },
      ],
    });
    expect(d.map((x) => [x.due, x.source.id, x.day, x.people])).toEqual([
      ["DECIDE_BY", "D1", "2026-11-17", [BOB]],
      ["DECIDE_BY", "O2", "2026-11-18", [ALICE]],
      ["DECIDE_BY", "O1", "2026-11-19", [ALICE]],
    ]);
    expect(d[0].source).toEqual({
      kind: "decision",
      id: "D1",
      name: "Which entity?",
    });
  });

  it("lists the expected opening of watched opportunities", () => {
    const d = due({
      opportunities: [
        {
          id: "O",
          state: opportunity({
            status: "WATCHING",
            expectedOpening: "2026-11-21",
            nextSteps: [],
          } as never),
        },
        {
          id: "P",
          state: opportunity({
            status: "PREPARING",
            expectedOpening: "2026-11-21",
            nextSteps: [],
          } as never),
        },
      ],
    });
    expect(d.map((x) => [x.due, x.source.id])).toEqual([
      ["EXPECTED_OPENING", "O"],
    ]);
  });

  it("orders by day, then by time, whole days first", () => {
    const d = due({
      leads: [
        {
          id: "L",
          state: lead({ nextSteps: [ns({ dueDate: "2026-11-18" })] }),
        },
      ],
      opportunities: [
        {
          id: "O",
          state: opportunity({
            steps: [
              step({ at: "2026-11-18T07:30:00.000Z" }),
              step({ id: "e", at: "2026-11-18T06:00:00.000Z" }),
            ],
            nextSteps: [],
          } as never),
        },
      ],
    });
    expect(d.map((x) => x.ourTime ?? "all day")).toEqual([
      "all day",
      "07:00",
      "08:30",
    ]);
  });

  it("falls back to UTC when no time zone is set", () => {
    const d = overview({
      ...input({
        opportunities: [
          {
            id: "O",
            state: opportunity({
              steps: [
                step({ at: "2026-11-18T07:30:00.000Z", timeZone: "UTC" }),
              ],
            } as never),
          },
        ],
      }),
      settings: { timeZone: null, dueWindowDays: 7 },
    }).due;
    expect(d[0].ourTime).toBe("07:30");
  });
});

describe("what's due: more sources", () => {
  it("lists a scheduled meeting of an opportunity and names a nameless item", () => {
    const m = {
      id: "m",
      kind: "CALL",
      status: "SCHEDULED",
      at: "2026-11-17T08:00:00.000Z",
      timeZone: "UTC",
      summary: null,
      people: [],
      teamMembers: [BOB],
    };
    const d = due({
      opportunities: [
        {
          id: "O",
          state: opportunity({
            name: null,
            interactions: [m, { ...m, id: "h", status: "HELD" }],
            nextSteps: [],
          } as never),
        },
      ],
    });
    expect(d).toHaveLength(1);
    expect(d[0]).toMatchObject({
      due: "MEETING",
      source: { name: "" },
      people: [BOB],
      theirTime: "08:00",
    });
  });

  it("leaves out the steps and meetings of closed opportunities, and a step with no owner has nobody", () => {
    const m = {
      id: "m",
      kind: "CALL",
      status: "SCHEDULED",
      at: "2026-11-17T08:00:00.000Z",
      timeZone: "UTC",
      summary: "x",
      people: [],
      teamMembers: [],
    };
    expect(
      due({
        opportunities: [
          {
            id: "O",
            state: opportunity({ status: "NO_GO", interactions: [m] } as never),
          },
        ],
      }),
    ).toEqual([]);
    const d = due({
      opportunities: [
        {
          id: "O",
          state: opportunity({
            owner: null,
            steps: [step({})],
            nextSteps: [],
          } as never),
        },
      ],
    });
    expect(d[0].people).toEqual([]);
  });

  it("names a nameless decision", () => {
    const d = due({
      decisions: [
        {
          id: "D",
          state: decision({
            question: null,
            decideBy: "2026-11-17",
            owner: null,
          }),
        },
      ],
    });
    expect(d[0]).toMatchObject({ source: { name: "" }, people: [] });
  });
});

describe("what's due: ties and done opportunity steps", () => {
  it("keeps two items of the same day together and skips a done opportunity step", () => {
    const d = due({
      opportunities: [
        {
          id: "O",
          state: opportunity({
            nextSteps: [
              ns({ id: "a", text: "One", dueDate: "2026-11-18" }),
              ns({ id: "b", text: "Two", dueDate: "2026-11-18" }),
              ns({
                id: "c",
                text: "Done",
                dueDate: "2026-11-18",
                doneAt: "2026-11-17T00:00:00.000Z",
              }),
              ns({ id: "d", text: "Later", dueDate: "2026-11-17" }),
            ],
          }),
        },
      ],
    });
    expect(d.map((x) => x.label)).toEqual(["Later", "One", "Two"]);
  });
});

describe("whole days stored as instants", () => {
  const one = (dueDate: string) =>
    due({
      leads: [
        {
          id: "L",
          state: lead({ name: "Acme Corp", nextSteps: [ns({ dueDate })] }),
        },
      ],
    });

  it("keeps only the date part as the day", () => {
    expect(one("2026-11-20T00:00:00.000Z").map((d) => d.day)).toEqual([
      "2026-11-20",
    ]);
  });

  it("includes an item due on the last day of the window, instant or date", () => {
    expect(one("2026-11-23T00:00:00.000Z").map((d) => d.day)).toEqual([
      "2026-11-23",
    ]);
    expect(one("2026-11-23").map((d) => d.day)).toEqual(["2026-11-23"]);
    expect(one("2026-11-24T00:00:00.000Z")).toEqual([]);
  });
});
