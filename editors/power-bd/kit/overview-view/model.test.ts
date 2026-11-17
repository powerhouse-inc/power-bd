import { describe, expect, it } from "vitest";
import { decision, lead, NOW, opportunity } from "../overview/fixtures.js";
import { overviewModel } from "./model.js";

const records = {
  now: NOW,
  leads: [{ id: "l1", state: lead({ name: "Harbour Studio" }) }],
  opportunities: [
    {
      id: "o1",
      state: opportunity({ name: "Orvane Foundation", status: "PREPARING" }),
    },
    {
      id: "o2",
      state: opportunity({ name: "Old call", status: "REJECTED" }),
    },
  ],
  investorLists: [],
  decisions: [
    { id: "d1", state: decision({ status: "OPEN" }) },
    { id: "d2", state: decision({ status: "ANSWERED" }) },
  ],
  proposals: [],
};

describe("overviewModel", () => {
  it("fills the settings defaults when the settings document has none", () => {
    const m = overviewModel(records, undefined);
    expect(m.zone).toBe("UTC");
    expect(m.windowDays).toBe(14);
    expect(m.input.settings).toEqual({ timeZone: null, dueWindowDays: 14 });
  });

  it("takes the time zone and due window from the settings", () => {
    const m = overviewModel(records, {
      timeZone: "Europe/Zurich",
      dueWindowDays: 7,
    });
    expect(m.zone).toBe("Europe/Zurich");
    expect(m.windowDays).toBe(7);
  });

  it("keys every item by kind and id", () => {
    const m = overviewModel(records, undefined);
    expect([...m.byKey.keys()].sort()).toEqual([
      "decision:d1",
      "decision:d2",
      "lead:l1",
      "opportunity:o1",
      "opportunity:o2",
    ]);
  });

  it("counts open decisions and the relationships that are not closed", () => {
    const m = overviewModel(records, undefined);
    expect(m.openDecisions).toBe(1);
    expect(m.relationships).toBe(2);
  });

  it("leaves closed opportunities out of the open funding totals", () => {
    const m = overviewModel(
      {
        ...records,
        opportunities: [
          {
            id: "o1",
            state: opportunity({
              status: "PREPARING",
              amount: 50000,
              currency: "EUR",
            }),
          },
          {
            id: "o2",
            state: opportunity({
              status: "REJECTED",
              amount: 90000,
              currency: "EUR",
            }),
          },
        ],
      },
      undefined,
    );
    expect(m.totals).toEqual([{ currency: "EUR", amount: 50000, count: 1 }]);
  });
});
