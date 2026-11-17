import type { LookupResult } from "./client.js";
import type { NoteInfo } from "./model.js";
import { FRESH_MS, STORE_BATCH, createNoteStore } from "./store.js";

const info = (id: string, title = `Note ${id}`): NoteInfo => ({
  id,
  title,
  description: null,
  kind: "Reference",
  icon: "note",
});
const found = (id: string, title?: string): LookupResult => ({
  ok: true,
  note: info(id, title),
});

/** A store whose clock, batching and lookups the test drives. */
function harness(
  answer: (
    driveId: string,
    ids: readonly string[],
  ) => Promise<ReadonlyMap<string, LookupResult>> = (_d, ids) =>
    Promise.resolve(new Map(ids.map((id) => [id, found(id)]))),
) {
  const clock = { now: 1_000 };
  const queued: (() => void)[] = [];
  const asked: { driveId: string; ids: string[] }[] = [];
  const store = createNoteStore({
    lookup: (driveId, ids) => {
      asked.push({ driveId, ids: [...ids] });
      return answer(driveId, ids);
    },
    now: () => clock.now,
    defer: (run) => queued.push(run),
  });
  /** Sends what is queued and lets the answers land. */
  const settle = async () => {
    for (const run of queued.splice(0)) run();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  return { store, clock, queued, asked, settle };
}

describe("createNoteStore", () => {
  it("asks once per vault for the notes of one render", async () => {
    const { store, asked, queued, settle } = harness();
    const heard = vi.fn();
    store.subscribe(heard);
    store.want("vault", "a");
    store.want("vault", "b");
    store.want("other", "c");
    expect(queued).toHaveLength(1);
    expect(store.get("vault", "a")).toEqual({
      status: "pending",
      previous: null,
    });
    expect(store.get("vault", "a")).toBe(store.get("vault", "a"));
    expect(heard).toHaveBeenCalled();
    await settle();
    expect(asked).toEqual([
      { driveId: "vault", ids: ["a", "b"] },
      { driveId: "other", ids: ["c"] },
    ]);
    expect(store.get("vault", "b")).toEqual({
      status: "done",
      result: found("b"),
      at: 1_000,
    });
    expect(store.get("other", "c")).toMatchObject({ status: "done" });
    expect(store.get("vault", "c")).toBeUndefined();
  });

  it("does not ask twice for a note it is already asking about", async () => {
    const { store, asked, settle } = harness();
    store.want("vault", "a");
    store.want("vault", "a");
    await settle();
    store.want("vault", "a");
    await settle();
    expect(asked).toEqual([{ driveId: "vault", ids: ["a"] }]);
  });

  it("keeps a fresh answer, and asks again once it is stale while still showing it", async () => {
    let title = "First title";
    const { store, clock, asked, settle } = harness((_d, ids) =>
      Promise.resolve(new Map(ids.map((id) => [id, found(id, title)]))),
    );
    store.want("vault", "a");
    await settle();
    clock.now += FRESH_MS.found - 1;
    store.want("vault", "a");
    expect(asked).toHaveLength(1);
    clock.now += 2;
    title = "Renamed in the vault";
    store.want("vault", "a");
    expect(store.get("vault", "a")).toEqual({
      status: "pending",
      previous: found("a", "First title"),
    });
    await settle();
    expect(asked).toHaveLength(2);
    expect(store.get("vault", "a")).toMatchObject({
      status: "done",
      result: found("a", "Renamed in the vault"),
    });
  });

  it("asks again sooner after a failure", async () => {
    const { store, clock, asked, settle } = harness((_d, ids) =>
      Promise.resolve(
        new Map(
          ids.map((id) => [id, { ok: false, reason: "unreachable" } as const]),
        ),
      ),
    );
    store.want("vault", "a");
    await settle();
    clock.now += FRESH_MS.failed + 1;
    store.want("vault", "a");
    await settle();
    expect(asked).toHaveLength(2);
    expect(FRESH_MS.failed).toBeLessThan(FRESH_MS.found);
  });

  it("takes a note the vault said nothing about as a failure", async () => {
    const { store, settle } = harness(() =>
      Promise.resolve(new Map([["a", found("a")]])),
    );
    store.want("vault", "a");
    store.want("vault", "b");
    await settle();
    expect(store.get("vault", "b")).toMatchObject({
      status: "done",
      result: { ok: false, reason: "failed" },
    });
  });

  it("takes a lookup that throws as a failure for each of its notes", async () => {
    const { store, settle } = harness(() => Promise.reject(new Error("boom")));
    store.want("vault", "a");
    store.want("vault", "b");
    await settle();
    expect(store.get("vault", "a")).toMatchObject({
      result: { ok: false, reason: "failed" },
    });
    expect(store.get("vault", "b")).toMatchObject({
      result: { ok: false, reason: "failed" },
    });
  });

  it("splits a long batch", async () => {
    const { store, asked, settle } = harness();
    const ids = Array.from({ length: STORE_BATCH + 3 }, (_, i) => `n${i}`);
    for (const id of ids) store.want("vault", id);
    await settle();
    expect(asked.map((a) => a.ids.length)).toEqual([STORE_BATCH, 3]);
  });

  it("shows at once what a search already found, without asking", async () => {
    const { store, asked, settle } = harness();
    store.prime("vault", info("a", "From search"));
    expect(store.get("vault", "a")).toEqual({
      status: "done",
      result: found("a", "From search"),
      at: 1_000,
    });
    store.want("vault", "a");
    await settle();
    expect(asked).toHaveLength(0);
  });

  it("stops telling a listener that left", async () => {
    const { store, settle } = harness();
    const heard = vi.fn();
    const leave = store.subscribe(heard);
    leave();
    store.want("vault", "a");
    await settle();
    expect(heard).not.toHaveBeenCalled();
  });

  it("sends its batch after the current task when nothing else is said", async () => {
    const lookup = vi.fn((_d: string, ids: readonly string[]) =>
      Promise.resolve(new Map(ids.map((id) => [id, found(id)]))),
    );
    const store = createNoteStore({ lookup });
    store.want("vault", "a");
    store.want("vault", "b");
    expect(lookup).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(lookup).toHaveBeenCalledTimes(1);
    expect(store.get("vault", "a")).toMatchObject({ status: "done" });
  });
});
