import {
  LEVELS,
  LEVEL_WORDS,
  gateVerdict,
  isLastManager,
  probeVerdict,
  readAddress,
  readAnswer,
  rosterRows,
  shortAddress,
  mayChange,
  standingOf,
} from "./access.js";

const ME = "0xadba7c2f82139031d7564d18ac22d09b12a0bca4";
const PEER = "0xced9eb080b780e78fc91d24dfb8c5fd1317c8951";
const grant = (userAddress: string, permission: "READ" | "WRITE" | "ADMIN", grantedBy = ME) => ({
  documentId: "drive-1",
  userAddress,
  permission,
  grantedBy,
  createdAt: "2026-11-17T12:20:00.000Z",
});

describe("levels", () => {
  it("are View, Edit and Manage, each saying what it allows", () => {
    expect(LEVELS).toEqual(["READ", "WRITE", "ADMIN"]);
    expect(LEVELS.map((l) => LEVEL_WORDS[l].label)).toEqual(["View", "Edit", "Manage"]);
    for (const l of LEVELS) expect(LEVEL_WORDS[l].meaning).toMatch(/\.$/);
  });
});

describe("readAddress", () => {
  it("takes a wallet address however it was typed, and keeps it in lower case", () => {
    expect(readAddress("  0xCED9eb080B780E78FC91d24Dfb8C5fD1317c8951 ")).toEqual({ address: PEER });
  });

  it("asks for one when nothing was typed", () => {
    expect(readAddress("   ")).toEqual({ problem: "Type a wallet address." });
  });

  it("says what a wallet address looks like when it is not one", () => {
    for (const typed of ["0x123", "ced9eb080b780e78fc91d24dfb8c5fd1317c8951", "0xZZd9eb080b780e78fc91d24dfb8c5fd1317c8951", "jonas@example.org"])
      expect(readAddress(typed)).toEqual({
        problem: "A wallet address starts with 0x, followed by 40 letters a–f and digits.",
      });
  });
});

describe("shortAddress", () => {
  it("keeps the start and the end", () => {
    expect(shortAddress(PEER)).toBe("0xced9…8951");
  });
});

describe("rosterRows", () => {
  it("lists Manage, then Edit, then View, and marks you", () => {
    const rows = rosterRows([grant(PEER, "WRITE"), grant("0x" + "1".repeat(40), "READ"), grant(ME, "ADMIN")], ME);
    expect(rows.map((r) => [r.short, r.label, r.isYou])).toEqual([
      ["0xadba…bca4", "Manage", true],
      ["0xced9…8951", "Edit", false],
      ["0x1111…1111", "View", false],
    ]);
    expect(rows[1]).toMatchObject({ address: PEER, level: "WRITE", grantedBy: "you", grantedAt: "2026-11-17T12:20:00.000Z" });
  });

  it("compares addresses whatever their case, and names who granted by address when it was not you", () => {
    const [row] = rosterRows([grant(PEER.toUpperCase().replace("0X", "0x"), "READ", ME)], PEER);
    expect(row).toMatchObject({ isYou: true, grantedBy: "0xadba…bca4" });
    expect(rosterRows([grant(PEER, "READ", PEER)], undefined)[0]).toMatchObject({ isYou: false, grantedBy: "0xced9…8951" });
  });
});

describe("rosterRows: the same level", () => {
  it("orders people of one level by address", () => {
    const rows = rosterRows([grant(PEER, "WRITE"), grant(ME, "WRITE")], undefined);
    expect(rows.map((r) => r.short)).toEqual(["0xadba…bca4", "0xced9…8951"]);
  });
});

describe("readAnswer", () => {
  it("passes the data on", () => {
    expect(readAnswer(200, { data: { documentAccess: [] } })).toEqual({ data: { documentAccess: [] } });
  });

  it("calls a refusal a refusal", () => {
    expect(readAnswer(200, { errors: [{ message: "Forbidden: insufficient permissions", extensions: { code: "FORBIDDEN" } }] })).toEqual({
      error: "Forbidden: insufficient permissions",
      forbidden: true,
    });
    expect(readAnswer(401, null)).toEqual({ error: "Not signed in, or the session has ended.", forbidden: true });
  });

  it("reports any other failure as itself", () => {
    expect(readAnswer(404, null)).toEqual({ error: "The server answered HTTP 404." });
    expect(readAnswer(200, { errors: [{ message: "Unknown field" }] })).toEqual({ error: "Unknown field", forbidden: false });
    expect(readAnswer(200, { errors: [{}] })).toEqual({ error: "The server refused without saying why.", forbidden: false });
    expect(readAnswer(200, null)).toEqual({ data: undefined });
  });
});

describe("probeVerdict", () => {
  it("allows a reader the drive answered for", () => {
    expect(probeVerdict(200, { data: { document: { document: { id: "drive-1" } } } })).toEqual({ kind: "allowed" });
  });

  it("asks for sign-in when the server wants to know who is asking", () => {
    expect(probeVerdict(401, null)).toEqual({ kind: "anonymous" });
    expect(probeVerdict(200, { errors: [{ message: "x", extensions: { code: "UNAUTHENTICATED" } }] })).toEqual({ kind: "anonymous" });
  });

  it("tells a refusal apart from a server that cannot answer", () => {
    expect(probeVerdict(200, { errors: [{ message: "Forbidden", extensions: { code: "FORBIDDEN" } }] })).toEqual({ kind: "unauthorized" });
    expect(probeVerdict(502, null)).toEqual({ kind: "unreachable", detail: "The server answered HTTP 502." });
    expect(probeVerdict(200, { errors: [{ message: "Boom" }] })).toEqual({ kind: "unreachable", detail: "Boom" });
    expect(probeVerdict(200, { errors: [{}] })).toEqual({ kind: "unreachable", detail: "The server refused without saying why." });
    expect(probeVerdict(200, { data: { document: null } })).toEqual({ kind: "unreachable", detail: "The space was not found on this server." });
    expect(probeVerdict(200, null)).toEqual({ kind: "unreachable", detail: "The space was not found on this server." });
  });
});

describe("gateVerdict", () => {
  it("lets an allowed reader in, and leaves a server it cannot reach to the app", () => {
    expect(gateVerdict({ kind: "allowed" }, ME)).toEqual({ kind: "allowed" });
    expect(gateVerdict({ kind: "unreachable", detail: "down" }, ME)).toEqual({ kind: "unreachable", detail: "down" });
  });

  it("asks someone who is not signed in to sign in, whatever the server said", () => {
    expect(gateVerdict({ kind: "unauthorized" }, undefined)).toEqual({ kind: "anonymous" });
    expect(gateVerdict({ kind: "anonymous" }, undefined)).toEqual({ kind: "anonymous" });
  });

  it("shows a signed-in person refused their own address to send an admin", () => {
    expect(gateVerdict({ kind: "unauthorized" }, ME)).toEqual({ kind: "unauthorized", address: ME });
    expect(gateVerdict({ kind: "anonymous" }, ME)).toEqual({ kind: "unauthorized", address: ME });
  });
});

describe("standingOf", () => {
  it("counts an answer as admin, a refusal as a member, and anything else as access control off", () => {
    expect(standingOf({ data: { documentAccess: {} } })).toBe("admin");
    expect(standingOf({ error: "Forbidden", forbidden: true })).toBe("member");
    expect(standingOf({ error: "The server answered HTTP 404." })).toBe("off");
  });
});

describe("isLastManager", () => {
  it("guards the only person who can manage access, so the space is never left without one", () => {
    const rows = rosterRows([grant(ME, "ADMIN"), grant(PEER, "WRITE")], ME);
    expect(isLastManager(rows, ME)).toBe(true);
    expect(isLastManager(rows, PEER)).toBe(false);
  });

  it("lets one of two managers go", () => {
    const rows = rosterRows([grant(ME, "ADMIN"), grant(PEER, "ADMIN")], ME);
    expect(isLastManager(rows, ME)).toBe(false);
    expect(isLastManager(rows, PEER.toUpperCase().replace("0X", "0x"))).toBe(false);
  });
});

describe("mayChange", () => {
  it("reads the server's yes and no", () => {
    expect(mayChange({ data: { canExecuteOperation: true } })).toBe(true);
    expect(mayChange({ data: { canExecuteOperation: false } })).toBe(false);
  });

  it("does not guess when the server did not say", () => {
    expect(mayChange({ error: "The server answered HTTP 500." })).toBeUndefined();
    expect(mayChange({ data: {} })).toBeUndefined();
    expect(mayChange({ data: { canExecuteOperation: "yes" } })).toBeUndefined();
  });
});

