import type { PlaybookState } from "document-models/playbook";

export type PositioningItem = PlaybookState["positioning"][number];
export type ProofCase = PlaybookState["proofCases"][number];
export type NeverClaim = PlaybookState["neverClaims"][number];
