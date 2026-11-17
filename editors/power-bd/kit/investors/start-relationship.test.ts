import { describe, expect, it, vi } from "vitest";
import { startRelationship, type StartDeps } from "./start-relationship.js";

const row = { id: "r1", name: "Velden Capital", website: "velden.example" };

function deps(over: Partial<StartDeps> = {}): StartDeps {
  return {
    createContact: vi.fn(() => Promise.resolve("c1")),
    createLead: vi.fn(() => Promise.resolve("l1")),
    markEngaged: vi.fn(() => Promise.resolve()),
    ...over,
  };
}

describe("startRelationship", () => {
  it("runs the three steps in order and returns both ids", async () => {
    const d = deps();
    const r = await startRelationship(row, d);
    expect(r).toEqual({ ok: true, organisationId: "c1", leadId: "l1" });
    expect(d.createLead).toHaveBeenCalledWith(row, "c1");
    expect(d.markEngaged).toHaveBeenCalledWith(row, "c1", "l1");
  });

  it("stops at a failed contact: nothing exists", async () => {
    const d = deps({
      createContact: vi.fn(() => Promise.reject(new Error("no folder"))),
    });
    const r = await startRelationship(row, d);
    expect(r).toEqual({
      ok: false,
      step: "contact",
      message: "no folder",
      created: {},
    });
    expect(d.createLead).not.toHaveBeenCalled();
    expect(d.markEngaged).not.toHaveBeenCalled();
  });

  it("stops at a failed lead: the organisation exists", async () => {
    const d = deps({
      createLead: vi.fn(() => Promise.reject(new Error("boom"))),
    });
    const r = await startRelationship(row, d);
    expect(r).toMatchObject({
      ok: false,
      step: "lead",
      created: { organisationId: "c1" },
    });
    expect(d.markEngaged).not.toHaveBeenCalled();
  });

  it("stops at a failed mark: both exist", async () => {
    const d = deps({
      markEngaged: vi.fn(() => Promise.reject(new Error("rejected"))),
    });
    const r = await startRelationship(row, d);
    expect(r).toEqual({
      ok: false,
      step: "mark",
      message: "rejected",
      created: { organisationId: "c1", leadId: "l1" },
    });
  });
});

describe("startRelationship with a non-error failure", () => {
  it("reports a thrown string as the message", async () => {
    const d = deps({
      // oxlint-disable-next-line prefer-promise-reject-errors -- a dependency may reject with a bare string, which is the case under test
      markEngaged: vi.fn(() => Promise.reject("vault locked")),
    });
    const r = await startRelationship(row, d);
    expect(r).toEqual({
      ok: false,
      step: "mark",
      message: "vault locked",
      created: { organisationId: "c1", leadId: "l1" },
    });
  });
});
