import type { Action, PHDocument } from "document-model";
import { describe, expect, it, vi } from "vitest";
import { createLiveDrive, rejectedActions, type DriveSource } from "./live-drive.js";

type Node = { id: string; name: string; kind: string; parentFolder?: string | null; documentType?: string };

const doc = (id: string, rev: number, extra: Partial<{ nodes: Node[]; ops: unknown[] }> = {}) =>
  ({
    header: { id, name: id, documentType: extra.nodes ? "powerhouse/document-drive" : "powerbd/lead", revision: { global: rev } },
    state: { global: extra.nodes ? { nodes: extra.nodes } : { name: id } },
    operations: { global: extra.ops ?? [] },
  }) as unknown as PHDocument;

const file = (id: string, parentFolder: string | null = "f1"): Node => ({ id, name: id, kind: "file", parentFolder, documentType: "powerbd/lead" });
const FOLDER: Node = { id: "f1", name: "Leads", kind: "folder", parentFolder: null };

function server(nodes: Node[], records: Record<string, number>) {
  const state = { drive: doc("drive", 1, { nodes }), records: { ...records } };
  const source: DriveSource = {
    getDrive: vi.fn(() => Promise.resolve(state.drive)),
    getMany: vi.fn((ids: readonly string[]) =>
      Promise.resolve(ids.filter((id) => id in state.records).map((id) => doc(id, state.records[id]))),
    ),
    execute: vi.fn((id: string) => Promise.resolve(doc(id, 9))),
  };
  return { state, source };
}

describe("a drive's live copy", () => {
  it("reads the tree and every record, in the tree's order", async () => {
    const { source } = server([FOLDER, file("b"), file("a")], { a: 1, b: 1 });
    const live = createLiveDrive("drive", source);
    expect(live.getSnapshot().status).toBe("loading");
    await live.refresh();
    const s = live.getSnapshot();
    expect(s.status).toBe("ready");
    expect(s.nodes?.map((n) => n.id)).toEqual(["f1", "b", "a"]);
    expect(s.documents?.map((d) => d.header.id)).toEqual(["b", "a"]);
  });

  it("leaves out a record the server will not hand over", async () => {
    const { source } = server([file("a"), file("gone")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    expect(live.getSnapshot().documents?.map((d) => d.header.id)).toEqual(["a"]);
  });

  it("says why the first read failed", async () => {
    const { source } = server([], {});
    (source.getDrive as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Forbidden"));
    const live = createLiveDrive("drive", source);
    await live.refresh();
    expect(live.getSnapshot()).toMatchObject({ status: "failed", error: "Forbidden" });
  });

  it("keeps what it showed when a later read fails", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    (source.getDrive as ReturnType<typeof vi.fn>).mockRejectedValueOnce("offline");
    await live.refresh();
    expect(live.getSnapshot()).toMatchObject({ status: "ready", error: "offline" });
    expect(live.getSnapshot().documents).toHaveLength(1);
  });

  it("runs a refresh asked for during one after it, once", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    const first = live.refresh();
    void live.refresh();
    void live.refresh();
    await first;
    await vi.waitFor(() => expect(source.getDrive).toHaveBeenCalledTimes(2));
  });

  it("takes in a newer record the server announced, and ignores older and foreign ones", async () => {
    const { source } = server([file("a")], { a: 2 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    const listener = vi.fn();
    live.subscribe(listener);
    await live.change({ type: "UPDATED", documents: [doc("a", 3)] });
    expect(live.getSnapshot().byId.get("a")?.header.revision).toEqual({ global: 3 });
    await live.change({ type: "UPDATED", documents: [doc("a", 1), doc("elsewhere", 5)] });
    expect(live.getSnapshot().byId.get("a")?.header.revision).toEqual({ global: 3 });
    expect(live.getSnapshot().byId.has("elsewhere")).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("reads only the new record when the tree it was sent gains one, and drops a removed one", async () => {
    const { state, source } = server([file("a"), file("b")], { a: 1, b: 1, c: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    (source.getMany as ReturnType<typeof vi.fn>).mockClear();
    state.drive = doc("drive", 2, { nodes: [file("a"), file("c")] });
    await live.change({ type: "UPDATED", documents: [state.drive] });
    expect(source.getMany).toHaveBeenCalledWith(["c"]);
    expect(live.getSnapshot().documents?.map((d) => d.header.id)).toEqual(["a", "c"]);
  });

  it("ignores a tree older than the one it holds", async () => {
    const { state, source } = server([file("a")], { a: 1 });
    state.drive = doc("drive", 5, { nodes: [file("a")] });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    await live.change({ type: "UPDATED", documents: [doc("drive", 4, { nodes: [] })] });
    expect(live.getSnapshot().nodes).toHaveLength(1);
  });

  it("drops a deleted record", async () => {
    const { source } = server([file("a"), file("b")], { a: 1, b: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    await live.change({ type: "DELETED", documents: [doc("b", 2), doc("unrelated", 1)] });
    expect(live.getSnapshot().documents?.map((d) => d.header.id)).toEqual(["a"]);
    await live.change({ type: "DELETED", documents: [doc("unrelated", 1)] });
    expect(live.getSnapshot().documents?.map((d) => d.header.id)).toEqual(["a"]);
  });

  it("re-reads the tree on a structural change that did not carry it", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    await live.change({ type: "CHILD_ADDED", documents: [], parentId: "drive" });
    expect(source.getDrive).toHaveBeenCalledTimes(2);
    await live.change({ type: "CHILD_ADDED", documents: [], parentId: "another-drive" });
    expect(source.getDrive).toHaveBeenCalledTimes(2);
  });

  it("notes a failure to read the records a new tree lists", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    (source.getMany as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("timeout"));
    await live.change({ type: "UPDATED", documents: [doc("drive", 2, { nodes: [file("a"), file("n")] })] });
    expect(live.getSnapshot().error).toBe("timeout");
  });

  it("takes a write's result in at once and reports what was rejected", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    const action = { id: "act-1", type: "SET_NAME", input: {}, scope: "global" } as unknown as Action;
    (source.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      doc("a", 2, { ops: [{ index: 1, error: "Name required", action: { id: "act-1", type: "SET_NAME" } }] }),
    );
    const { rejected } = await live.write("a", [action]);
    expect(rejected[0]).toMatchObject({ message: "Name required", documentId: "a", actionId: "act-1", scope: "global", kind: "reducer-error" });
    expect(live.getSnapshot().byId.get("a")?.header.revision).toEqual({ global: 2 });
  });

  it("takes a write to the drive in as the new tree", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    (source.execute as ReturnType<typeof vi.fn>).mockResolvedValueOnce(doc("drive", 2, { nodes: [FOLDER, file("a")] }));
    await live.write("drive", []);
    expect(live.getSnapshot().nodes?.map((n) => n.id)).toEqual(["f1", "a"]);
  });

  it("re-reads only the tree and the records it newly lists", async () => {
    const { state, source } = server([file("a")], { a: 1, b: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    (source.getMany as ReturnType<typeof vi.fn>).mockClear();
    state.drive = doc("drive", 2, { nodes: [file("a"), file("b")] });
    await live.syncTree();
    expect(source.getMany).toHaveBeenCalledWith(["b"]);
    expect(live.getSnapshot().documents?.map((d) => d.header.id)).toEqual(["a", "b"]);
  });

  it("knows which documents are this drive's", async () => {
    const { source } = server([file("a"), file("listed-only")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    expect([live.holds("drive"), live.holds("a"), live.holds("listed-only"), live.holds("x")]).toEqual([true, true, true, false]);
  });

  it("handles changes and questions that come before the first read", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.change({ type: "UPDATED", documents: [doc("a", 2)] });
    await live.change({ type: "DELETED", documents: [doc("a", 2)] });
    expect(live.holds("a")).toBe(false);
    expect(live.getSnapshot().status).toBe("loading");
  });

  it("reads a drive whose state has no tree as empty", async () => {
    const { state, source } = server([], {});
    state.drive = { header: { id: "drive", revision: { global: 1 } }, state: { global: {} } } as unknown as PHDocument;
    const live = createLiveDrive("drive", source);
    await live.refresh();
    expect(live.getSnapshot()).toMatchObject({ status: "ready", nodes: [], documents: [] });
  });

  it("compares documents that carry no revision as new", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    const bare = { header: { id: "a" }, state: { global: {} } } as unknown as PHDocument;
    await live.change({ type: "UPDATED", documents: [bare] });
    expect(live.getSnapshot().byId.get("a")?.header.revision).toEqual({ global: 1 });
    const partial = { header: { id: "a", revision: { global: 4, local: undefined } }, state: { global: {} } } as unknown as PHDocument;
    await live.change({ type: "UPDATED", documents: [partial] });
    expect(live.getSnapshot().byId.get("a")?.header.revision).toEqual({ global: 4, local: undefined });
  });

  it("keeps a newer record that arrived while an older copy was being fetched", async () => {
    const { state, source } = server([file("a"), file("b")], { a: 1 });
    const live = createLiveDrive("drive", source);
    await live.refresh();
    expect(live.getSnapshot().byId.has("b")).toBe(false);
    let release: () => void = () => undefined;
    (source.getMany as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (ids: readonly string[]) =>
        new Promise((resolve) => {
          release = () => resolve(ids.map((id) => doc(id, 1)));
        }),
    );
    state.drive = doc("drive", 2, { nodes: [file("a"), file("b"), file("c")] });
    const taking = live.change({ type: "UPDATED", documents: [state.drive] });
    await live.change({ type: "UPDATED", documents: [doc("b", 5)] });
    release();
    await taking;
    expect(live.getSnapshot().byId.get("b")?.header.revision).toEqual({ global: 5 });
    expect(live.getSnapshot().byId.has("c")).toBe(true);
  });

  it("stops telling a listener that unsubscribed", async () => {
    const { source } = server([file("a")], { a: 1 });
    const live = createLiveDrive("drive", source);
    const listener = vi.fn();
    const stop = live.subscribe(listener);
    stop();
    await live.refresh();
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("rejectedActions", () => {
  it("names only the asked actions that carry an error", () => {
    const d = doc("a", 3, {
      ops: [
        { index: 0, action: { id: "mine-ok", type: "A" } },
        { index: 1, error: "nope", action: { id: "mine-bad", type: "B" } },
        { index: 2, error: "other", action: { id: "not-mine", type: "C" } },
      ],
    });
    const asked = [{ id: "mine-ok" }, { id: "mine-bad" }] as unknown as Action[];
    expect(rejectedActions(d, asked).map((e) => e.actionId)).toEqual(["mine-bad"]);
  });

  it("skips a scope whose operations are missing", () => {
    const d = { header: { id: "a" }, operations: { global: null, local: [{ index: 0, error: "x", action: { id: "q", type: "Q" } }] } } as unknown as PHDocument;
    expect(rejectedActions(d, [{ id: "q" }] as unknown as Action[]).map((e) => e.scope)).toEqual(["local"]);
  });

  it("reads a document without operations as nothing rejected", () => {
    const d = { header: { id: "a" } } as unknown as PHDocument;
    expect(rejectedActions(d, [])).toEqual([]);
  });
});
