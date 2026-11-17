import { describe, expect, it, vi } from "vitest";
import { FOLDER_NAMES, SINGLETONS, type NodeLike } from "./drive-plan.js";
import { APP_ICON_URL } from "./app-icon.js";
import { setUpDrive, type SetupDeps } from "./init-drive.js";

function fakeDrive(initial: NodeLike[] = []) {
  const nodes = [...initial];
  const deps: SetupDeps = {
    loadNodes: vi.fn(() => Promise.resolve([...nodes])),
    addFolder: vi.fn((name: string) => {
      nodes.push({ id: name, name, kind: "folder", parentFolder: null });
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
  it("creates what is missing on a fresh drive", async () => {
    const { deps } = fakeDrive();
    const made = await setUpDrive("drive-a", deps);
    expect(made).toBe(FOLDER_NAMES.length + SINGLETONS.length);
    expect(deps.addFolder).toHaveBeenCalledTimes(FOLDER_NAMES.length);
    expect(deps.addDocument).toHaveBeenCalledTimes(SINGLETONS.length);
  });

  it("creates nothing the second time", async () => {
    const { deps } = fakeDrive();
    await setUpDrive("drive-b", deps);
    const again = await setUpDrive("drive-b", deps);
    expect(again).toBe(0);
    expect(deps.addFolder).toHaveBeenCalledTimes(FOLDER_NAMES.length);
  });

  it("shares one run between simultaneous calls", async () => {
    const { deps } = fakeDrive();
    const [a, b] = await Promise.all([
      setUpDrive("drive-c", deps),
      setUpDrive("drive-c", deps),
    ]);
    expect(a).toBe(b);
    expect(deps.addFolder).toHaveBeenCalledTimes(FOLDER_NAMES.length);
  });

  it("reads the server's tree, not a local copy, before each run", async () => {
    const { deps } = fakeDrive([
      ...FOLDER_NAMES.map((n) => ({
        id: n,
        name: n,
        kind: "folder",
        parentFolder: null,
      })),
      ...SINGLETONS.map((s) => ({
        id: s.name,
        name: s.name,
        kind: "file",
        documentType: s.documentType,
      })),
    ]);
    expect(await setUpDrive("drive-d", deps)).toBe(0);
    expect(deps.loadNodes).toHaveBeenCalledTimes(1);
  });

  it("allows a retry after a failure", async () => {
    const { deps } = fakeDrive();
    (deps.addFolder as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("offline"),
    );
    await expect(setUpDrive("drive-e", deps)).rejects.toThrow("offline");
    await expect(setUpDrive("drive-e", deps)).resolves.toBeGreaterThan(0);
  });
});

describe("the drive's icon", () => {
  it("gives a drive without an icon the app's icon", async () => {
    const { deps } = fakeDrive();
    const setIcon = vi.fn(() => Promise.resolve());
    await setUpDrive("drive-icon-a", {
      ...deps,
      icon: { current: null, set: setIcon },
    });
    expect(setIcon).toHaveBeenCalledTimes(1);
    expect(setIcon).toHaveBeenCalledWith(APP_ICON_URL);
  });

  it("leaves an icon the drive already has", async () => {
    const { deps } = fakeDrive();
    const setIcon = vi.fn(() => Promise.resolve());
    await setUpDrive("drive-icon-b", {
      ...deps,
      icon: { current: "https://example.org/team-logo.png", set: setIcon },
    });
    expect(setIcon).not.toHaveBeenCalled();
  });

  it("still sets up the drive when the icon is refused", async () => {
    const { deps } = fakeDrive();
    const made = await setUpDrive("drive-icon-c", {
      ...deps,
      icon: {
        current: null,
        set: () => Promise.reject(new Error("Forbidden")),
      },
    });
    expect(made).toBe(FOLDER_NAMES.length + SINGLETONS.length);
  });
});
