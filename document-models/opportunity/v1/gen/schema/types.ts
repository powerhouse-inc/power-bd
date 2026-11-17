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

export type AddConditionFactNoteInput = {
  id: Scalars["PHID"]["input"];
  title: Scalars["String"]["input"];
};

export type AddConditionInput = {
  checkedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  decisionIds?: InputMaybe<Array<Scalars["PHID"]["input"]>>;
  factNotes?: InputMaybe<Array<AddConditionFactNoteInput>>;
  id: Scalars["OID"]["input"];
  kind: ConditionKind;
  source?: InputMaybe<Scalars["String"]["input"]>;
  state?: InputMaybe<ConditionState>;
  text: Scalars["String"]["input"];
};

export type AddConfidentialItemInput = {
  addedAt: Scalars["DateTime"]["input"];
  addedBy: Scalars["EthereumAddress"]["input"];
  id: Scalars["OID"]["input"];
  subjectContactId?: InputMaybe<Scalars["PHID"]["input"]>;
  text: Scalars["String"]["input"];
};

export type AddInteractionInput = {
  at?: InputMaybe<Scalars["DateTime"]["input"]>;
  id: Scalars["OID"]["input"];
  kind: InteractionKind;
  notesSource?: InputMaybe<AddInteractionNotesSourceInput>;
  people?: InputMaybe<Array<AddInteractionPersonInput>>;
  status: InteractionStatus;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  teamMembers?: InputMaybe<Array<Scalars["EthereumAddress"]["input"]>>;
  timeZone?: InputMaybe<Scalars["String"]["input"]>;
};

export type AddInteractionNotesSourceInput = {
  id: Scalars["PHID"]["input"];
  title: Scalars["String"]["input"];
};

export type AddInteractionPersonInput = {
  contactId: Scalars["PHID"]["input"];
  personId: Scalars["OID"]["input"];
};

export type AddNextStepInput = {
  dueDate?: InputMaybe<Scalars["Date"]["input"]>;
  id: Scalars["OID"]["input"];
  owner?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
  text: Scalars["String"]["input"];
};

export type AddPartnerInput = {
  country?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  leadId?: InputMaybe<Scalars["PHID"]["input"]>;
  organisationId: Scalars["PHID"]["input"];
  role?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<PartnerStatus>;
};

export type AddReferenceInput = {
  documentId: Scalars["PHID"]["input"];
  id: Scalars["OID"]["input"];
  kind: ReferenceKind;
  title: Scalars["String"]["input"];
};

export type AddStepInput = {
  at: Scalars["DateTime"]["input"];
  checkedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  id: Scalars["OID"]["input"];
  kind: StepKind;
  label: Scalars["String"]["input"];
  source?: InputMaybe<Scalars["String"]["input"]>;
  timeZone: Scalars["String"]["input"];
};

export type AttemptLimit = {
  checkedAt: Scalars["DateTime"]["output"];
  max: Scalars["Int"]["output"];
  source: Scalars["String"]["output"];
  withdrawnCounts: Scalars["Boolean"]["output"];
};

export type Blocked = {
  decisionId: Maybe<Scalars["PHID"]["output"]>;
  text: Maybe<Scalars["String"]["output"]>;
};

export type ClearAttemptLimitInput = {
  _empty?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type ClearBlockedInput = {
  _empty?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CompleteNextStepInput = {
  doneAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
};

export type Condition = {
  checkedAt: Scalars["DateTime"]["output"];
  decisionIds: Array<Scalars["PHID"]["output"]>;
  factNotes: Array<VaultRef>;
  id: Scalars["OID"]["output"];
  kind: ConditionKind;
  source: Scalars["String"]["output"];
  state: ConditionState;
  text: Scalars["String"]["output"];
};

export type ConditionKind =
  | "CONSORTIUM"
  | "COUNTRY"
  | "CO_FUNDING"
  | "ELIGIBILITY"
  | "LEGAL_FORM"
  | "OTHER"
  | "PURPOSE"
  | "READINESS";

export type ConditionState =
  | "MET"
  | "NOT_MET"
  | "UNKNOWN"
  | "WAITING_ON_DECISION";

export type ConfidentialItem = {
  addedAt: Scalars["DateTime"]["output"];
  addedBy: Scalars["EthereumAddress"]["output"];
  id: Scalars["OID"]["output"];
  subjectContactId: Maybe<Scalars["PHID"]["output"]>;
  text: Scalars["String"]["output"];
};

export type ContactLink = {
  contactId: Scalars["PHID"]["output"];
  id: Scalars["OID"]["output"];
  personId: Maybe<Scalars["OID"]["output"]>;
  role: Maybe<Scalars["String"]["output"]>;
};

export type DecideGoNoGoInput = {
  attemptsLeft?: InputMaybe<Scalars["Int"]["input"]>;
  decidedAt: Scalars["DateTime"]["input"];
  decidedBy?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
  decision: GoNoGo;
  id: Scalars["OID"]["input"];
  reason: Scalars["String"]["input"];
};

export type Fit = "BEST" | "GOOD" | "LATER" | "UNLIKELY";

export type GoNoGo = "GO" | "NO_GO";

export type GoNoGoDecision = {
  attemptsLeft: Maybe<Scalars["Int"]["output"]>;
  decidedAt: Scalars["DateTime"]["output"];
  decidedBy: Scalars["EthereumAddress"]["output"];
  decision: GoNoGo;
  id: Scalars["OID"]["output"];
  reason: Scalars["String"]["output"];
};

export type Instrument =
  | "ACCELERATOR"
  | "CONSORTIUM_CALL"
  | "EQUITY"
  | "FELLOWSHIP"
  | "GRANT"
  | "IN_KIND"
  | "MIXED"
  | "PRIZE";

export type Interaction = {
  at: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["OID"]["output"];
  kind: InteractionKind;
  notesSource: Maybe<VaultRef>;
  people: Array<PersonRef>;
  status: InteractionStatus;
  summary: Maybe<Scalars["String"]["output"]>;
  teamMembers: Array<Scalars["EthereumAddress"]["output"]>;
  timeZone: Maybe<Scalars["String"]["output"]>;
};

export type InteractionKind =
  | "CALL"
  | "EMAIL"
  | "EVENT"
  | "MEETING"
  | "MESSAGE"
  | "OTHER";

export type InteractionStatus = "CANCELLED" | "HELD" | "SCHEDULED";

export type LinkContactInput = {
  contactId: Scalars["PHID"]["input"];
  id: Scalars["OID"]["input"];
  personId?: InputMaybe<Scalars["OID"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
};

export type MarkConditionInput = {
  checkedAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
  state: ConditionState;
};

export type MarkSubmissionInput = {
  id: Scalars["OID"]["input"];
  stepId?: InputMaybe<Scalars["OID"]["input"]>;
  submittedAt: Scalars["DateTime"]["input"];
  submittedBy: Scalars["EthereumAddress"]["input"];
  where?: InputMaybe<Scalars["String"]["input"]>;
};

export type NextStep = {
  doneAt: Maybe<Scalars["DateTime"]["output"]>;
  dueDate: Maybe<Scalars["Date"]["output"]>;
  id: Scalars["OID"]["output"];
  owner: Maybe<Scalars["EthereumAddress"]["output"]>;
  text: Scalars["String"]["output"];
};

export type OpportunityState = {
  amount: Maybe<Scalars["Amount_Money"]["output"]>;
  applyingEntity: Maybe<VaultRef>;
  attemptLimit: Maybe<AttemptLimit>;
  blocked: Maybe<Blocked>;
  closedAt: Maybe<Scalars["DateTime"]["output"]>;
  conditions: Array<Condition>;
  confidentialItems: Array<ConfidentialItem>;
  contactLinks: Array<ContactLink>;
  coordinatorId: Maybe<Scalars["PHID"]["output"]>;
  currency: Maybe<Scalars["Currency"]["output"]>;
  decideBy: Maybe<Scalars["Date"]["output"]>;
  expectedOpening: Maybe<Scalars["Date"]["output"]>;
  fit: Maybe<Fit>;
  fitReasoning: Maybe<VaultRef>;
  funderId: Maybe<Scalars["PHID"]["output"]>;
  fundingRate: Maybe<Scalars["Amount_Percentage"]["output"]>;
  goNoGoDecisions: Array<GoNoGoDecision>;
  instrument: Maybe<Instrument>;
  interactions: Array<Interaction>;
  name: Maybe<Scalars["String"]["output"]>;
  nextSteps: Array<NextStep>;
  owner: Maybe<Scalars["EthereumAddress"]["output"]>;
  partners: Array<Partner>;
  programme: Maybe<VaultRef>;
  references: Array<Reference>;
  rolling: Scalars["Boolean"]["output"];
  roundLabel: Maybe<Scalars["String"]["output"]>;
  roundOpenedAt: Maybe<Scalars["DateTime"]["output"]>;
  status: OpportunityStatus;
  statusReason: Maybe<Scalars["String"]["output"]>;
  steps: Array<Step>;
  submissions: Array<Submission>;
  whereToApply: Maybe<Scalars["String"]["output"]>;
};

export type OpportunityStatus =
  | "AWARDED"
  | "DECIDING"
  | "NEXT_STAGE"
  | "NO_GO"
  | "PREPARING"
  | "REJECTED"
  | "SUBMITTED"
  | "TO_EVALUATE"
  | "WATCHING"
  | "WITHDRAWN";

export type Partner = {
  country: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  leadId: Maybe<Scalars["PHID"]["output"]>;
  organisationId: Scalars["PHID"]["output"];
  role: Maybe<Scalars["String"]["output"]>;
  status: PartnerStatus;
};

export type PartnerStatus = "ASKED" | "COMMITTED" | "INTERESTED" | "SIGNED";

export type PersonRef = {
  contactId: Scalars["PHID"]["output"];
  personId: Scalars["OID"]["output"];
};

export type RecordSubmissionOutcomeInput = {
  amount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  id: Scalars["OID"]["input"];
  receivedAt: Scalars["DateTime"]["input"];
  result: SubmissionResult;
  text?: InputMaybe<Scalars["String"]["input"]>;
};

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

export type RemoveConditionInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveConfidentialItemInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveInteractionInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveNextStepInput = {
  id: Scalars["OID"]["input"];
};

export type RemovePartnerInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveReferenceInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveStepInput = {
  id: Scalars["OID"]["input"];
};

export type ReopenNextStepInput = {
  id: Scalars["OID"]["input"];
};

export type SetApplyingEntityEntityInput = {
  id: Scalars["PHID"]["input"];
  title: Scalars["String"]["input"];
};

export type SetApplyingEntityInput = {
  entity?: InputMaybe<SetApplyingEntityEntityInput>;
};

export type SetAttemptLimitInput = {
  checkedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  max: Scalars["Int"]["input"];
  source?: InputMaybe<Scalars["String"]["input"]>;
  withdrawnCounts: Scalars["Boolean"]["input"];
};

export type SetBlockedInput = {
  decisionId?: InputMaybe<Scalars["PHID"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetCoordinatorInput = {
  coordinatorId?: InputMaybe<Scalars["PHID"]["input"]>;
};

export type SetDecideByInput = {
  decideBy?: InputMaybe<Scalars["Date"]["input"]>;
};

export type SetExpectedOpeningInput = {
  expectedOpening?: InputMaybe<Scalars["Date"]["input"]>;
};

export type SetFitInput = {
  fit?: InputMaybe<Fit>;
  reasoning?: InputMaybe<SetFitReasoningInput>;
};

export type SetFitReasoningInput = {
  id: Scalars["PHID"]["input"];
  title: Scalars["String"]["input"];
};

export type SetOpportunityDetailsInput = {
  amount?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  funderId?: InputMaybe<Scalars["PHID"]["input"]>;
  fundingRate?: InputMaybe<Scalars["Amount_Percentage"]["input"]>;
  instrument?: InputMaybe<Instrument>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  programme?: InputMaybe<SetOpportunityDetailsProgrammeInput>;
  rolling?: InputMaybe<Scalars["Boolean"]["input"]>;
  roundLabel?: InputMaybe<Scalars["String"]["input"]>;
  roundOpenedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  whereToApply?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetOpportunityDetailsProgrammeInput = {
  id: Scalars["PHID"]["input"];
  title: Scalars["String"]["input"];
};

export type SetOpportunityStatusInput = {
  changedAt: Scalars["DateTime"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
  status: OpportunityStatus;
};

export type SetOwnerInput = {
  owner?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
};

export type Step = {
  at: Scalars["DateTime"]["output"];
  checkedAt: Scalars["DateTime"]["output"];
  id: Scalars["OID"]["output"];
  kind: StepKind;
  label: Scalars["String"]["output"];
  source: Scalars["String"]["output"];
  targeted: Scalars["Boolean"]["output"];
  timeZone: Scalars["String"]["output"];
};

export type StepKind =
  | "CUT_OFF"
  | "EXPECTED_RESULT"
  | "FULL_PROPOSAL"
  | "INTERVIEW"
  | "LETTER_OF_INTENT"
  | "OTHER"
  | "STAGE";

export type Submission = {
  id: Scalars["OID"]["output"];
  outcome: Maybe<SubmissionOutcome>;
  stepId: Maybe<Scalars["OID"]["output"]>;
  submittedAt: Scalars["DateTime"]["output"];
  submittedBy: Scalars["EthereumAddress"]["output"];
  where: Maybe<Scalars["String"]["output"]>;
};

export type SubmissionOutcome = {
  amount: Maybe<Scalars["Amount_Money"]["output"]>;
  currency: Maybe<Scalars["Currency"]["output"]>;
  receivedAt: Scalars["DateTime"]["output"];
  result: SubmissionResult;
  text: Maybe<Scalars["String"]["output"]>;
};

export type SubmissionResult =
  | "AWARDED"
  | "PASSED"
  | "UNSUCCESSFUL"
  | "WITHDRAWN";

export type TargetCutOffInput = {
  id: Scalars["OID"]["input"];
};

export type UnlinkContactInput = {
  id: Scalars["OID"]["input"];
};

export type UpdateConditionFactNoteInput = {
  id: Scalars["PHID"]["input"];
  title: Scalars["String"]["input"];
};

export type UpdateConditionInput = {
  checkedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  decisionIds?: InputMaybe<Array<Scalars["PHID"]["input"]>>;
  factNotes?: InputMaybe<Array<UpdateConditionFactNoteInput>>;
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<ConditionKind>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateInteractionInput = {
  at?: InputMaybe<Scalars["DateTime"]["input"]>;
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<InteractionKind>;
  notesSource?: InputMaybe<UpdateInteractionNotesSourceInput>;
  people?: InputMaybe<Array<UpdateInteractionPersonInput>>;
  status?: InputMaybe<InteractionStatus>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
  teamMembers?: InputMaybe<Array<Scalars["EthereumAddress"]["input"]>>;
  timeZone?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateInteractionNotesSourceInput = {
  id: Scalars["PHID"]["input"];
  title: Scalars["String"]["input"];
};

export type UpdateInteractionPersonInput = {
  contactId: Scalars["PHID"]["input"];
  personId: Scalars["OID"]["input"];
};

export type UpdateNextStepInput = {
  dueDate?: InputMaybe<Scalars["Date"]["input"]>;
  id: Scalars["OID"]["input"];
  owner?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdatePartnerInput = {
  country?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  leadId?: InputMaybe<Scalars["PHID"]["input"]>;
  organisationId?: InputMaybe<Scalars["PHID"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<PartnerStatus>;
};

export type UpdateStepInput = {
  at?: InputMaybe<Scalars["DateTime"]["input"]>;
  checkedAt?: InputMaybe<Scalars["DateTime"]["input"]>;
  id: Scalars["OID"]["input"];
  kind?: InputMaybe<StepKind>;
  label?: InputMaybe<Scalars["String"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  timeZone?: InputMaybe<Scalars["String"]["input"]>;
};

export type VaultRef = {
  id: Scalars["PHID"]["output"];
  title: Scalars["String"]["output"];
};
