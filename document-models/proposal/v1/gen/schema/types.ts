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

export type Actor = {
  code: Scalars["String"]["output"];
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
};

export type AddActorInput = {
  code: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
};

export type AddAdjustmentInput = {
  amount: Scalars["Amount_Money"]["input"];
  condition?: InputMaybe<Scalars["String"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  id: Scalars["OID"]["input"];
  label: Scalars["String"]["input"];
  optionId: Scalars["OID"]["input"];
};

export type AddAnnexInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  kind: AnnexKind;
  partOfAgreement?: InputMaybe<Scalars["Boolean"]["input"]>;
  title: Scalars["String"]["input"];
};

export type AddBoundaryInput = {
  id: Scalars["OID"]["input"];
  kind: BoundaryKind;
  packageId?: InputMaybe<Scalars["OID"]["input"]>;
  text: Scalars["String"]["input"];
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddClauseInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  kind: ClauseKind;
  title: Scalars["String"]["input"];
};

export type AddDeliverableInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  code: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  packageId: Scalars["OID"]["input"];
  title: Scalars["String"]["input"];
};

export type AddFigureFileInput = {
  name: Scalars["String"]["input"];
  ref: Scalars["AttachmentRef"]["input"];
  type: Scalars["String"]["input"];
};

export type AddFigureInput = {
  anchorId: Scalars["OID"]["input"];
  anchorKind: FigureAnchorKind;
  caption?: InputMaybe<Scalars["String"]["input"]>;
  file: AddFigureFileInput;
  id: Scalars["OID"]["input"];
};

export type AddOptionInput = {
  id: Scalars["OID"]["input"];
  label: Scalars["String"]["input"];
  packageIds: Array<Scalars["OID"]["input"]>;
};

export type AddPackageInput = {
  code: Scalars["String"]["input"];
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
  price?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  requires?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  targetDate?: InputMaybe<Scalars["Date"]["input"]>;
};

export type AddPaymentStepInput = {
  date?: InputMaybe<Scalars["Date"]["input"]>;
  id: Scalars["OID"]["input"];
  label: Scalars["String"]["input"];
  percentage: Scalars["Amount_Percentage"]["input"];
  trigger: PaymentTrigger;
};

export type AddReferenceInput = {
  documentId: Scalars["PHID"]["input"];
  id: Scalars["OID"]["input"];
  kind: ReferenceKind;
  title: Scalars["String"]["input"];
};

export type AddSectionInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  kind: SectionKind;
  positioningId?: InputMaybe<Scalars["OID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddUseCaseInput = {
  actorId: Scalars["OID"]["input"];
  body?: InputMaybe<Scalars["String"]["input"]>;
  code: Scalars["String"]["input"];
  id: Scalars["OID"]["input"];
  packageId: Scalars["OID"]["input"];
  title: Scalars["String"]["input"];
};

export type Adjustment = {
  amount: Scalars["Amount_Money"]["output"];
  condition: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  label: Scalars["String"]["output"];
};

export type Annex = {
  body: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  kind: AnnexKind;
  partOfAgreement: Scalars["Boolean"]["output"];
  title: Scalars["String"]["output"];
};

export type AnnexKind = "DATA_PROCESSING" | "FORM" | "OTHER";

export type ApproveProposalInput = {
  approvedAt: Scalars["DateTime"]["input"];
  approvedBy: Scalars["EthereumAddress"]["input"];
};

export type Boundary = {
  id: Scalars["OID"]["output"];
  kind: BoundaryKind;
  packageId: Maybe<Scalars["OID"]["output"]>;
  text: Scalars["String"]["output"];
  value: Maybe<Scalars["String"]["output"]>;
};

export type BoundaryKind =
  | "ASSUMPTION"
  | "CLIENT_INPUT"
  | "EXCLUSION"
  | "GUARANTEE";

export type Clause = {
  body: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  kind: ClauseKind;
  title: Scalars["String"]["output"];
};

export type ClauseKind =
  | "CONFIDENTIALITY"
  | "CONTRACTING_PARTY"
  | "FINAL_PROVISIONS"
  | "GOVERNING_LAW"
  | "INTELLECTUAL_PROPERTY"
  | "LIABILITY"
  | "OTHER"
  | "TERMINATION";

export type Deliverable = {
  body: Maybe<Scalars["String"]["output"]>;
  code: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  packageId: Scalars["OID"]["output"];
  price: Maybe<DeliverablePrice>;
  title: Scalars["String"]["output"];
};

export type DeliverablePrice = {
  amount: Maybe<Scalars["Amount_Money"]["output"]>;
  note: Maybe<Scalars["String"]["output"]>;
  period: Maybe<RecurringPeriod>;
  pricing: Pricing;
  unit: Maybe<RateUnit>;
  until: Maybe<Scalars["Date"]["output"]>;
  upperAmount: Maybe<Scalars["Amount_Money"]["output"]>;
};

export type Figure = {
  anchorId: Scalars["OID"]["output"];
  anchorKind: FigureAnchorKind;
  caption: Maybe<Scalars["String"]["output"]>;
  file: FileRef;
  id: Scalars["OID"]["output"];
};

export type FigureAnchorKind = "SECTION" | "USE_CASE";

export type FileRef = {
  name: Scalars["String"]["output"];
  ref: Scalars["AttachmentRef"]["output"];
  type: Scalars["String"]["output"];
};

export type MarkProposalSentCopyInput = {
  name: Scalars["String"]["input"];
  ref: Scalars["AttachmentRef"]["input"];
  type: Scalars["String"]["input"];
};

export type MarkProposalSentInput = {
  copy?: InputMaybe<MarkProposalSentCopyInput>;
  sentAt: Scalars["DateTime"]["input"];
  sentBy: Scalars["EthereumAddress"]["input"];
};

export type Option = {
  adjustments: Array<Adjustment>;
  id: Scalars["OID"]["output"];
  label: Scalars["String"]["output"];
  packageIds: Array<Scalars["OID"]["output"]>;
};

export type Package = {
  code: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  price: Maybe<Scalars["Amount_Money"]["output"]>;
  requires: Array<Scalars["OID"]["output"]>;
  summary: Maybe<Scalars["String"]["output"]>;
  targetDate: Maybe<Scalars["Date"]["output"]>;
};

export type PaymentStep = {
  date: Maybe<Scalars["Date"]["output"]>;
  id: Scalars["OID"]["output"];
  label: Scalars["String"]["output"];
  percentage: Scalars["Amount_Percentage"]["output"];
  trigger: PaymentTrigger;
};

export type PaymentTrigger = "ON_ACCEPTANCE" | "ON_DATE" | "ON_SIGNATURE";

export type Pricing = "FIXED" | "INCLUDED" | "RATE" | "RECURRING";

export type ProposalState = {
  actors: Array<Actor>;
  annexes: Array<Annex>;
  answeredAt: Maybe<Scalars["DateTime"]["output"]>;
  approvedAt: Maybe<Scalars["DateTime"]["output"]>;
  approvedBy: Maybe<Scalars["EthereumAddress"]["output"]>;
  bindingOnSignature: Scalars["Boolean"]["output"];
  boundaries: Array<Boundary>;
  chosenOptionId: Maybe<Scalars["OID"]["output"]>;
  clauses: Array<Clause>;
  code: Maybe<Scalars["String"]["output"]>;
  contractingEntity: Maybe<VaultRef>;
  currency: Maybe<Scalars["Currency"]["output"]>;
  deliverables: Array<Deliverable>;
  figures: Array<Figure>;
  leadId: Maybe<Scalars["PHID"]["output"]>;
  options: Array<Option>;
  packages: Array<Package>;
  paymentSteps: Array<PaymentStep>;
  processesPersonalData: Scalars["Boolean"]["output"];
  reason: Maybe<Scalars["String"]["output"]>;
  recipient: Maybe<Recipient>;
  references: Array<Reference>;
  revisesProposalId: Maybe<Scalars["PHID"]["output"]>;
  sections: Array<Section>;
  sentAt: Maybe<Scalars["DateTime"]["output"]>;
  sentBy: Maybe<Scalars["EthereumAddress"]["output"]>;
  sentCopy: Maybe<FileRef>;
  signedCopy: Maybe<FileRef>;
  status: ProposalStatus;
  supersededByProposalId: Maybe<Scalars["PHID"]["output"]>;
  title: Maybe<Scalars["String"]["output"]>;
  useCases: Array<UseCase>;
  validUntil: Maybe<Scalars["Date"]["output"]>;
};

export type ProposalStatus =
  | "ACCEPTED"
  | "APPROVED"
  | "DECLINED"
  | "DRAFT"
  | "SENT"
  | "SUPERSEDED"
  | "WITHDRAWN";

export type RateUnit = "DAY" | "HOUR";

export type Recipient = {
  contactId: Scalars["PHID"]["output"];
  personId: Maybe<Scalars["OID"]["output"]>;
};

export type RecordProposalAnswerInput = {
  accepted: Scalars["Boolean"]["input"];
  answeredAt: Scalars["DateTime"]["input"];
  chosenOptionId?: InputMaybe<Scalars["OID"]["input"]>;
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type RecurringPeriod = "MONTH" | "QUARTER" | "YEAR";

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

export type RemoveActorInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveAdjustmentInput = {
  id: Scalars["OID"]["input"];
  optionId: Scalars["OID"]["input"];
};

export type RemoveAnnexInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveBoundaryInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveClauseInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveDeliverableInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveFigureInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveOptionInput = {
  id: Scalars["OID"]["input"];
};

export type RemovePackageInput = {
  id: Scalars["OID"]["input"];
};

export type RemovePaymentStepInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveReferenceInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveSectionInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveUseCaseInput = {
  id: Scalars["OID"]["input"];
};

export type ReopenProposalInput = {
  _empty?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type ReorderClausesInput = {
  ids: Array<Scalars["OID"]["input"]>;
};

export type ReorderDeliverablesInput = {
  ids: Array<Scalars["OID"]["input"]>;
};

export type ReorderFiguresInput = {
  anchorId: Scalars["OID"]["input"];
  anchorKind: FigureAnchorKind;
  ids: Array<Scalars["OID"]["input"]>;
};

export type ReorderPackagesInput = {
  ids: Array<Scalars["OID"]["input"]>;
};

export type ReorderSectionsInput = {
  ids: Array<Scalars["OID"]["input"]>;
};

export type Section = {
  body: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  kind: SectionKind;
  positioningId: Maybe<Scalars["OID"]["output"]>;
  title: Maybe<Scalars["String"]["output"]>;
};

export type SectionKind =
  | "ACCEPTANCE"
  | "ANNEXES"
  | "ASSUMPTIONS"
  | "DELIVERABLES"
  | "PRICING"
  | "PROSE"
  | "SCHEDULE"
  | "SCOPE"
  | "TERMS";

export type SetDeliverablePriceInput = {
  amount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  period?: InputMaybe<RecurringPeriod>;
  pricing: Pricing;
  unit?: InputMaybe<RateUnit>;
  until?: InputMaybe<Scalars["Date"]["input"]>;
  upperAmount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
};

export type SetProposalDetailsInput = {
  bindingOnSignature?: InputMaybe<Scalars["Boolean"]["input"]>;
  code?: InputMaybe<Scalars["String"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  processesPersonalData?: InputMaybe<Scalars["Boolean"]["input"]>;
  revisesProposalId?: InputMaybe<Scalars["PHID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  validUntil?: InputMaybe<Scalars["Date"]["input"]>;
};

export type SetProposalPartiesContractingEntityInput = {
  id: Scalars["PHID"]["input"];
  title: Scalars["String"]["input"];
};

export type SetProposalPartiesInput = {
  contractingEntity?: InputMaybe<SetProposalPartiesContractingEntityInput>;
  leadId?: InputMaybe<Scalars["PHID"]["input"]>;
  recipient?: InputMaybe<SetProposalPartiesRecipientInput>;
};

export type SetProposalPartiesRecipientInput = {
  contactId: Scalars["PHID"]["input"];
  personId?: InputMaybe<Scalars["OID"]["input"]>;
};

export type SetSentCopyFileInput = {
  name: Scalars["String"]["input"];
  ref: Scalars["AttachmentRef"]["input"];
  type: Scalars["String"]["input"];
};

export type SetSentCopyInput = {
  file?: InputMaybe<SetSentCopyFileInput>;
};

export type SetSignedCopyFileInput = {
  name: Scalars["String"]["input"];
  ref: Scalars["AttachmentRef"]["input"];
  type: Scalars["String"]["input"];
};

export type SetSignedCopyInput = {
  file?: InputMaybe<SetSignedCopyFileInput>;
};

export type SupersedeProposalInput = {
  supersededByProposalId: Scalars["PHID"]["input"];
};

export type UpdateActorInput = {
  code?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateAnnexInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<AnnexKind>;
  partOfAgreement?: InputMaybe<Scalars["Boolean"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateBoundaryInput = {
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<BoundaryKind>;
  packageId?: InputMaybe<Scalars["OID"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateClauseInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<ClauseKind>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateDeliverableInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  code?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  packageId?: InputMaybe<Scalars["OID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateFigureFileInput = {
  name: Scalars["String"]["input"];
  ref: Scalars["AttachmentRef"]["input"];
  type: Scalars["String"]["input"];
};

export type UpdateFigureInput = {
  caption?: InputMaybe<Scalars["String"]["input"]>;
  file?: InputMaybe<UpdateFigureFileInput>;
  id: Scalars["OID"]["input"];
};

export type UpdateOptionInput = {
  id: Scalars["OID"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
  packageIds?: InputMaybe<Array<Scalars["OID"]["input"]>>;
};

export type UpdatePackageInput = {
  code?: InputMaybe<Scalars["String"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  price?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  requires?: InputMaybe<Array<Scalars["OID"]["input"]>>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  targetDate?: InputMaybe<Scalars["Date"]["input"]>;
};

export type UpdatePaymentStepInput = {
  date?: InputMaybe<Scalars["Date"]["input"]>;
  id: Scalars["OID"]["input"];
  label?: InputMaybe<Scalars["String"]["input"]>;
  percentage?: InputMaybe<Scalars["Amount_Percentage"]["input"]>;
  trigger?: InputMaybe<PaymentTrigger>;
};

export type UpdateSectionInput = {
  body?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  positioningId?: InputMaybe<Scalars["OID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateUseCaseInput = {
  actorId?: InputMaybe<Scalars["OID"]["input"]>;
  body?: InputMaybe<Scalars["String"]["input"]>;
  code?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  packageId?: InputMaybe<Scalars["OID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type UseCase = {
  actorId: Scalars["OID"]["output"];
  body: Maybe<Scalars["String"]["output"]>;
  code: Scalars["String"]["output"];
  id: Scalars["OID"]["output"];
  packageId: Scalars["OID"]["output"];
  title: Scalars["String"]["output"];
};

export type VaultRef = {
  id: Scalars["PHID"]["output"];
  title: Scalars["String"]["output"];
};

export type WithdrawProposalInput = {
  reason: Scalars["String"]["input"];
};
