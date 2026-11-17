import type { ProposalState } from "document-models/proposal";
import { describe, expect, it } from "vitest";
import {
  deliverable,
  emptyProposal,
  pkg,
  workedExample,
} from "../proposal-totals/fixtures.js";
import { copyProposal } from "./proposal-copy.js";

const counter = () => {
  let n = 0;
  return () => `n${++n}`;
};

const sent = (): ProposalState => ({
  ...workedExample(),
  leadId: "lead-1",
  status: "SENT",
  validUntil: "2026-12-31T00:00:00.000Z",
  approvedBy: "0xabc",
  approvedAt: "2026-11-01T00:00:00.000Z",
  sentBy: "0xabc",
  sentAt: "2026-11-02T00:00:00.000Z",
  sentCopy: {
    ref: "attachment://v1:aa",
    name: "a.pdf",
    type: "application/pdf",
  },
  signedCopy: {
    ref: "attachment://v1:bb",
    name: "b.pdf",
    type: "application/pdf",
  },
  reason: "no",
  answeredAt: "2026-11-05T00:00:00.000Z",
});

describe("copyProposal", () => {
  it("keeps the lead and sets revises when asked", () => {
    const steps = copyProposal(sent(), counter(), "old-1");
    const details = steps.find((s) => s.op === "setProposalDetails");
    expect(details?.input).toMatchObject({ revisesProposalId: "old-1" });
    expect(
      steps.find((s) => s.op === "setProposalParties")?.input,
    ).toMatchObject({
      leadId: "lead-1",
    });
  });

  it("drops status, approval, sending, answer, copies and the valid-until date", () => {
    const json = JSON.stringify(copyProposal(sent(), counter(), null));
    for (const gone of ["0xabc", "attachment://v1:", "2026-12-31", "2026-11-0"])
      expect(json).not.toContain(gone);
    expect(json).not.toContain("approv");
    expect(json).not.toContain("answer");
  });

  it("gives every copied item a new id and remaps links", () => {
    const state = sent();
    const steps = copyProposal(state, counter(), null);
    const oldIds = new Set([
      ...state.packages.map((p) => p.id),
      ...state.deliverables.map((d) => d.id),
      ...state.options.map((o) => o.id),
    ]);
    const added = steps.filter((s) =>
      /^add(Package|Deliverable|Option)$/.test(s.op),
    );
    expect(added.length).toBeGreaterThan(0);
    for (const s of added)
      expect(oldIds.has((s.input as { id: string }).id)).toBe(false);
    const optionStep = steps.find((s) => s.op === "addOption")!;
    const newPackageIds = steps
      .filter((s) => s.op === "addPackage")
      .map((s) => (s.input as { id: string }).id);
    for (const id of (optionStep.input as { packageIds: string[] }).packageIds)
      expect(newPackageIds).toContain(id);
  });

  it("keeps prices, adjustments and payment steps", () => {
    const state = sent();
    const steps = copyProposal(state, counter(), null);
    expect(steps.filter((s) => s.op === "setDeliverablePrice")).toHaveLength(
      state.deliverables.filter((d) => d.price).length,
    );
    expect(steps.filter((s) => s.op === "addPaymentStep")).toHaveLength(
      state.paymentSteps.length,
    );
    expect(steps.filter((s) => s.op === "addAdjustment")).toHaveLength(
      state.options.reduce((n, o) => n + o.adjustments.length, 0),
    );
  });

  it("copies every optional field of a fully written proposal", () => {
    const file: ProposalState["figures"][number]["file"] = {
      ref: "attachment://v1:cc",
      name: "fig.png",
      type: "image/png",
    };
    const state = emptyProposal({
      title: "Bridge build",
      code: "BRI",
      leadId: "lead-1",
      recipient: { contactId: "c-1", personId: "per-1" },
      contractingEntity: { id: "ent-1", title: "Northwind Ltd" },
      packages: [
        { ...pkg("pa", 100), summary: "First" },
        { ...pkg("pb"), requires: ["pa"] },
      ],
      deliverables: [
        {
          ...deliverable("da", "pa", {
            pricing: "RATE",
            amount: 50,
            upperAmount: 80,
            unit: "DAY",
            period: "MONTH",
            note: "approx",
          }),
          body: "Details",
        },
      ],
      options: [
        {
          id: "oa",
          label: "A",
          packageIds: ["pa"],
          adjustments: [
            { id: "ad", label: "Early", amount: -5, condition: "if paid" },
          ],
        },
      ],
      paymentSteps: [
        {
          id: "s1",
          label: "Final",
          trigger: "ON_DATE",
          percentage: 100,
          date: "2026-12-01",
        },
      ],
      actors: [
        { id: "ac", code: "A1", name: "Clerk", description: "Files it" },
      ],
      useCases: [
        {
          id: "uc",
          code: "U1",
          actorId: "ac",
          packageId: "pa",
          title: "File",
          body: "Steps",
        },
      ],
      boundaries: [
        {
          id: "b1",
          kind: "EXCLUSION",
          packageId: "pb",
          text: "No hosting",
          value: "none",
        },
      ],
      sections: [
        {
          id: "se",
          kind: "PROSE",
          title: "Intro",
          body: "Hello",
          positioningId: "pos-1",
        },
      ],
      clauses: [{ id: "cl", kind: "LIABILITY", title: "Cap", body: "Capped" }],
      annexes: [
        {
          id: "an",
          kind: "FORM",
          title: "Form",
          body: "Fields",
          partOfAgreement: true,
        },
      ],
      figures: [
        {
          id: "fi",
          anchorKind: "USE_CASE",
          anchorId: "uc",
          caption: "Flow",
          file,
        },
      ],
    });
    const steps = copyProposal(state, counter(), null);
    const ops = steps.map((s) => s.op);
    expect(ops).toEqual([
      "setProposalDetails",
      "setProposalParties",
      "addPackage",
      "addPackage",
      "updatePackage",
      "addDeliverable",
      "setDeliverablePrice",
      "addOption",
      "addAdjustment",
      "addPaymentStep",
      "addActor",
      "addUseCase",
      "addBoundary",
      "addSection",
      "addClause",
      "addAnnex",
      "addFigure",
    ]);
    const by = (op: string) => steps.find((s) => s.op === op)!.input;
    expect(by("setProposalParties")).toEqual({
      leadId: "lead-1",
      recipient: { contactId: "c-1", personId: "per-1" },
      contractingEntity: { id: "ent-1", title: "Northwind Ltd" },
    });
    expect(by("addPackage")).toEqual({
      id: "n1",
      code: "PA",
      name: "pa",
      summary: "First",
      price: 100,
      currency: "EUR",
    });
    expect(by("updatePackage")).toEqual({ id: "n2", requires: ["n1"] });
    expect(by("addDeliverable")).toMatchObject({
      packageId: "n1",
      body: "Details",
    });
    expect(by("setDeliverablePrice")).toEqual({
      id: "n3",
      pricing: "RATE",
      amount: 50,
      upperAmount: 80,
      currency: "EUR",
      period: "MONTH",
      unit: "DAY",
      note: "approx",
    });
    expect(by("addAdjustment")).toMatchObject({
      optionId: "n4",
      condition: "if paid",
    });
    expect(by("addPaymentStep")).toMatchObject({ date: "2026-12-01" });
    expect(by("addActor")).toMatchObject({ description: "Files it" });
    expect(by("addUseCase")).toMatchObject({
      actorId: "n7",
      packageId: "n1",
      body: "Steps",
    });
    expect(by("addBoundary")).toMatchObject({ packageId: "n2", value: "none" });
    expect(by("addSection")).toMatchObject({
      title: "Intro",
      body: "Hello",
      positioningId: "pos-1",
    });
    expect(by("addClause")).toMatchObject({ body: "Capped" });
    expect(by("addAnnex")).toMatchObject({ body: "Fields" });
    expect(by("addFigure")).toEqual({
      id: "n13",
      anchorKind: "USE_CASE",
      anchorId: "n8",
      file,
      caption: "Flow",
    });
  });

  it("leaves optional fields out when the proposal never filled them", () => {
    const state = emptyProposal({
      code: null,
      currency: null,
      packages: [pkg("pa")],
      deliverables: [deliverable("da", "pa", { pricing: "INCLUDED" })],
      options: [
        {
          id: "oa",
          label: "A",
          packageIds: [],
          adjustments: [
            { id: "ad", label: "Early", amount: -5, condition: null },
          ],
        },
      ],
      boundaries: [
        {
          id: "b1",
          kind: "ASSUMPTION",
          packageId: null,
          text: "Open",
          value: null,
        },
      ],
      sections: [
        {
          id: "se",
          kind: "SCOPE",
          title: null,
          body: null,
          positioningId: null,
        },
      ],
      actors: [{ id: "ac", code: "A1", name: "Clerk", description: null }],
      useCases: [
        {
          id: "uc",
          code: "U1",
          actorId: "ac",
          packageId: "pa",
          title: "File",
          body: null,
        },
      ],
      clauses: [{ id: "cl", kind: "OTHER", title: "Misc", body: null }],
      annexes: [
        {
          id: "an",
          kind: "OTHER",
          title: "Extra",
          body: null,
          partOfAgreement: false,
        },
      ],
      figures: [
        {
          id: "fi",
          anchorKind: "SECTION",
          anchorId: "se",
          caption: null,
          file: { ref: "attachment://v1:dd", name: "x.png", type: "image/png" },
        },
      ],
    });
    const steps = copyProposal(state, counter(), null);
    const by = (op: string) => steps.find((s) => s.op === op)!.input;
    expect(by("setProposalDetails")).toEqual({
      title: undefined,
      code: undefined,
      currency: undefined,
      bindingOnSignature: false,
      processesPersonalData: false,
      revisesProposalId: undefined,
    });
    expect(by("setProposalParties")).toEqual({
      leadId: undefined,
      recipient: undefined,
      contractingEntity: undefined,
    });
    expect(by("addPackage")).toMatchObject({
      summary: undefined,
      price: undefined,
      currency: undefined,
    });
    expect(by("addBoundary")).toMatchObject({
      packageId: undefined,
      value: undefined,
    });
    expect(by("addSection")).toMatchObject({
      title: undefined,
      body: undefined,
      positioningId: undefined,
    });
    expect(by("addAdjustment")).toMatchObject({ condition: undefined });
    expect(by("addFigure")).toMatchObject({ caption: undefined });
    expect(steps.some((s) => s.op === "updatePackage")).toBe(false);
  });
});
