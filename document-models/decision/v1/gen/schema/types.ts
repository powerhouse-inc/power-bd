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

export type AddReferenceInput = {
  documentId: Scalars["PHID"]["input"];
  id: Scalars["OID"]["input"];
  kind: ReferenceKind;
  title: Scalars["String"]["input"];
};

export type AnswerDecisionInput = {
  answer: Scalars["String"]["input"];
  answeredAt: Scalars["DateTime"]["input"];
  answeredBy: Scalars["EthereumAddress"]["input"];
};

export type DecisionState = {
  answer: Maybe<Scalars["String"]["output"]>;
  answeredAt: Maybe<Scalars["DateTime"]["output"]>;
  answeredBy: Maybe<Scalars["EthereumAddress"]["output"]>;
  context: Maybe<Scalars["String"]["output"]>;
  decideBy: Maybe<Scalars["Date"]["output"]>;
  owner: Maybe<Scalars["EthereumAddress"]["output"]>;
  question: Maybe<Scalars["String"]["output"]>;
  reason: Maybe<Scalars["String"]["output"]>;
  references: Array<Reference>;
  status: DecisionStatus;
};

export type DecisionStatus = "ANSWERED" | "OPEN" | "WITHDRAWN";

export type Reference = {
  documentId: Scalars["PHID"]["output"];
  id: Scalars["OID"]["output"];
  kind: ReferenceKind;
  title: Scalars["String"]["output"];
};

export type ReferenceKind =
  | "COMPARABLE"
  | "DECISION"
  | "LEAD"
  | "NOTE"
  | "OPPORTUNITY"
  | "OTHER"
  | "RESEARCH"
  | "SOURCE";

export type RemoveReferenceInput = {
  id: Scalars["OID"]["input"];
};

export type ReopenDecisionInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetDecideByInput = {
  decideBy?: InputMaybe<Scalars["Date"]["input"]>;
};

export type SetDecisionOwnerInput = {
  owner?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
};

export type SetQuestionInput = {
  context?: InputMaybe<Scalars["String"]["input"]>;
  question: Scalars["String"]["input"];
};

export type WithdrawDecisionInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
};
