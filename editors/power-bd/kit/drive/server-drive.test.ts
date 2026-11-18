import { describe, expect, it } from "vitest";
import { serverDriveFrom } from "./server-drive.js";

const reply = (state: unknown) => ({ data: { document: { document: { state } } } });

describe("serverDriveFrom", () => {
  it("reads the tree and the icon", () => {
    const read = serverDriveFrom(
      200,
      reply({
        global: {
          icon: "https://example.org/icon.svg",
          nodes: [
            { id: "f1", name: "Leads", kind: "folder", parentFolder: null },
            { id: "d1", name: "Settings", kind: "file", documentType: "powerbd/settings", parentFolder: null },
            { id: "d2", name: "Northwind", kind: "file", documentType: "powerbd/lead", parentFolder: "f1" },
          ],
        },
      }),
    );
    expect(read).toEqual({
      drive: {
        icon: "https://example.org/icon.svg",
        nodes: [
          { id: "f1", name: "Leads", kind: "folder", parentFolder: null },
          { id: "d1", name: "Settings", kind: "file", documentType: "powerbd/settings", parentFolder: null },
          { id: "d2", name: "Northwind", kind: "file", documentType: "powerbd/lead", parentFolder: "f1" },
        ],
      },
    });
  });

  it("skips entries that are not nodes and reads a missing icon as none", () => {
    const read = serverDriveFrom(
      200,
      reply({ global: { nodes: [null, "x", { id: 3 }, { id: "f1", name: "Leads", kind: "folder" }] } }),
    );
    expect(read).toEqual({
      drive: { icon: null, nodes: [{ id: "f1", name: "Leads", kind: "folder", parentFolder: null }] },
    });
  });

  it("says why when the server refuses", () => {
    const read = serverDriveFrom(200, {
      data: { document: null },
      errors: [{ message: "Forbidden: insufficient permissions", extensions: { code: "FORBIDDEN" } }],
    });
    expect(read).toEqual({ problem: "Forbidden: insufficient permissions" });
  });

  it("says why when signed out", () => {
    expect(serverDriveFrom(401, null)).toEqual({ problem: "Not signed in, or the session has ended." });
  });

  it("refuses an answer without the drive's contents", () => {
    expect(serverDriveFrom(200, { data: { document: null } })).toEqual({
      problem: "The server did not hand over the drive's contents.",
    });
    expect(serverDriveFrom(200, reply({ global: {} }))).toEqual({
      problem: "The server did not hand over the drive's contents.",
    });
  });
});
