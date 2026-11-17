/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddRowsInput,
  AddRowsRowInput,
  ExcludeRowInput,
  InvestorListState,
  InvestorRow,
  InvestorRowState,
  LinkRowComparableInput,
  MarkRowEngagedInput,
  RelistRowInput,
  RemoveRowInput,
  SetRowThesisInput,
  SetRowThesisNoteInput,
  ShortlistRowInput,
  UnlinkRowComparableInput,
  UpdateRowInput,
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

export const InvestorRowStateSchema = z.enum([
  "ENGAGED",
  "EXCLUDED",
  "LISTED",
  "SHORTLISTED",
]);

export function AddRowsInputSchema(): z.ZodObject<Properties<AddRowsInput>> {
  return z.object({
    rows: z.array(z.lazy(() => AddRowsRowInputSchema())),
  });
}

export function AddRowsRowInputSchema(): z.ZodObject<
  Properties<AddRowsRowInput>
> {
  return z.object({
    id: z.string(),
    name: z.string(),
    sourceList: z.string().nullish(),
    website: z.string().nullish(),
  });
}

export function ExcludeRowInputSchema(): z.ZodObject<
  Properties<ExcludeRowInput>
> {
  return z.object({
    id: z.string(),
    reason: z.string(),
  });
}

export function InvestorListStateSchema(): z.ZodObject<
  Properties<InvestorListState>
> {
  return z.object({
    __typename: z.literal("InvestorListState").optional(),
    rows: z.array(z.lazy(() => InvestorRowSchema())),
  });
}

export function InvestorRowSchema(): z.ZodObject<Properties<InvestorRow>> {
  return z.object({
    __typename: z.literal("InvestorRow").optional(),
    comparables: z.array(z.lazy(() => VaultRefSchema())),
    exclusionReason: z.string().nullish(),
    id: z.string(),
    leadId: z.string().nullish(),
    name: z.string(),
    organisationId: z.string().nullish(),
    sourceList: z.string().nullish(),
    state: InvestorRowStateSchema,
    thesisNote: z.lazy(() => VaultRefSchema().nullish()),
    website: z.string().nullish(),
  });
}

export function LinkRowComparableInputSchema(): z.ZodObject<
  Properties<LinkRowComparableInput>
> {
  return z.object({
    comparableId: z.string(),
    rowId: z.string(),
    title: z.string(),
  });
}

export function MarkRowEngagedInputSchema(): z.ZodObject<
  Properties<MarkRowEngagedInput>
> {
  return z.object({
    id: z.string(),
    leadId: z.string(),
    organisationId: z.string(),
  });
}

export function RelistRowInputSchema(): z.ZodObject<
  Properties<RelistRowInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveRowInputSchema(): z.ZodObject<
  Properties<RemoveRowInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function SetRowThesisInputSchema(): z.ZodObject<
  Properties<SetRowThesisInput>
> {
  return z.object({
    id: z.string(),
    thesisNote: z.lazy(() => SetRowThesisNoteInputSchema().nullish()),
  });
}

export function SetRowThesisNoteInputSchema(): z.ZodObject<
  Properties<SetRowThesisNoteInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function ShortlistRowInputSchema(): z.ZodObject<
  Properties<ShortlistRowInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function UnlinkRowComparableInputSchema(): z.ZodObject<
  Properties<UnlinkRowComparableInput>
> {
  return z.object({
    comparableId: z.string(),
    rowId: z.string(),
  });
}

export function UpdateRowInputSchema(): z.ZodObject<
  Properties<UpdateRowInput>
> {
  return z.object({
    id: z.string(),
    name: z.string().nullish(),
    sourceList: z.string().nullish(),
    website: z.string().nullish(),
  });
}

export function VaultRefSchema(): z.ZodObject<Properties<VaultRef>> {
  return z.object({
    __typename: z.literal("VaultRef").optional(),
    id: z.string(),
    title: z.string(),
  });
}
