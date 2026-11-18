import {
  addSegment,
  linkSegmentOrganisation,
  removeSegment,
  setSegmentSource,
  unlinkSegmentOrganisation,
  updateSegment,
} from "document-models/market/v1";
import { describe, expect, it } from "vitest";
import { URL_, approvedDoc, lastError, run } from "./helpers.js";

const seg = (doc: ReturnType<typeof run>, id = "s1") => doc.state.global.segments.find((s) => s.id === id);

describe("SegmentsOperations", () => {
  it("adds a segment, not counted and not serviceable yet", () => {
    const doc = run(addSegment({ id: "s1", name: "  Group finance  ", description: "Listed companies" }));
    expect(seg(doc)).toEqual({
      id: "s1",
      name: "Group finance",
      description: "Listed companies",
      accounts: null,
      accountsSource: null,
      annualValue: null,
      annualValueSource: null,
      serviceable: false,
      targetAccounts: null,
      organisationIds: [],
    });
    expect(seg(run(addSegment({ id: "s2", name: "B" })), "s2")?.description).toBeNull();
  });

  it("refuses an empty name and a repeated id", () => {
    expect(lastError(run(addSegment({ id: "s1", name: "  " })))).toBe("A segment needs a name");
    const doc = run(addSegment({ id: "s1", name: "A" }), addSegment({ id: "s1", name: "B" }));
    expect(lastError(doc)).toBe("Segment s1 already exists");
    expect(doc.state.global.segments).toHaveLength(1);
  });

  it("updates names and numbers, and clears a number set to null", () => {
    let doc = run(addSegment({ id: "s1", name: "A" }));
    doc = run(doc, updateSegment({ id: "s1", name: " B ", description: "d", accounts: 0, annualValue: 1000, serviceable: true, targetAccounts: 0 }));
    expect(lastError(doc)).toBeUndefined();
    expect(seg(doc)).toMatchObject({ name: "B", description: "d", accounts: 0, annualValue: 1000, serviceable: true, targetAccounts: 0 });
    doc = run(doc, updateSegment({ id: "s1", accounts: null, description: null, annualValue: null, targetAccounts: null, serviceable: null }));
    expect(seg(doc)).toMatchObject({ name: "B", description: null, accounts: null, annualValue: null, targetAccounts: null, serviceable: true });
  });

  it("refuses a missing segment, an empty name and negative numbers", () => {
    expect(lastError(run(updateSegment({ id: "nope", accounts: 1 })))).toBe("Segment nope not found");
    const doc = run(addSegment({ id: "s1", name: "A" }));
    expect(lastError(run(doc, updateSegment({ id: "s1", name: null })))).toBe("A segment needs a name");
    expect(lastError(run(doc, updateSegment({ id: "s1", name: "" })))).toBe("A segment needs a name");
    for (const n of [{ accounts: -1 }, { annualValue: -5 }, { targetAccounts: -2 }])
      expect(lastError(run(doc, updateSegment({ id: "s1", ...n })))).toBe("A segment's numbers can't be negative");
  });

  it("keeps the target within the organisations in the segment", () => {
    const doc = run(addSegment({ id: "s1", name: "A" }), updateSegment({ id: "s1", accounts: 10, targetAccounts: 10 }));
    expect(lastError(doc)).toBeUndefined();
    const msg = "The target can't be more than the organisations in the segment";
    expect(lastError(run(doc, updateSegment({ id: "s1", targetAccounts: 11 })))).toBe(msg);
    expect(lastError(run(doc, updateSegment({ id: "s1", accounts: 9 })))).toBe(msg);
    expect(lastError(run(doc, updateSegment({ id: "s1", accounts: null, targetAccounts: 50 })))).toBeUndefined();
    const lowered = run(doc, updateSegment({ id: "s1", targetAccounts: 4 }));
    expect(seg(lowered)).toMatchObject({ accounts: 10, targetAccounts: 4 });
  });

  it("sets, clears and checks a source", () => {
    let doc = run(addSegment({ id: "s1", name: "A" }));
    doc = run(doc, setSegmentSource({ id: "s1", figure: "ACCOUNTS", title: " Registry ", url: URL_ }));
    doc = run(doc, setSegmentSource({ id: "s1", figure: "ANNUAL_VALUE", title: "Note", documentId: "n1" }));
    expect(seg(doc)?.accountsSource).toEqual({ title: "Registry", url: URL_, documentId: null });
    expect(seg(doc)?.annualValueSource).toEqual({ title: "Note", url: null, documentId: "n1" });
    doc = run(doc, setSegmentSource({ id: "s1", figure: "ACCOUNTS" }));
    expect(seg(doc)?.accountsSource).toBeNull();
    expect(lastError(run(doc, setSegmentSource({ id: "s1", figure: "ACCOUNTS", url: URL_ })))).toBe("A source needs a title");
    expect(lastError(run(doc, setSegmentSource({ id: "s1", figure: "ACCOUNTS", title: " ", url: URL_ })))).toBe("A source needs a title");
    expect(lastError(run(doc, setSegmentSource({ id: "s1", figure: "ACCOUNTS", title: "T" })))).toBe("A source needs a link or a vault note");
    expect(lastError(run(doc, setSegmentSource({ id: "x", figure: "ACCOUNTS", title: "T", url: URL_ })))).toBe("Segment x not found");
  });

  it("names organisations in a segment, once each", () => {
    let doc = run(addSegment({ id: "s1", name: "A" }), linkSegmentOrganisation({ id: "s1", organisationId: "org-1" }));
    expect(seg(doc)?.organisationIds).toEqual(["org-1"]);
    expect(lastError(run(doc, linkSegmentOrganisation({ id: "s1", organisationId: "org-1" })))).toBe("The organisation is already in the segment");
    expect(lastError(run(doc, linkSegmentOrganisation({ id: "x", organisationId: "org-1" })))).toBe("Segment x not found");
    doc = run(doc, unlinkSegmentOrganisation({ id: "s1", organisationId: "org-1" }));
    expect(seg(doc)?.organisationIds).toEqual([]);
    expect(lastError(run(doc, unlinkSegmentOrganisation({ id: "s1", organisationId: "org-1" })))).toBe("The organisation is not in the segment");
    expect(lastError(run(doc, unlinkSegmentOrganisation({ id: "x", organisationId: "org-1" })))).toBe("Segment x not found");
  });

  it("removes a segment", () => {
    const doc = run(addSegment({ id: "s1", name: "A" }), removeSegment({ id: "s1" }));
    expect(doc.state.global.segments).toEqual([]);
    expect(lastError(run(doc, removeSegment({ id: "s1" })))).toBe("Segment s1 not found");
  });

  it("changes no figure while they are approved, but still names organisations", () => {
    const doc = approvedDoc();
    for (const action of [
      addSegment({ id: "s2", name: "B" }),
      updateSegment({ id: "s1", accounts: 1 }),
      setSegmentSource({ id: "s1", figure: "ACCOUNTS" }),
      removeSegment({ id: "s1" }),
    ])
      expect(lastError(run(doc, action))).toBe("Reopen the figures to change them");
    expect(lastError(run(doc, linkSegmentOrganisation({ id: "s1", organisationId: "org-9" })))).toBeUndefined();
  });
});
