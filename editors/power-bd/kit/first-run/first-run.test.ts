import {
  SETUP_STEPS,
  browserTimeZone,
  firstRefusal,
  guidePrefsKey,
  hideGuide,
  missingFields,
  parseAmount,
  parseGuidePrefs,
  reopenGuide,
  serialiseGuidePrefs,
  setupProgress,
  skipStep,
  type GuidePrefs,
  type RecordLike,
  type SetupFacts,
  vaultDrives,
} from "./index.js";

const EMPTY: SetupFacts = {
  settingsReady: true,
  teamMembers: 0,
  timeZone: null,
  vaultDriveId: null,
  organisations: 0,
  relationships: 0,
};
const OPEN: GuidePrefs = { hidden: false, skipped: [] };
const states = (facts: SetupFacts, prefs = OPEN) =>
  setupProgress(facts, prefs).steps.map((s) => s.state);

describe("setupProgress", () => {
  it("lists the five steps in order, each with a title and a reason", () => {
    const { steps, total } = setupProgress(EMPTY, OPEN);
    expect(steps.map((s) => s.id)).toEqual([
      "team",
      "time",
      "vault",
      "organisation",
      "relationship",
    ]);
    expect(total).toBe(5);
    expect(steps.map((s) => s.number)).toEqual([1, 2, 3, 4, 5]);
    for (const s of steps) {
      expect(s.title).not.toBe("");
      expect(s.why).not.toBe("");
    }
    expect(SETUP_STEPS.filter((s) => s.optional).map((s) => s.id)).toEqual([
      "vault",
    ]);
  });

  it("starts an empty drive in the guide, on the first step", () => {
    const p = setupProgress(EMPTY, OPEN);
    expect(p.mode).toBe("guide");
    expect(p.current).toBe("team");
    expect(p.done).toBe(0);
    expect(p.label).toBe("0 of 5 done");
    expect(states(EMPTY)).toEqual(["current", "todo", "todo", "todo", "todo"]);
  });

  it("ticks steps from the data, whatever their order", () => {
    const facts = { ...EMPTY, teamMembers: 2, organisations: 1 };
    const p = setupProgress(facts, OPEN);
    expect(states(facts)).toEqual(["done", "current", "todo", "done", "todo"]);
    expect(p.current).toBe("time");
    expect(p.done).toBe(2);
    expect(p.label).toBe("2 of 5 done");
    expect(p.mode).toBe("guide");
  });

  it("treats a blank time zone or vault as not set", () => {
    const facts = { ...EMPTY, timeZone: "  ", vaultDriveId: "" };
    expect(states(facts).slice(1, 3)).toEqual(["todo", "todo"]);
    expect(
      states({ ...EMPTY, timeZone: undefined, vaultDriveId: undefined }),
    ).toEqual(states(EMPTY));
  });

  it("moves to the strip once the first relationship exists", () => {
    const facts = {
      ...EMPTY,
      teamMembers: 3,
      timeZone: "Europe/Zurich",
      organisations: 4,
      relationships: 6,
    };
    const p = setupProgress(facts, OPEN);
    expect(p.mode).toBe("strip");
    expect(p.current).toBe("vault");
    expect(p.done).toBe(4);
    expect(p.remaining).toBe(1);
  });

  it("keeps a drive with relationships out of the guide even without a team", () => {
    const p = setupProgress({ ...EMPTY, relationships: 1 }, OPEN);
    expect(p.mode).toBe("strip");
    expect(p.current).toBe("team");
    expect(p.remaining).toBe(4);
  });

  it("shows nothing when every step is done", () => {
    const p = setupProgress(
      {
        settingsReady: true,
        teamMembers: 1,
        timeZone: "UTC",
        vaultDriveId: "vault",
        organisations: 1,
        relationships: 1,
      },
      OPEN,
    );
    expect(p.mode).toBe("none");
    expect(p.current).toBeNull();
    expect(p.done).toBe(5);
    expect(p.remaining).toBe(0);
    expect(p.label).toBe("5 of 5 done");
  });

  it("passes over a skipped step without counting it as done", () => {
    const prefs = skipStep(OPEN, "vault");
    const facts = { ...EMPTY, teamMembers: 1, timeZone: "UTC" };
    const p = setupProgress(facts, prefs);
    expect(states(facts, prefs)).toEqual([
      "done",
      "done",
      "skipped",
      "current",
      "todo",
    ]);
    expect(p.done).toBe(2);
    expect(p.remaining).toBe(2);
  });

  it("shows nothing when only a skipped step is left", () => {
    const facts = {
      ...EMPTY,
      teamMembers: 1,
      timeZone: "UTC",
      organisations: 1,
      relationships: 1,
    };
    const p = setupProgress(facts, skipStep(OPEN, "vault"));
    expect(p.mode).toBe("none");
    expect(p.label).toBe("4 of 5 done");
  });

  it("shows a step as done when it is both skipped and set", () => {
    const facts = { ...EMPTY, vaultDriveId: "vault" };
    expect(states(facts, skipStep(OPEN, "vault"))[2]).toBe("done");
  });

  it("shows nothing when hidden, and still reports the progress", () => {
    const p = setupProgress({ ...EMPTY, teamMembers: 1 }, hideGuide(OPEN));
    expect(p.mode).toBe("none");
    expect(p.done).toBe(1);
    expect(p.current).toBe("time");
  });

  it("waits for the settings on an empty drive, and stays out of the way on a full one", () => {
    expect(setupProgress({ ...EMPTY, settingsReady: false }, OPEN).mode).toBe(
      "waiting",
    );
    expect(
      setupProgress({ ...EMPTY, settingsReady: false, relationships: 2 }, OPEN)
        .mode,
    ).toBe("none");
  });
});

describe("guide preferences", () => {
  it("has one key per drive", () => {
    expect(guidePrefsKey("abc")).toBe("power-bd:set-up-guide:abc");
    expect(guidePrefsKey("abc")).not.toBe(guidePrefsKey("abd"));
  });

  it("round-trips through text", () => {
    const prefs = hideGuide(skipStep(OPEN, "vault"));
    expect(parseGuidePrefs(serialiseGuidePrefs(prefs))).toEqual(prefs);
  });

  it("falls back to an open guide for missing or broken text", () => {
    for (const text of [null, "", "{", "null", "7", '"x"', "[]"])
      expect(parseGuidePrefs(text)).toEqual(OPEN);
    expect(parseGuidePrefs('{"hidden":"yes","skipped":"vault"}')).toEqual(OPEN);
  });

  it("drops skipped steps it does not know or that cannot be skipped", () => {
    expect(
      parseGuidePrefs('{"hidden":true,"skipped":["vault","team","x",3]}'),
    ).toEqual({ hidden: true, skipped: ["vault"] });
  });

  it("skips only an optional step, once", () => {
    expect(skipStep(OPEN, "team")).toEqual(OPEN);
    const once = skipStep(OPEN, "vault");
    expect(skipStep(once, "vault")).toEqual(once);
    expect(once.skipped).toEqual(["vault"]);
  });

  it("reopens with nothing hidden or skipped", () => {
    expect(reopenGuide()).toEqual(OPEN);
    expect(hideGuide(OPEN).hidden).toBe(true);
  });
});

describe("browserTimeZone", () => {
  const known = ["UTC", "Europe/Zurich"];
  it("keeps a zone the list offers", () => {
    expect(browserTimeZone("Europe/Zurich", known)).toBe("Europe/Zurich");
  });
  it("falls back to UTC for an unknown or missing zone", () => {
    expect(browserTimeZone("Mars/Olympus", known)).toBe("UTC");
    expect(browserTimeZone(undefined, known)).toBe("UTC");
    expect(browserTimeZone("", known)).toBe("UTC");
  });
});

describe("parseAmount", () => {
  it("reads plain and grouped amounts", () => {
    expect(parseAmount("250000")).toBe(250000);
    expect(parseAmount(" 250,000 ")).toBe(250000);
    expect(parseAmount("250 000.50")).toBe(250000.5);
    expect(parseAmount("1'200")).toBe(1200);
  });
  it("gives null for nothing and undefined for what is not an amount", () => {
    expect(parseAmount("  ")).toBeNull();
    expect(parseAmount("250k")).toBeUndefined();
    expect(parseAmount("EUR 20")).toBeUndefined();
    expect(parseAmount("-5")).toBeUndefined();
    expect(parseAmount("1.2.3")).toBeUndefined();
  });
});

describe("missingFields", () => {
  it("names what the first relationship still needs", () => {
    expect(missingFields({ name: " ", owner: "", nextStep: "" })).toEqual({
      name: "Give it a name.",
      owner: "Choose who owns it.",
      nextStep: "Write the next step.",
    });
  });
  it("is empty when everything is there", () => {
    expect(
      missingFields({ name: "Northwind", owner: "0x1", nextStep: "Call" }),
    ).toEqual({});
  });
});

describe("firstRefusal", () => {
  /** A stand-in model: it refuses any action named "bad", and records each one. */
  const reducer = (document: RecordLike, action: string): RecordLike => ({
    operations: {
      ...document.operations,
      global: [
        ...(document.operations.global ?? []),
        action.startsWith("bad") ? { error: `${action} was refused` } : {},
      ],
    },
  });
  const fresh: RecordLike = { operations: { global: [], local: undefined } };

  it("is null when the model takes every action", () => {
    expect(firstRefusal(reducer, fresh, ["a", "b"])).toBeNull();
    expect(firstRefusal(reducer, fresh, [])).toBeNull();
  });
  it("gives the first reason the model refused", () => {
    expect(firstRefusal(reducer, fresh, ["a", "bad one", "bad two"])).toBe(
      "bad one was refused",
    );
  });
  it("leaves the record it was given as it was", () => {
    firstRefusal(reducer, fresh, ["bad"]);
    expect(fresh.operations.global).toEqual([]);
  });
});

describe("vaultDrives", () => {
  const drive = (id: string, name: string, preferredEditor?: string) => ({
    header: { id, meta: preferredEditor ? { preferredEditor } : undefined },
    state: { global: { name } },
  });

  it("lists only the drives opened with the vault app, never this one", () => {
    expect(
      vaultDrives(
        [
          drive("bd", "Power BD", "power-bd"),
          drive("v1", "Knowledge Vault", "knowledge-vault"),
          drive("x", "Workflows"),
          drive("v2", "", "knowledge-vault"),
          drive("me", "Mine", "knowledge-vault"),
        ],
        "me",
      ),
    ).toEqual([
      { id: "v1", name: "Knowledge Vault" },
      { id: "v2", name: "Unnamed vault" },
    ]);
  });

  it("lists nothing when no drive is a vault", () => {
    expect(vaultDrives([drive("x", "Workflows")], "me")).toEqual([]);
    expect(vaultDrives(undefined, "me")).toEqual([]);
  });
});
