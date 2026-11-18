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

export type AddPublishedFigureInput = {
  amount: Scalars["Amount_Money"]["input"];
  currency: Scalars["Currency"]["input"];
  id: Scalars["OID"]["input"];
  label: Scalars["String"]["input"];
  sourceDocumentId?: InputMaybe<Scalars["PHID"]["input"]>;
  sourceTitle: Scalars["String"]["input"];
  sourceUrl?: InputMaybe<Scalars["URL"]["input"]>;
  year?: InputMaybe<Scalars["Int"]["input"]>;
};

export type AddSegmentInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name: Scalars["String"]["input"];
};

export type ApproveSizeInput = {
  approvedAt: Scalars["DateTime"]["input"];
  approvedBy: Scalars["EthereumAddress"]["input"];
};

export type Axis = {
  /** The high end, at the right or top. */
  high: Scalars["String"]["output"];
  /** What the axis measures. */
  label: Scalars["String"]["output"];
  /** The low end, at the left or bottom. */
  low: Scalars["String"]["output"];
};

export type LinkPlayerEvidenceInput = {
  id: Scalars["OID"]["input"];
  refId: Scalars["PHID"]["input"];
  refTitle: Scalars["String"]["input"];
};

export type LinkSegmentOrganisationInput = {
  id: Scalars["OID"]["input"];
  organisationId: Scalars["PHID"]["input"];
};

export type MapAxes = {
  x: Axis;
  y: Axis;
};

export type MarketState = {
  axes: Maybe<MapAxes>;
  /** EUR for a new market. */
  currency: Maybe<Scalars["Currency"]["output"]>;
  /** Who buys, and which problem they have. */
  description: Maybe<Scalars["String"]["output"]>;
  /** Where: a country, a region, or 'EU'. */
  geography: Maybe<Scalars["String"]["output"]>;
  /** Years the obtainable market (SOM) is counted over. */
  horizonYears: Maybe<Scalars["Int"]["output"]>;
  name: Maybe<Scalars["String"]["output"]>;
  players: Array<Player>;
  /** Published figures beside the computed ones, as a cross-check. */
  publishedFigures: Array<PublishedFigure>;
  segments: Array<Segment>;
  sizeApprovedAt: Maybe<Scalars["DateTime"]["output"]>;
  sizeApprovedBy: Maybe<Scalars["EthereumAddress"]["output"]>;
  /** Whether a person has approved the figures for use outside the team. */
  sizeStatus: SizeStatus;
  /** Where Powerhouse stands on this market's map. */
  us: Maybe<OurPosition>;
};

export type MovePlayerInput = {
  id: Scalars["OID"]["input"];
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
};

export type OurPosition = {
  note: Maybe<Scalars["String"]["output"]>;
  /** The Playbook positioning statement this position stands for, if any. */
  positioningId: Maybe<Scalars["OID"]["output"]>;
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type PlacePlayerInput = {
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
  organisationId: Scalars["PHID"]["input"];
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
};

export type Player = {
  evidence: Array<VaultRef>;
  id: Scalars["OID"]["output"];
  /** Why it is placed there. */
  note: Maybe<Scalars["String"]["output"]>;
  /** The organisation on the map (an Organisations record). */
  organisationId: Scalars["PHID"]["output"];
  /** 0 to 100 along each axis. */
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type PublishedFigure = {
  amount: Scalars["Amount_Money"]["output"];
  currency: Scalars["Currency"]["output"];
  id: Scalars["OID"]["output"];
  /** What it measures, as the source says it. */
  label: Scalars["String"]["output"];
  source: Source;
  year: Maybe<Scalars["Int"]["output"]>;
};

export type RemovePlayerInput = {
  id: Scalars["OID"]["input"];
};

export type RemovePublishedFigureInput = {
  id: Scalars["OID"]["input"];
};

export type RemoveSegmentInput = {
  id: Scalars["OID"]["input"];
};

export type ReopenSizeInput = {
  _empty?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type Segment = {
  /** How many organisations are in the segment. */
  accounts: Maybe<Scalars["Int"]["output"]>;
  accountsSource: Maybe<Source>;
  /** What one organisation is worth to us per year, in the market's currency. */
  annualValue: Maybe<Scalars["Amount_Money"]["output"]>;
  annualValueSource: Maybe<Source>;
  description: Maybe<Scalars["String"]["output"]>;
  id: Scalars["OID"]["output"];
  name: Scalars["String"]["output"];
  /** Named organisations in the segment (Organisations records). */
  organisationIds: Array<Scalars["PHID"]["output"]>;
  /** True when we can serve the segment today: it counts towards SAM. */
  serviceable: Scalars["Boolean"]["output"];
  /** How many organisations we can win within horizonYears: SOM. */
  targetAccounts: Maybe<Scalars["Int"]["output"]>;
};

/** Which number of a segment a source is for. */
export type SegmentFigure = "ACCOUNTS" | "ANNUAL_VALUE";

export type SetAxesInput = {
  xHigh: Scalars["String"]["input"];
  xLabel: Scalars["String"]["input"];
  xLow: Scalars["String"]["input"];
  yHigh: Scalars["String"]["input"];
  yLabel: Scalars["String"]["input"];
  yLow: Scalars["String"]["input"];
};

export type SetMarketDetailsInput = {
  currency?: InputMaybe<Scalars["Currency"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  geography?: InputMaybe<Scalars["String"]["input"]>;
  horizonYears?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetOurPositionInput = {
  note?: InputMaybe<Scalars["String"]["input"]>;
  positioningId?: InputMaybe<Scalars["OID"]["input"]>;
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
};

export type SetPlayerNoteInput = {
  id: Scalars["OID"]["input"];
  note?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetSegmentSourceInput = {
  documentId?: InputMaybe<Scalars["PHID"]["input"]>;
  figure: SegmentFigure;
  id: Scalars["OID"]["input"];
  title?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["URL"]["input"]>;
};

export type SizeStatus = "APPROVED" | "DRAFT";

/** A source for a number: a vault note, a web page, or both. */
export type Source = {
  documentId: Maybe<Scalars["PHID"]["output"]>;
  title: Scalars["String"]["output"];
  url: Maybe<Scalars["URL"]["output"]>;
};

export type UnlinkPlayerEvidenceInput = {
  id: Scalars["OID"]["input"];
  refId: Scalars["PHID"]["input"];
};

export type UnlinkSegmentOrganisationInput = {
  id: Scalars["OID"]["input"];
  organisationId: Scalars["PHID"]["input"];
};

export type UpdateSegmentInput = {
  accounts?: InputMaybe<Scalars["Int"]["input"]>;
  annualValue?: InputMaybe<Scalars["Amount_Money"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id: Scalars["OID"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  serviceable?: InputMaybe<Scalars["Boolean"]["input"]>;
  targetAccounts?: InputMaybe<Scalars["Int"]["input"]>;
};

export type VaultRef = {
  id: Scalars["PHID"]["output"];
  title: Scalars["String"]["output"];
};
