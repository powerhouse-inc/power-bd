export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Address: { input: `${string}:0x${string}`; output: `${string}:0x${string}` };
  Amount: {
    input: { unit?: string; value?: number };
    output: { unit?: string; value?: number };
  };
  Amount_Crypto: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Currency: {
    input: { unit: string; value: string };
    output: { unit: string; value: string };
  };
  Amount_Fiat: {
    input: { unit: string; value: number };
    output: { unit: string; value: number };
  };
  Amount_Money: { input: number; output: number };
  Amount_Percentage: { input: number; output: number };
  Amount_Tokens: { input: number; output: number };
  AttachmentRef: {
    input: `attachment://v${number}:${string}`;
    output: `attachment://v${number}:${string}`;
  };
  Currency: { input: string; output: string };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
  EmailAddress: { input: string; output: string };
  EthereumAddress: { input: string; output: string };
  OID: { input: string; output: string };
  OLabel: { input: string; output: string };
  PHID: { input: string; output: string };
  URL: { input: string; output: string };
  Unknown: { input: unknown; output: unknown };
  Upload: { input: File; output: File };
};

export type AddNeverClaimInput = {
  claim: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  phrases: Array<Scalars["String"]["input"]>;
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddPositioningInput = {
  id: Scalars["OID"]["input"];
  text: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
};

export type AddProofCaseInput = {
  id: Scalars["OID"]["input"];
  mayBeNamedPublicly: Scalars["Boolean"]["input"];
  summary?: InputMaybe<Scalars["String"]["input"]>;
  title: Scalars["String"]["input"];
};

export type AddProofEvidenceInput = {
  evidenceId: Scalars["PHID"]["input"];
  proofCaseId: Scalars["OID"]["input"];
  title: Scalars["String"]["input"];
};

export type ApprovePositioningInput = {
  approvedAt: Scalars["DateTime"]["input"];
  approvedBy: Scalars["EthereumAddress"]["input"];
  id: Scalars["OID"]["input"];
};

export type LinkPositioningComparableInput = {
  comparableId: Scalars["PHID"]["input"];
  positioningId: Scalars["OID"]["input"];
  title: Scalars["String"]["input"];
};

export type LinkPositioningProofInput = {
  positioningId: Scalars["OID"]["input"];
  proofCaseId: Scalars["OID"]["input"];
};

export type LinkProofComparableInput = {
  comparableId: Scalars["PHID"]["input"];
  proofCaseId: Scalars["OID"]["input"];
  title: Scalars["String"]["input"];
};

export type NeverClaim = {
  claim: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  phrases: Array<Scalars["String"]["output"]>;
  reason: Maybe<Scalars["String"]["output"]>;
};

export type PlaybookState = {
  neverClaims: Array<NeverClaim>;
  positioning: Array<Positioning>;
  proofCases: Array<ProofCase>;
};

export type Positioning = {
  approvedAt: Maybe<Scalars["DateTime"]["output"]>;
  approvedBy: Maybe<Scalars["EthereumAddress"]["output"]>;
  comparables: Array<VaultRef>;
  id: Scalars["OID"]["output"];
  proofCaseIds: Array<Scalars["OID"]["output"]>;
  status: PositioningStatus;
  text: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
};

export type PositioningStatus = "APPROVED" | "DRAFT" | "RETIRED";

export type ProofCase = {
  comparables: Array<VaultRef>;
  evidence: Array<VaultRef>;
  id: Scalars["OID"]["output"];
  mayBeNamedPublicly: Scalars["Boolean"]["output"];
  summary: Maybe<Scalars["String"]["output"]>;
  title: Scalars["String"]["output"];
};

export type RemoveNeverClaimInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveProofCaseInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveProofEvidenceInput = {
  evidenceId: Scalars["PHID"]["input"];
  proofCaseId: Scalars["OID"]["input"];
};

export type RetirePositioningInput = {
  id: Scalars["OID"]["input"];
};

export type UnlinkPositioningComparableInput = {
  comparableId: Scalars["PHID"]["input"];
  positioningId: Scalars["OID"]["input"];
};

export type UnlinkPositioningProofInput = {
  positioningId: Scalars["OID"]["input"];
  proofCaseId: Scalars["OID"]["input"];
};

export type UnlinkProofComparableInput = {
  comparableId: Scalars["PHID"]["input"];
  proofCaseId: Scalars["OID"]["input"];
};

export type UpdateNeverClaimInput = {
  claim?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  phrases?: InputMaybe<Array<Scalars["String"]["input"]>>;
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdatePositioningInput = {
  id: Scalars["OID"]["input"];
  text?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateProofCaseInput = {
  id: Scalars["OID"]["input"];
  mayBeNamedPublicly?: InputMaybe<Scalars["Boolean"]["input"]>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type VaultRef = {
  id: Scalars["PHID"]["output"];
  title: Scalars["String"]["output"];
};
