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

export type AddAngleInput = {
  fit: Fit;
  id: Scalars["OID"]["input"];
  positioningId?: InputMaybe<Scalars["OID"]["input"]>;
  summary: Scalars["String"]["input"];
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

export type AddReferenceInput = {
  documentId: Scalars["PHID"]["input"];
  id: Scalars["OID"]["input"];
  kind: ReferenceKind;
  title: Scalars["String"]["input"];
};

export type Angle = {
  fit: Fit;
  id: Scalars["OID"]["output"];
  positioningId: Maybe<Scalars["OID"]["output"]>;
  summary: Scalars["String"]["output"];
};

export type ApproveMessageInput = {
  approvedAt: Scalars["DateTime"]["input"];
  approvedBy: Scalars["EthereumAddress"]["input"];
  id: Scalars["OID"]["input"];
};

export type CompleteNextStepInput = {
  doneAt: Scalars["DateTime"]["input"];
  id: Scalars["OID"]["input"];
};

export type ConfidentialItem = {
  addedAt: Scalars["DateTime"]["output"];
  addedBy: Scalars["EthereumAddress"]["output"];
  id: Scalars["OID"]["output"];
  subjectContactId: Maybe<Scalars["PHID"]["output"]>;
  text: Scalars["String"]["output"];
};

export type ContactLink = {
  contactId: Scalars["PHID"]["output"];
  dealRole: Maybe<DealRole>;
  id: Scalars["OID"]["output"];
  personId: Maybe<Scalars["OID"]["output"]>;
  role: Maybe<Scalars["String"]["output"]>;
};

export type DealRole =
  | "BLOCKER"
  | "CHAMPION"
  | "DECISION_MAKER"
  | "INFLUENCER"
  | "USER";

export type DiscardMessageInput = {
  id: Scalars["OID"]["input"];
};

export type DraftMessageInput = {
  angleId?: InputMaybe<Scalars["OID"]["input"]>;
  body: Scalars["String"]["input"];
  channel: MessageChannel;
  draftedAt: Scalars["DateTime"]["input"];
  draftedBy: Scalars["EthereumAddress"]["input"];
  id: Scalars["OID"]["input"];
  recipient?: InputMaybe<DraftMessageRecipientInput>;
  subject?: InputMaybe<Scalars["String"]["input"]>;
};

export type DraftMessageRecipientInput = {
  contactId: Scalars["PHID"]["input"];
  personId: Scalars["OID"]["input"];
};

export type Fit = "BEST" | "GOOD" | "LATER" | "UNLIKELY";

export type Interaction = {
  at: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["OID"]["output"];
  kind: InteractionKind;
  notesSource: Maybe<VaultRef>;
  outcome: Maybe<InteractionOutcome>;
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

export type InteractionOutcome = "NEGATIVE" | "NEUTRAL" | "POSITIVE";

export type InteractionStatus = "CANCELLED" | "HELD" | "SCHEDULED";

export type LeadKind = "EXCHANGE" | "INVESTOR" | "PARTNERSHIP" | "SALES";

export type LeadSource =
  | "EVENT"
  | "INBOUND"
  | "OTHER"
  | "OUTBOUND"
  | "PARTNER"
  | "REFERRAL";

export type LeadState = {
  angles: Array<Angle>;
  closedAt: Maybe<Scalars["DateTime"]["output"]>;
  confidentialItems: Array<ConfidentialItem>;
  contactLinks: Array<ContactLink>;
  expectedCloseDate: Maybe<Scalars["Date"]["output"]>;
  interactions: Array<Interaction>;
  kind: Maybe<LeadKind>;
  messages: Array<Message>;
  name: Maybe<Scalars["String"]["output"]>;
  nextSteps: Array<NextStep>;
  organisationId: Maybe<Scalars["PHID"]["output"]>;
  owner: Maybe<Scalars["EthereumAddress"]["output"]>;
  parkedFrom: Maybe<LeadStatus>;
  references: Array<Reference>;
  source: Maybe<LeadSource>;
  sourceDetail: Maybe<Scalars["String"]["output"]>;
  status: LeadStatus;
  statusReason: Maybe<Scalars["String"]["output"]>;
};

export type LeadStatus =
  | "IN_TOUCH"
  | "LOST"
  | "MEETING_SET"
  | "MET"
  | "PARKED"
  | "PROPOSAL"
  | "TO_CONTACT"
  | "WON";

export type LinkContactInput = {
  contactId: Scalars["PHID"]["input"];
  id: Scalars["OID"]["input"];
  personId?: InputMaybe<Scalars["OID"]["input"]>;
  role?: InputMaybe<Scalars["String"]["input"]>;
};

export type MarkMessageSentInput = {
  id: Scalars["OID"]["input"];
  sentAt: Scalars["DateTime"]["input"];
  sentBy: Scalars["EthereumAddress"]["input"];
};

export type Message = {
  angleId: Maybe<Scalars["OID"]["output"]>;
  approvedAt: Maybe<Scalars["DateTime"]["output"]>;
  approvedBy: Maybe<Scalars["EthereumAddress"]["output"]>;
  body: Scalars["String"]["output"];
  channel: MessageChannel;
  draftedAt: Scalars["DateTime"]["output"];
  draftedBy: Scalars["EthereumAddress"]["output"];
  id: Scalars["OID"]["output"];
  recipient: Maybe<PersonRef>;
  sentAt: Maybe<Scalars["DateTime"]["output"]>;
  sentBy: Maybe<Scalars["EthereumAddress"]["output"]>;
  status: MessageStatus;
  subject: Maybe<Scalars["String"]["output"]>;
};

export type MessageChannel = "EMAIL" | "LINKEDIN" | "OTHER";

export type MessageStatus = "APPROVED" | "DISCARDED" | "DRAFT" | "SENT";

export type NextStep = {
  doneAt: Maybe<Scalars["DateTime"]["output"]>;
  dueDate: Maybe<Scalars["Date"]["output"]>;
  id: Scalars["OID"]["output"];
  owner: Maybe<Scalars["EthereumAddress"]["output"]>;
  text: Scalars["String"]["output"];
};

export type ParkLeadInput = {
  parkedAt: Scalars["DateTime"]["input"];
  reason: Scalars["String"]["input"];
};

export type PersonRef = {
  contactId: Scalars["PHID"]["output"];
  personId: Scalars["OID"]["output"];
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

export type RemoveAngleInput = {
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

export type RemoveReferenceInput = {
  id: Scalars["OID"]["input"];
};

export type ReopenMessageInput = {
  id: Scalars["OID"]["input"];
};

export type ReopenNextStepInput = {
  id: Scalars["OID"]["input"];
};

export type SetContactLinkDealRoleInput = {
  dealRole?: InputMaybe<DealRole>;
  id: Scalars["OID"]["input"];
};

export type SetExpectedCloseInput = {
  expectedCloseDate?: InputMaybe<Scalars["Date"]["input"]>;
};

export type SetInteractionOutcomeInput = {
  id: Scalars["OID"]["input"];
  outcome?: InputMaybe<InteractionOutcome>;
};

export type SetLeadDetailsInput = {
  kind?: InputMaybe<LeadKind>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  organisationId?: InputMaybe<Scalars["PHID"]["input"]>;
};

export type SetLeadSourceInput = {
  source?: InputMaybe<LeadSource>;
  sourceDetail?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetLeadStatusInput = {
  changedAt: Scalars["DateTime"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
  status: LeadStatus;
};

export type SetOwnerInput = {
  owner?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
};

export type UnlinkContactInput = {
  id: Scalars["OID"]["input"];
};

export type UnparkLeadInput = {
  _empty?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type UpdateAngleInput = {
  fit?: InputMaybe<Fit>;
  id: Scalars["OID"]["input"];
  positioningId?: InputMaybe<Scalars["OID"]["input"]>;
  summary?: InputMaybe<Scalars["String"]["input"]>;
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

export type UpdateMessageInput = {
  angleId?: InputMaybe<Scalars["OID"]["input"]>;
  body?: InputMaybe<Scalars["String"]["input"]>;
  channel?: InputMaybe<MessageChannel>;
  id: Scalars["OID"]["input"];
  recipient?: InputMaybe<UpdateMessageRecipientInput>;
  subject?: InputMaybe<Scalars["String"]["input"]>;
};

export type UpdateMessageRecipientInput = {
  contactId: Scalars["PHID"]["input"];
  personId: Scalars["OID"]["input"];
};

export type UpdateNextStepInput = {
  dueDate?: InputMaybe<Scalars["Date"]["input"]>;
  id: Scalars["OID"]["input"];
  owner?: InputMaybe<Scalars["EthereumAddress"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
};

export type VaultRef = {
  id: Scalars["PHID"]["output"];
  title: Scalars["String"]["output"];
};
