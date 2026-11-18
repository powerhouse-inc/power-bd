import { describe, expect, it } from "vitest";
import { routeVaultCall } from "./vault-drive.js";

const VAULT = "vault-drive-1";
const BD = "bd-drive-1";

describe("routeVaultCall", () => {
  it("reads the vault named in Settings when the call names no drive", () => {
    expect(
      routeVaultCall({ query: "attempt limit" }, { vaultDriveId: VAULT, bdDriveId: BD }),
    ).toEqual({ args: { query: "attempt limit", driveId: VAULT } });
  });
});

describe("routeVaultCall: a drive named in the call", () => {
  it("keeps another vault the call names", () => {
    expect(
      routeVaultCall({ query: "x", driveId: "vault-2" }, { vaultDriveId: VAULT, bdDriveId: BD }),
    ).toEqual({ args: { query: "x", driveId: "vault-2" } });
  });

  it("refuses the BD space, which is not a vault, and says what to use", () => {
    const route = routeVaultCall({ query: "x", driveId: BD }, { vaultDriveId: VAULT, bdDriveId: BD });
    expect("refusal" in route ? route.refusal : "").toContain("getDocument");
  });
});

describe("routeVaultCall: no vault in Settings", () => {
  it.each([null, undefined, ""])("refuses a call that names no drive (%s) and says where to name one", (vaultDriveId) => {
    const route = routeVaultCall({ query: "x" }, { vaultDriveId, bdDriveId: BD });
    expect("refusal" in route ? route.refusal : "").toContain("Settings");
  });

  it("still reads a vault the call names", () => {
    expect(
      routeVaultCall({ driveId: "vault-2" }, { vaultDriveId: null, bdDriveId: BD }),
    ).toEqual({ args: { driveId: "vault-2" } });
  });
});

describe("routeVaultCall: history of the BD space", () => {
  it("points a history call on the BD space at Power BD's own history tools", () => {
    const route = routeVaultCall({ documentId: BD, driveId: BD }, { vaultDriveId: VAULT, bdDriveId: BD });
    const refusal = "refusal" in route ? route.refusal : "";
    expect(refusal).toContain("getRecentChanges");
    expect(refusal).toContain("getRecordHistory");
  });
});
