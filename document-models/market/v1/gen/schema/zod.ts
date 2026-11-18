/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddPublishedFigureInput,
  AddSegmentInput,
  ApproveSizeInput,
  Axis,
  LinkPlayerEvidenceInput,
  LinkSegmentOrganisationInput,
  MapAxes,
  MarketState,
  MovePlayerInput,
  OurPosition,
  PlacePlayerInput,
  Player,
  PublishedFigure,
  RemovePlayerInput,
  RemovePublishedFigureInput,
  RemoveSegmentInput,
  ReopenSizeInput,
  Segment,
  SegmentFigure,
  SetAxesInput,
  SetMarketDetailsInput,
  SetOurPositionInput,
  SetPlayerNoteInput,
  SetSegmentSourceInput,
  SizeStatus,
  Source,
  UnlinkPlayerEvidenceInput,
  UnlinkSegmentOrganisationInput,
  UpdateSegmentInput,
  VaultRef,
} from "./types.js";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const SegmentFigureSchema = z.enum(["ACCOUNTS", "ANNUAL_VALUE"]);

export const SizeStatusSchema = z.enum(["APPROVED", "DRAFT"]);

export function AddPublishedFigureInputSchema(): z.ZodObject<
  Properties<AddPublishedFigureInput>
> {
  return z.object({
    amount: z.number(),
    currency: z.string(),
    id: z.string(),
    label: z.string(),
    sourceDocumentId: z.string().nullish(),
    sourceTitle: z.string(),
    sourceUrl: z.url().nullish(),
    year: z.number().nullish(),
  });
}

export function AddSegmentInputSchema(): z.ZodObject<
  Properties<AddSegmentInput>
> {
  return z.object({
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function ApproveSizeInputSchema(): z.ZodObject<
  Properties<ApproveSizeInput>
> {
  return z.object({
    approvedAt: z.iso.datetime(),
    approvedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      }),
  });
}

export function AxisSchema(): z.ZodObject<Properties<Axis>> {
  return z.object({
    __typename: z.literal("Axis").optional(),
    high: z.string(),
    label: z.string(),
    low: z.string(),
  });
}

export function LinkPlayerEvidenceInputSchema(): z.ZodObject<
  Properties<LinkPlayerEvidenceInput>
> {
  return z.object({
    id: z.string(),
    refId: z.string(),
    refTitle: z.string(),
  });
}

export function LinkSegmentOrganisationInputSchema(): z.ZodObject<
  Properties<LinkSegmentOrganisationInput>
> {
  return z.object({
    id: z.string(),
    organisationId: z.string(),
  });
}

export function MapAxesSchema(): z.ZodObject<Properties<MapAxes>> {
  return z.object({
    __typename: z.literal("MapAxes").optional(),
    x: z.lazy(() => AxisSchema()),
    y: z.lazy(() => AxisSchema()),
  });
}

export function MarketStateSchema(): z.ZodObject<Properties<MarketState>> {
  return z.object({
    __typename: z.literal("MarketState").optional(),
    axes: z.lazy(() => MapAxesSchema().nullish()),
    currency: z.string().nullish(),
    description: z.string().nullish(),
    geography: z.string().nullish(),
    horizonYears: z.number().nullish(),
    name: z.string().nullish(),
    players: z.array(z.lazy(() => PlayerSchema())),
    publishedFigures: z.array(z.lazy(() => PublishedFigureSchema())),
    segments: z.array(z.lazy(() => SegmentSchema())),
    sizeApprovedAt: z.iso.datetime().nullish(),
    sizeApprovedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    sizeStatus: SizeStatusSchema,
    us: z.lazy(() => OurPositionSchema().nullish()),
  });
}

export function MovePlayerInputSchema(): z.ZodObject<
  Properties<MovePlayerInput>
> {
  return z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
  });
}

export function OurPositionSchema(): z.ZodObject<Properties<OurPosition>> {
  return z.object({
    __typename: z.literal("OurPosition").optional(),
    note: z.string().nullish(),
    positioningId: z.string().nullish(),
    x: z.number(),
    y: z.number(),
  });
}

export function PlacePlayerInputSchema(): z.ZodObject<
  Properties<PlacePlayerInput>
> {
  return z.object({
    id: z.string(),
    note: z.string().nullish(),
    organisationId: z.string(),
    x: z.number(),
    y: z.number(),
  });
}

export function PlayerSchema(): z.ZodObject<Properties<Player>> {
  return z.object({
    __typename: z.literal("Player").optional(),
    evidence: z.array(z.lazy(() => VaultRefSchema())),
    id: z.string(),
    note: z.string().nullish(),
    organisationId: z.string(),
    x: z.number(),
    y: z.number(),
  });
}

export function PublishedFigureSchema(): z.ZodObject<
  Properties<PublishedFigure>
> {
  return z.object({
    __typename: z.literal("PublishedFigure").optional(),
    amount: z.number(),
    currency: z.string(),
    id: z.string(),
    label: z.string(),
    source: z.lazy(() => SourceSchema()),
    year: z.number().nullish(),
  });
}

export function RemovePlayerInputSchema(): z.ZodObject<
  Properties<RemovePlayerInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemovePublishedFigureInputSchema(): z.ZodObject<
  Properties<RemovePublishedFigureInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveSegmentInputSchema(): z.ZodObject<
  Properties<RemoveSegmentInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function ReopenSizeInputSchema(): z.ZodObject<
  Properties<ReopenSizeInput>
> {
  return z.object({
    _empty: z.boolean().nullish(),
  });
}

export function SegmentSchema(): z.ZodObject<Properties<Segment>> {
  return z.object({
    __typename: z.literal("Segment").optional(),
    accounts: z.number().nullish(),
    accountsSource: z.lazy(() => SourceSchema().nullish()),
    annualValue: z.number().nullish(),
    annualValueSource: z.lazy(() => SourceSchema().nullish()),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    organisationIds: z.array(z.string()),
    serviceable: z.boolean(),
    targetAccounts: z.number().nullish(),
  });
}

export function SetAxesInputSchema(): z.ZodObject<Properties<SetAxesInput>> {
  return z.object({
    xHigh: z.string(),
    xLabel: z.string(),
    xLow: z.string(),
    yHigh: z.string(),
    yLabel: z.string(),
    yLow: z.string(),
  });
}

export function SetMarketDetailsInputSchema(): z.ZodObject<
  Properties<SetMarketDetailsInput>
> {
  return z.object({
    currency: z.string().nullish(),
    description: z.string().nullish(),
    geography: z.string().nullish(),
    horizonYears: z.number().nullish(),
    name: z.string().nullish(),
  });
}

export function SetOurPositionInputSchema(): z.ZodObject<
  Properties<SetOurPositionInput>
> {
  return z.object({
    note: z.string().nullish(),
    positioningId: z.string().nullish(),
    x: z.number(),
    y: z.number(),
  });
}

export function SetPlayerNoteInputSchema(): z.ZodObject<
  Properties<SetPlayerNoteInput>
> {
  return z.object({
    id: z.string(),
    note: z.string().nullish(),
  });
}

export function SetSegmentSourceInputSchema(): z.ZodObject<
  Properties<SetSegmentSourceInput>
> {
  return z.object({
    documentId: z.string().nullish(),
    figure: SegmentFigureSchema,
    id: z.string(),
    title: z.string().nullish(),
    url: z.url().nullish(),
  });
}

export function SourceSchema(): z.ZodObject<Properties<Source>> {
  return z.object({
    __typename: z.literal("Source").optional(),
    documentId: z.string().nullish(),
    title: z.string(),
    url: z.url().nullish(),
  });
}

export function UnlinkPlayerEvidenceInputSchema(): z.ZodObject<
  Properties<UnlinkPlayerEvidenceInput>
> {
  return z.object({
    id: z.string(),
    refId: z.string(),
  });
}

export function UnlinkSegmentOrganisationInputSchema(): z.ZodObject<
  Properties<UnlinkSegmentOrganisationInput>
> {
  return z.object({
    id: z.string(),
    organisationId: z.string(),
  });
}

export function UpdateSegmentInputSchema(): z.ZodObject<
  Properties<UpdateSegmentInput>
> {
  return z.object({
    accounts: z.number().nullish(),
    annualValue: z.number().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    serviceable: z.boolean().nullish(),
    targetAccounts: z.number().nullish(),
  });
}

export function VaultRefSchema(): z.ZodObject<Properties<VaultRef>> {
  return z.object({
    __typename: z.literal("VaultRef").optional(),
    id: z.string(),
    title: z.string(),
  });
}
