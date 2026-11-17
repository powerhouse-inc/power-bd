import { describe, expect, it } from "vitest";
import {
  FOLDER_NAMES,
  SINGLETONS,
  countsByPlace,
  planDriveSetup,
  topFolderId,
  type NodeLike,
} from "./drive-plan.js";

const folder = (
  name: string,
  parentFolder: string | null = null,
): NodeLike => ({
  id: `f-${name}-${parentFolder ?? "root"}`,
  name,
  kind: "folder",
  parentFolder,
});
const file = (
  documentType: string,
  parentFolder: string | null = null,
): NodeLike => ({
  id: `d-${documentType}-${Math.random()}`,
  name: "x",
  kind: "file",
  documentType,
  parentFolder,
});

describe("planDriveSetup", () => {
  it("asks for everything on an empty drive", () => {
    const plan = planDriveSetup([]);
    expect(plan.folders).toEqual([...FOLDER_NAMES]);
    expect(plan.singletons.map((s) => s.documentType)).toEqual(
      SINGLETONS.map((s) => s.documentType),
    );
  });

  it("asks for nothing on a complete drive", () => {
    const nodes = [
      ...FOLDER_NAMES.map((n) => folder(n)),
      ...SINGLETONS.map((s) => file(s.documentType)),
    ];
    expect(planDriveSetup(nodes)).toEqual({ folders: [], singletons: [] });
  });

  it("asks only for what is missing", () => {
    const plan = planDriveSetup([folder("Leads"), file("powerbd/playbook")]);
    expect(plan.folders).not.toContain("Leads");
    expect(plan.folders).toHaveLength(FOLDER_NAMES.length - 1);
    expect(plan.singletons.map((s) => s.documentType)).not.toContain(
      "powerbd/playbook",
    );
    expect(plan.singletons).toHaveLength(SINGLETONS.length - 1);
  });

  it("matches folder names ignoring case and spaces", () => {
    expect(planDriveSetup([folder("  leads ")]).folders).not.toContain("Leads");
  });

  it("ignores a same-named folder that is not at the top", () => {
    expect(planDriveSetup([folder("Leads", "other")]).folders).toContain(
      "Leads",
    );
  });

  it("finds a singleton wherever it sits", () => {
    const plan = planDriveSetup([file("powerbd/settings", "somewhere")]);
    expect(plan.singletons.map((s) => s.documentType)).not.toContain(
      "powerbd/settings",
    );
  });

  it("does not take a file for a folder", () => {
    const f: NodeLike = {
      id: "1",
      name: "Leads",
      kind: "file",
      documentType: "x",
    };
    expect(planDriveSetup([f]).folders).toContain("Leads");
  });
});

describe("countsByPlace", () => {
  it("counts records by their type", () => {
    const counts = countsByPlace(
      [
        file("powerbd/lead"),
        file("powerbd/lead"),
        file("powerbd/opportunity"),
        file("powerbd/decision"),
        file("powerbd/proposal"),
        folder("Leads"),
      ],
      1,
    );
    expect(counts).toEqual({
      leads: 2,
      proposals: 1,
      funding: 1,
      decisions: 1,
    });
  });

  it("shows zero for places with none", () => {
    expect(countsByPlace([])).toEqual({
      leads: 0,
      proposals: 0,
      funding: 0,
      decisions: 0,
    });
  });
});

describe("topFolderId", () => {
  const nodes = [
    { id: "f1", name: " leads ", kind: "folder", parentFolder: null },
    { id: "f2", name: "Leads", kind: "folder", parentFolder: "f1" },
  ];
  it("finds a top-level folder by name in any letter case", () => {
    expect(topFolderId(nodes, "Leads")).toBe("f1");
  });
  it("is undefined when the folder is missing", () => {
    expect(topFolderId(nodes, "Decisions")).toBeUndefined();
  });
});
