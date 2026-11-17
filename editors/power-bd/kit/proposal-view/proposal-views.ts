import type {
  CheckFinding,
  Concern,
} from "../proposal-check/proposal-check.js";
import type { ProposalStatus } from "./proposal-view.js";

/** The two views of the proposal page, never side by side. */
export type PageView = "edit" | "preview";

/** What the Preview shows: the page as the client reads it, or its markdown, as Export saves it. */
export type PreviewMode = "document" | "markdown";

/** A draft opens where it is written; a locked proposal opens as the client reads it. */
export function openingView(status: ProposalStatus): PageView {
  return status === "DRAFT" ? "edit" : "preview";
}

export const PROPOSAL_TABS = [
  { id: "details", label: "Details" },
  { id: "packages", label: "Packages" },
  { id: "options", label: "Options and payment" },
  { id: "scope", label: "Scope" },
  { id: "content", label: "Content" },
  { id: "references", label: "References" },
] as const;

export type ProposalTab = (typeof PROPOSAL_TABS)[number]["id"];

const LIST_TAB: Partial<Record<string, ProposalTab>> = {
  references: "references",
  packages: "packages",
  deliverables: "packages",
  options: "options",
  adjustments: "options",
  paymentSteps: "options",
  actors: "scope",
  useCases: "scope",
  boundaries: "scope",
  sections: "content",
  clauses: "content",
  annexes: "content",
  figures: "content",
};
const FIELD_TAB: Partial<Record<string, ProposalTab>> = {
  title: "details",
  validUntil: "details",
  paymentSteps: "options",
  clauses: "content",
  annexes: "content",
};

/** Where a finding is fixed: the tab, the key of the item or field on it, and the item's field when known. */
export type FindingTarget = { tab: ProposalTab; key: string; field?: string };

export function findingTarget(concerns: Concern): FindingTarget | null {
  if ("list" in concerns) {
    const tab = LIST_TAB[concerns.list];
    if (!tab) return null;
    return {
      tab,
      key: `${concerns.list}:${concerns.id}`,
      ...(concerns.field ? { field: concerns.field } : {}),
    };
  }
  const tab = FIELD_TAB[concerns.field];
  return tab ? { tab, key: `field:${concerns.field}` } : null;
}

export type FindingRow = {
  sentence: string;
  target: FindingTarget | null;
  /** The tab's name, to say where the finding is fixed. */
  where: string | null;
};

/** The findings as the page lists them: what is wrong and where to fix it. */
export function findingRows(
  findings: readonly Pick<CheckFinding, "concerns" | "sentence">[],
): FindingRow[] {
  return findings.map((f) => {
    const target = findingTarget(f.concerns);
    return {
      sentence: f.sentence,
      target,
      where: target
        ? PROPOSAL_TABS.find((t) => t.id === target.tab)!.label
        : null,
    };
  });
}

/** The line above the findings: how many, and what they hold up. */
export function findingsHeadline(count: number, status: ProposalStatus): string {
  const things = `${count} ${count === 1 ? "thing" : "things"} to fix`;
  return status === "DRAFT" ? `${things} before you can approve` : things;
}
