import type { ProposalState } from "document-models/proposal";

/** One action to send to the new proposal, in order: `op` is the name in the model's `actions`. */
export type CopyStep = { op: string; input: Record<string, unknown> };

/**
 * The actions that turn an empty proposal into a copy of `state`: scope, prices,
 * options, terms and content, with new ids. Status, approval, sending, the answer,
 * the two copies and the dates (valid-until, target, end of a recurring service) are left behind.
 * A payment step paid on a date keeps its date, because the model refuses one without it.
 */
export function copyProposal(
  state: ProposalState,
  newId: () => string,
  revises: string | null,
): CopyStep[] {
  const ids = new Map<string, string>();
  const fresh = (old: string) => {
    const id = newId();
    ids.set(old, id);
    return id;
  };
  const map = (old: string) => ids.get(old) ?? old;
  const currency = state.currency ?? undefined;
  const steps: CopyStep[] = [];
  const push = (op: string, input: Record<string, unknown>) =>
    steps.push({ op, input });

  push("setProposalDetails", {
    title: state.title ?? undefined,
    code: state.code ?? undefined,
    currency,
    bindingOnSignature: state.bindingOnSignature,
    processesPersonalData: state.processesPersonalData,
    revisesProposalId: revises ?? undefined,
  });
  push("setProposalParties", {
    leadId: state.leadId ?? undefined,
    recipient: state.recipient
      ? {
          contactId: state.recipient.contactId,
          personId: state.recipient.personId ?? undefined,
        }
      : undefined,
    contractingEntity: state.contractingEntity
      ? { id: state.contractingEntity.id, title: state.contractingEntity.title }
      : undefined,
  });

  for (const p of state.packages)
    push("addPackage", {
      id: fresh(p.id),
      code: p.code,
      name: p.name,
      summary: p.summary ?? undefined,
      price: p.price ?? undefined,
      currency: p.price != null ? currency : undefined,
    });
  for (const p of state.packages)
    if (p.requires.length)
      push("updatePackage", { id: map(p.id), requires: p.requires.map(map) });

  for (const d of state.deliverables) {
    push("addDeliverable", {
      id: fresh(d.id),
      code: d.code,
      packageId: map(d.packageId),
      title: d.title,
      body: d.body ?? undefined,
    });
    if (d.price)
      push("setDeliverablePrice", {
        id: map(d.id),
        pricing: d.price.pricing,
        amount: d.price.amount ?? undefined,
        upperAmount: d.price.upperAmount ?? undefined,
        currency,
        period: d.price.period ?? undefined,
        unit: d.price.unit ?? undefined,
        note: d.price.note ?? undefined,
      });
  }

  for (const o of state.options) {
    push("addOption", {
      id: fresh(o.id),
      label: o.label,
      packageIds: o.packageIds.map(map),
    });
    for (const a of o.adjustments)
      push("addAdjustment", {
        optionId: map(o.id),
        id: newId(),
        label: a.label,
        amount: a.amount,
        currency,
        condition: a.condition ?? undefined,
      });
  }
  for (const s of state.paymentSteps)
    push("addPaymentStep", {
      id: newId(),
      label: s.label,
      trigger: s.trigger,
      percentage: s.percentage,
      date: s.date ?? undefined,
    });

  for (const a of state.actors)
    push("addActor", {
      id: fresh(a.id),
      code: a.code,
      name: a.name,
      description: a.description ?? undefined,
    });
  for (const u of state.useCases)
    push("addUseCase", {
      id: fresh(u.id),
      code: u.code,
      actorId: map(u.actorId),
      packageId: map(u.packageId),
      title: u.title,
      body: u.body ?? undefined,
    });
  for (const b of state.boundaries)
    push("addBoundary", {
      id: newId(),
      kind: b.kind,
      packageId: b.packageId ? map(b.packageId) : undefined,
      text: b.text,
      value: b.value ?? undefined,
    });

  for (const s of state.sections)
    push("addSection", {
      id: fresh(s.id),
      kind: s.kind,
      title: s.title ?? undefined,
      body: s.body ?? undefined,
      positioningId: s.positioningId ?? undefined,
    });
  for (const c of state.clauses)
    push("addClause", {
      id: newId(),
      kind: c.kind,
      title: c.title,
      body: c.body ?? undefined,
    });
  for (const a of state.annexes)
    push("addAnnex", {
      id: newId(),
      kind: a.kind,
      title: a.title,
      body: a.body ?? undefined,
      partOfAgreement: a.partOfAgreement,
    });
  for (const f of state.figures)
    push("addFigure", {
      id: newId(),
      anchorKind: f.anchorKind,
      anchorId: map(f.anchorId),
      file: { ref: f.file.ref, name: f.file.name, type: f.file.type },
      caption: f.caption ?? undefined,
    });
  return steps;
}
