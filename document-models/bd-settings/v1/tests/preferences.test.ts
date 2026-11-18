import {
  reducer,
  setDueWindow,
  setRetention,
  setTimeZone,
  setVaultDrive,
  utils, isBdSettingsDocument, setTarget, removeTarget, SetTimeZoneInputSchema, SetDueWindowInputSchema, SetVaultDriveInputSchema, SetRetentionInputSchema, SetTargetInputSchema, RemoveTargetInputSchema } from "document-models/bd-settings/v1";
import { describe, expect, it } from "vitest";

/** The error of each operation, in the order they were dispatched. */
function errors(document: ReturnType<typeof utils.createDocument>) {
  return document.operations.global.map((operation) => operation.error);
}

describe("the drive's preferences", () => {
  it("starts with a 14-day due window, 12 months of retention and nothing else set", () => {
    expect(utils.createDocument().state.global).toStrictEqual({
      teamMembers: [],
      timeZone: null,
      dueWindowDays: 14,
      vaultDriveId: null,
      retentionMonths: 12,
      targets: [],
    });
  });

  it("accepts UTC and IANA names of two or three parts as our time zone", () => {
    let document = utils.createDocument();
    for (const timeZone of [
      "UTC",
      "Europe/Zurich",
      "America/Argentina/Buenos_Aires",
      "Etc/GMT+5",
    ]) {
      document = reducer(document, setTimeZone({ timeZone }));
      expect(document.state.global.timeZone).toBe(timeZone);
    }
    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it("refuses a time zone that is not written as an IANA name", () => {
    let document = reducer(
      utils.createDocument(),
      setTimeZone({ timeZone: "Europe/Zurich" }),
    );
    for (const timeZone of [
      "Zurich",
      "",
      "Europe/",
      "Central European Time",
      "GMT+1",
      "Europe/Zurich/Old/Town",
    ]) {
      document = reducer(document, setTimeZone({ timeZone }));
    }

    expect(errors(document).slice(1)).toStrictEqual([
      '"Zurich" is not a time zone name such as Europe/Zurich',
      '"" is not a time zone name such as Europe/Zurich',
      '"Europe/" is not a time zone name such as Europe/Zurich',
      '"Central European Time" is not a time zone name such as Europe/Zurich',
      '"GMT+1" is not a time zone name such as Europe/Zurich',
      '"Europe/Zurich/Old/Town" is not a time zone name such as Europe/Zurich',
    ]);
    expect(document.state.global.timeZone).toBe("Europe/Zurich");
  });

  it("keeps the due window between 1 and 90 days", () => {
    let document = utils.createDocument();
    for (const days of [1, 90, 0, 91, -7]) {
      document = reducer(document, setDueWindow({ days }));
    }

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      "The due window must be between 1 and 90 days",
      "The due window must be between 1 and 90 days",
      "The due window must be between 1 and 90 days",
    ]);
    expect(document.state.global.dueWindowDays).toBe(90);
  });

  it("records which vault drive links point at, and refuses an empty id", () => {
    let document = reducer(
      utils.createDocument(),
      setVaultDrive({ driveId: "vault-drive-1" }),
    );
    document = reducer(document, setVaultDrive({ driveId: "  " }));

    expect(errors(document)).toStrictEqual([
      undefined,
      "The vault drive needs an id",
    ]);
    expect(document.state.global.vaultDriveId).toBe("vault-drive-1");
  });

  it("keeps personal data for at least one month", () => {
    let document = utils.createDocument();
    for (const months of [1, 24, 0]) {
      document = reducer(document, setRetention({ months }));
    }

    expect(errors(document)).toStrictEqual([
      undefined,
      undefined,
      "The retention period must be at least one month",
    ]);
    expect(document.state.global.retentionMonths).toBe(24);
  });
});

const lastError = (doc: ReturnType<typeof utils.createDocument>) => doc.operations.global.at(-1)?.error;

describe("targets", () => {
  it("sets a target per quarter and measure, changing one already set and keeping its id", () => {
    let doc = reducer(utils.createDocument(), setTarget({ id: "t1", quarter: "2026-Q4", metric: "MEETINGS_HELD", value: 20 }));
    doc = reducer(doc, setTarget({ id: "t2", quarter: "2026-Q4", metric: "VALUE_PROPOSED", value: 150000 }));
    doc = reducer(doc, setTarget({ id: "t3", quarter: "2026-Q4", metric: "MEETINGS_HELD", value: 25 }));
    expect(lastError(doc)).toBeUndefined();
    expect(isBdSettingsDocument(doc)).toBe(true);
    expect(doc.state.global.targets).toEqual([
      { id: "t1", quarter: "2026-Q4", metric: "MEETINGS_HELD", value: 25 },
      { id: "t2", quarter: "2026-Q4", metric: "VALUE_PROPOSED", value: 150000 },
    ]);
  });

  it("refuses a quarter not written like 2026-Q4, a negative target and an unknown measure", () => {
    const base = { id: "t1", metric: "LEADS_WON" as const, value: 3 };
    expect(lastError(reducer(utils.createDocument(), setTarget({ ...base, quarter: "Q4 2026" })))).toBe("A quarter is written like 2026-Q4");
    expect(lastError(reducer(utils.createDocument(), setTarget({ ...base, quarter: "2026-Q5" })))).toBe("A quarter is written like 2026-Q4");
    expect(lastError(reducer(utils.createDocument(), setTarget({ ...base, quarter: "2026-Q1", value: -1 })))).toBe("A target can't be negative");
    expect(SetTargetInputSchema().safeParse({ ...base, quarter: "2026-Q1", metric: "CALLS" }).success).toBe(false);
  });

  it("removes a target, and refuses one that is not there", () => {
    let doc = reducer(utils.createDocument(), setTarget({ id: "t1", quarter: "2026-Q4", metric: "PROPOSALS_SENT", value: 4 }));
    doc = reducer(doc, removeTarget({ id: "t1" }));
    expect(doc.state.global.targets).toEqual([]);
    doc = reducer(doc, removeTarget({ id: "t1" }));
    expect(lastError(doc)).toBe("Target t1 not found");
    expect(RemoveTargetInputSchema().safeParse({}).success).toBe(false);
  });

  it("copes with settings stored before targets existed", () => {
    // A document saved before targets existed: replaying its operations gives a state without the list.
    const stored = () => {
      const doc = utils.createDocument();
      delete (doc.state.global as { targets?: unknown }).targets;
      return doc;
    };
    // The app finds a drive's settings with this check: an older record must still pass it.
    expect(isBdSettingsDocument(stored())).toBe(true);
    const removed = reducer(stored(), removeTarget({ id: "t1" }));
    expect(lastError(removed)).toBe("Target t1 not found");
    const set = reducer(stored(), setTarget({ id: "t1", quarter: "2027-Q1", metric: "LEADS_WON", value: 2 }));
    expect(set.state.global.targets).toEqual([{ id: "t1", quarter: "2027-Q1", metric: "LEADS_WON", value: 2 }]);
  });

  it("checks the inputs of the older preferences too", () => {
    expect(SetTimeZoneInputSchema().safeParse({ timeZone: "Europe/Ljubljana" }).success).toBe(true);
    expect(SetDueWindowInputSchema().safeParse({ days: 14 }).success).toBe(true);
    expect(SetVaultDriveInputSchema().safeParse({}).success).toBe(false);
    expect(SetRetentionInputSchema().safeParse({ months: 12 }).success).toBe(true);
  });
});
