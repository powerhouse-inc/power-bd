import type { LookupResult } from "./client.js";
import { OPEN_WHY, linkView, openPlan, type LinkView } from "./link.js";
import type { NoteInfo } from "./model.js";
import type { LookupEntry } from "./store.js";

const linked = { id: "n-1", title: "Orvane attempt limit (as linked)" };
const today: NoteInfo = {
  id: "n-1",
  title: "Orvane bars an entity after three refusals",
  description: "Counts a rejected first step too.",
  kind: "Reference",
  icon: "note",
};
const done = (result: LookupResult): LookupEntry => ({
  status: "done",
  result,
  at: 0,
});

describe("linkView", () => {
  it("shows a note as unavailable when no vault is chosen", () => {
    for (const vault of [null, undefined, "", "  "])
      expect(linkView(linked, vault, done({ ok: true, note: today }))).toEqual({
        state: "unavailable",
        title: linked.title,
        reason: "no-vault",
        why: "No vault is chosen in Settings",
        icon: "info",
      });
  });

  it("shows the title it was linked with while the vault is asked", () => {
    expect(linkView(linked, "vault", undefined)).toEqual({
      state: "loading",
      title: linked.title,
    });
    expect(
      linkView(linked, "vault", { status: "pending", previous: null }),
    ).toEqual({
      state: "loading",
      title: linked.title,
    });
  });

  it("shows the vault's title today", () => {
    expect(linkView(linked, "vault", done({ ok: true, note: today }))).toEqual({
      state: "live",
      title: today.title,
      renamed: true,
      kind: "Reference",
      description: today.description,
      icon: "note",
    });
  });

  it("keeps showing the last answer while it is asked again", () => {
    const view = linkView(linked, "vault", {
      status: "pending",
      previous: { ok: true, note: today },
    });
    expect(view).toMatchObject({ state: "live", title: today.title });
  });

  it("keeps the linked title when the vault has none, and does not call it renamed", () => {
    const view = linkView(
      linked,
      "vault",
      done({ ok: true, note: { ...today, title: null } }),
    );
    expect(view).toMatchObject({
      state: "live",
      title: linked.title,
      renamed: false,
    });
    const same = linkView(
      linked,
      "vault",
      done({ ok: true, note: { ...today, title: linked.title } }),
    );
    expect(same).toMatchObject({ renamed: false });
  });

  it("shows a note the vault no longer has as unavailable, with the title it was linked with", () => {
    expect(linkView(linked, "vault", done({ ok: true, note: null }))).toEqual({
      state: "unavailable",
      title: linked.title,
      reason: "missing",
      why: "No longer in the vault",
      icon: "alert-circle",
    });
  });

  it("says why a note can't be read", () => {
    expect(
      linkView(linked, "vault", done({ ok: false, reason: "forbidden" })),
    ).toMatchObject({
      state: "unavailable",
      title: linked.title,
      reason: "forbidden",
      icon: "lock",
    });
    expect(
      linkView(linked, "vault", {
        status: "pending",
        previous: { ok: false, reason: "unreachable" },
      }),
    ).toMatchObject({ state: "unavailable", reason: "unreachable" });
  });
});

describe("openPlan", () => {
  const live = linkView(linked, "vault", done({ ok: true, note: today }));
  const missing = linkView(linked, "vault", done({ ok: true, note: null }));
  const loading: LinkView = { state: "loading", title: "x" };

  it("opens a note the reader can read, in the vault open in this browser", () => {
    expect(openPlan(live, { drive: true, node: true })).toEqual({
      can: true,
      why: null,
    });
  });

  it("offers nothing to open for a note that is unavailable or still being asked", () => {
    expect(openPlan(missing, { drive: true, node: true })).toEqual({
      can: false,
      why: null,
    });
    expect(openPlan(loading, { drive: true, node: true })).toEqual({
      can: false,
      why: null,
    });
  });

  it("says when the vault is not open in this browser", () => {
    expect(openPlan(live, { drive: false, node: false })).toEqual({
      can: false,
      why: OPEN_WHY.notOpenHere,
    });
    expect(OPEN_WHY.notOpenHere).toMatch(/not open in this browser/);
    expect(OPEN_WHY.notListed).toMatch(/can't be opened from here/);
  });

  it("waits for the note's place in the vault before linking to it", () => {
    expect(openPlan(live, { drive: true, node: false })).toEqual({
      can: false,
      why: null,
    });
  });
});
