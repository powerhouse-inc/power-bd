import {
  reducer,
  setDueWindow,
  setRetention,
  setTimeZone,
  setVaultDrive,
  utils,
} from "document-models/bd-settings/v1";
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
