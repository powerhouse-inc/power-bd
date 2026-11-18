import { describe, expect, it, vi } from "vitest";
import { FOLDER_NAMES, SINGLETONS, type NodeLike } from "./drive-plan.js";
import { APP_ICON_URL } from "./app-icon.js";
import { setUpDrive, type SetupDeps } from "./init-drive.js";

const COMPLETE: NodeLike[] = [
  ...FOLDER_NAMES.map((n) => ({ id: n, name: n, kind: "folder", parentFolder: null })),
  ...SINGLETONS.map((s) => ({ id: s.name, name: s.name, kind: "file", documentType: s.documentType })),
];

/** A drive's home (its server, or this browser) that the set-up writes back to. */
function fakeHome(initial: NodeLike[] = [], icon: string | null = null) {
  const nodes = [...initial];
  const deps: SetupDeps = {
    loadDrive: vi.fn(() => Promise.resolve({ nodes: [...nodes], icon })),
    addFolders: vi.fn((names: readonly string[]) => {
      for (const name of names) nodes.push({ id: name, name, kind: "folder", parentFolder: null });
      return Promise.resolve();
    }),
    addDocument: vi.fn((name: string, documentType: string) => {
      nodes.push({ id: name, name, kind: "file", documentType });
      return Promise.resolve();
    }),
  };
  return { nodes, deps };
}

describe("setUpDrive", () => {
  it("creates what is missing on a fresh drive, the folders in one change", async () => {
    const { deps } = fakeHome();
    const made = await setUpDrive("drive-a", deps);
    expect(made).toBe(FOLDER_NAMES.length + SINGLETONS.length);
    expect(deps.addFolders).toHaveBeenCalledTimes(1);
    expect(deps.addFolders).toHaveBeenCalledWith([...FOLDER_NAMES]);
    expect(deps.addDocument).toHaveBeenCalledTimes(SINGLETONS.length);
  });

  it("creates nothing the second time", async () => {
    const { deps } = fakeHome();
    await setUpDrive("drive-b", deps);
    const again = await setUpDrive("drive-b", deps);
    expect(again).toBe(0);
    expect(deps.addFolders).toHaveBeenCalledTimes(1);
  });

  it("shares one run between simultaneous calls", async () => {
    const { deps } = fakeHome();
    const [a, b] = await Promise.all([setUpDrive("drive-c", deps), setUpDrive("drive-c", deps)]);
    expect(a).toBe(b);
    expect(deps.addFolders).toHaveBeenCalledTimes(1);
  });

  it("makes nothing on a member's first visit to a drive that is already set up", async () => {
    // The member's own copy is still empty, but the set-up asks the drive's home.
    const { deps } = fakeHome(COMPLETE);
    expect(await setUpDrive("drive-d", deps)).toBe(0);
    expect(deps.loadDrive).toHaveBeenCalledTimes(1);
    expect(deps.addFolders).not.toHaveBeenCalled();
    expect(deps.addDocument).not.toHaveBeenCalled();
  });

  it("adds only the folder a partly set-up drive lacks", async () => {
    const { deps } = fakeHome(COMPLETE.filter((n) => n.name !== "Decisions"));
    expect(await setUpDrive("drive-d2", deps)).toBe(1);
    expect(deps.addFolders).toHaveBeenCalledWith(["Decisions"]);
    expect(deps.addDocument).not.toHaveBeenCalled();
  });

  it("makes nothing when the drive's home can't be read", async () => {
    const { deps } = fakeHome();
    (deps.loadDrive as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Forbidden"));
    await expect(setUpDrive("drive-d3", deps)).rejects.toThrow("Forbidden");
    expect(deps.addFolders).not.toHaveBeenCalled();
    expect(deps.addDocument).not.toHaveBeenCalled();
  });

  it("allows a retry after a failure", async () => {
    const { deps } = fakeHome();
    (deps.addFolders as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("offline"));
    await expect(setUpDrive("drive-e", deps)).rejects.toThrow("offline");
    await expect(setUpDrive("drive-e", deps)).resolves.toBeGreaterThan(0);
  });
});

describe("the drive's icon", () => {
  it("gives a drive without an icon the app's icon", async () => {
    const { deps } = fakeHome();
    const setIcon = vi.fn(() => Promise.resolve());
    await setUpDrive("drive-icon-a", { ...deps, setIcon });
    expect(setIcon).toHaveBeenCalledTimes(1);
    expect(setIcon).toHaveBeenCalledWith(APP_ICON_URL);
  });

  it("leaves an icon the drive's home already has", async () => {
    const { deps } = fakeHome(COMPLETE, "https://example.org/team-logo.png");
    const setIcon = vi.fn(() => Promise.resolve());
    await setUpDrive("drive-icon-b", { ...deps, setIcon });
    expect(setIcon).not.toHaveBeenCalled();
  });

  it("still sets up the drive when the icon is refused", async () => {
    const { deps } = fakeHome();
    const made = await setUpDrive("drive-icon-c", {
      ...deps,
      setIcon: () => Promise.reject(new Error("Forbidden")),
    });
    expect(made).toBe(FOLDER_NAMES.length + SINGLETONS.length);
  });
});
