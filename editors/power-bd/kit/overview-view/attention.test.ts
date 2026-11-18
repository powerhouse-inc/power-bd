import { describe, expect, it } from "vitest";
import type { SlippingItem, SlippingReason } from "../overview/index.js";
import { attentionState, openToWatch } from "./attention.js";

const item = (...reasons: SlippingReason[]): SlippingItem => ({
  source: { kind: "lead", id: `lead-${reasons.join("-")}`, name: "Kelvar pilot" },
  reasons,
  since: {},
});

describe("the attention count's colour", () => {
  it("is red when something is overdue or missing", () => {
    expect(attentionState([item("NO_OWNER"), item("MEETING_NOT_RECORDED")], { team: 2, watching: 4, mine: false })).toEqual({
      tone: "alert",
      title: "need attention",
      sub: "Most urgent first",
      note: null,
      teamWaiting: 0,
    });
  });

  it("is orange when only second looks wait", () => {
    const state = attentionState([item("MEETING_NOT_RECORDED", "CONDITION_RECHECK")], { team: 1, watching: 4, mine: false });
    expect(state.tone).toBe("warn");
    expect(state.title).toBe("needs attention");
  });

  it("turns into a green all caught up when nothing of anyone's slips", () => {
    expect(attentionState([], { team: 0, watching: 4, mine: false })).toEqual({
      tone: "clear",
      title: "All caught up",
      sub: "Nothing is slipping right now.",
      note: null,
      teamWaiting: 0,
    });
    expect(attentionState([], { team: 0, watching: 4, mine: true }).tone).toBe("clear");
  });

  it("stays grey when nothing of yours slips but the team's items wait, and offers them", () => {
    expect(attentionState([], { team: 3, watching: 4, mine: true })).toEqual({
      tone: "quiet",
      title: "need attention",
      sub: "Nothing of yours",
      note: "Nothing of yours is slipping. 3 of the team's need attention.",
      teamWaiting: 3,
    });
    expect(attentionState([], { team: 1, watching: 4, mine: true }).note).toBe(
      "Nothing of yours is slipping. 1 of the team's needs attention.",
    );
  });

  it("stays grey when nothing is open to watch yet, rather than claiming all is well", () => {
    expect(attentionState([], { team: 0, watching: 0, mine: false })).toEqual({
      tone: "quiet",
      title: "need attention",
      sub: "Nothing open to watch yet",
      note: "Open leads and funding opportunities show here when something slips.",
      teamWaiting: 0,
    });
  });
});

describe("what the attention list watches", () => {
  it("counts the leads and funding opportunities that are not closed", () => {
    const leads = (["TO_CONTACT", "WON", "LOST", "PARKED"] as const).map((status, i) => ({ id: `l${i}`, state: { status } }));
    const opportunities = (["WATCHING", "AWARDED", "NO_GO"] as const).map((status, i) => ({ id: `o${i}`, state: { status } }));
    expect(openToWatch({ leads, opportunities } as unknown as Parameters<typeof openToWatch>[0])).toBe(3);
  });
});
