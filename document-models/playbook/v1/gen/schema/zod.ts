/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddNeverClaimInput,
  AddPositioningInput,
  AddProofCaseInput,
  AddProofEvidenceInput,
  ApprovePositioningInput,
  LinkPositioningComparableInput,
  LinkPositioningProofInput,
  LinkProofComparableInput,
  NeverClaim,
  PlaybookState,
  Positioning,
  PositioningStatus,
  ProofCase,
  RemoveNeverClaimInput,
  RemoveProofCaseInput,
  RemoveProofEvidenceInput,
  RetirePositioningInput,
  UnlinkPositioningComparableInput,
  UnlinkPositioningProofInput,
  UnlinkProofComparableInput,
  UpdateNeverClaimInput,
  UpdatePositioningInput,
  UpdateProofCaseInput,
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

export const PositioningStatusSchema = z.enum(["APPROVED", "DRAFT", "RETIRED"]);

export function AddNeverClaimInputSchema(): z.ZodObject<
  Properties<AddNeverClaimInput>
> {
  return z.object({
    claim: z.string(),
    id: z.string(),
    phrases: z.array(z.string()),
    reason: z.string().nullish(),
  });
}

export function AddPositioningInputSchema(): z.ZodObject<
  Properties<AddPositioningInput>
> {
  return z.object({
    id: z.string(),
    text: z.string(),
    title: z.string(),
  });
}

export function AddProofCaseInputSchema(): z.ZodObject<
  Properties<AddProofCaseInput>
> {
  return z.object({
    id: z.string(),
    mayBeNamedPublicly: z.boolean(),
    summary: z.string().nullish(),
    title: z.string(),
  });
}

export function AddProofEvidenceInputSchema(): z.ZodObject<
  Properties<AddProofEvidenceInput>
> {
  return z.object({
    evidenceId: z.string(),
    proofCaseId: z.string(),
    title: z.string(),
  });
}

export function ApprovePositioningInputSchema(): z.ZodObject<
  Properties<ApprovePositioningInput>
> {
  return z.object({
    approvedAt: z.iso.datetime(),
    approvedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
    id: z.string(),
  });
}

export function LinkPositioningComparableInputSchema(): z.ZodObject<
  Properties<LinkPositioningComparableInput>
> {
  return z.object({
    comparableId: z.string(),
    positioningId: z.string(),
    title: z.string(),
  });
}

export function LinkPositioningProofInputSchema(): z.ZodObject<
  Properties<LinkPositioningProofInput>
> {
  return z.object({
    positioningId: z.string(),
    proofCaseId: z.string(),
  });
}

export function LinkProofComparableInputSchema(): z.ZodObject<
  Properties<LinkProofComparableInput>
> {
  return z.object({
    comparableId: z.string(),
    proofCaseId: z.string(),
    title: z.string(),
  });
}

export function NeverClaimSchema(): z.ZodObject<Properties<NeverClaim>> {
  return z.object({
    __typename: z.literal("NeverClaim").optional(),
    claim: z.string(),
    id: z.string(),
    phrases: z.array(z.string()),
    reason: z.string().nullish(),
  });
}

export function PlaybookStateSchema(): z.ZodObject<Properties<PlaybookState>> {
  return z.object({
    __typename: z.literal("PlaybookState").optional(),
    neverClaims: z.array(z.lazy(() => NeverClaimSchema())),
    positioning: z.array(z.lazy(() => PositioningSchema())),
    proofCases: z.array(z.lazy(() => ProofCaseSchema())),
  });
}

export function PositioningSchema(): z.ZodObject<Properties<Positioning>> {
  return z.object({
    __typename: z.literal("Positioning").optional(),
    approvedAt: z.iso.datetime().nullish(),
    approvedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    comparables: z.array(z.lazy(() => VaultRefSchema())),
    id: z.string(),
    proofCaseIds: z.array(z.string()),
    status: PositioningStatusSchema,
    text: z.string(),
    title: z.string(),
  });
}

export function ProofCaseSchema(): z.ZodObject<Properties<ProofCase>> {
  return z.object({
    __typename: z.literal("ProofCase").optional(),
    comparables: z.array(z.lazy(() => VaultRefSchema())),
    evidence: z.array(z.lazy(() => VaultRefSchema())),
    id: z.string(),
    mayBeNamedPublicly: z.boolean(),
    summary: z.string().nullish(),
    title: z.string(),
  });
}

export function RemoveNeverClaimInputSchema(): z.ZodObject<
  Properties<RemoveNeverClaimInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveProofCaseInputSchema(): z.ZodObject<
  Properties<RemoveProofCaseInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveProofEvidenceInputSchema(): z.ZodObject<
  Properties<RemoveProofEvidenceInput>
> {
  return z.object({
    evidenceId: z.string(),
    proofCaseId: z.string(),
  });
}

export function RetirePositioningInputSchema(): z.ZodObject<
  Properties<RetirePositioningInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function UnlinkPositioningComparableInputSchema(): z.ZodObject<
  Properties<UnlinkPositioningComparableInput>
> {
  return z.object({
    comparableId: z.string(),
    positioningId: z.string(),
  });
}

export function UnlinkPositioningProofInputSchema(): z.ZodObject<
  Properties<UnlinkPositioningProofInput>
> {
  return z.object({
    positioningId: z.string(),
    proofCaseId: z.string(),
  });
}

export function UnlinkProofComparableInputSchema(): z.ZodObject<
  Properties<UnlinkProofComparableInput>
> {
  return z.object({
    comparableId: z.string(),
    proofCaseId: z.string(),
  });
}

export function UpdateNeverClaimInputSchema(): z.ZodObject<
  Properties<UpdateNeverClaimInput>
> {
  return z.object({
    claim: z.string().nullish(),
    id: z.string(),
    phrases: z.array(z.string()).nullish(),
    reason: z.string().nullish(),
  });
}

export function UpdatePositioningInputSchema(): z.ZodObject<
  Properties<UpdatePositioningInput>
> {
  return z.object({
    id: z.string(),
    text: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateProofCaseInputSchema(): z.ZodObject<
  Properties<UpdateProofCaseInput>
> {
  return z.object({
    id: z.string(),
    mayBeNamedPublicly: z.boolean().nullish(),
    summary: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function VaultRefSchema(): z.ZodObject<Properties<VaultRef>> {
  return z.object({
    __typename: z.literal("VaultRef").optional(),
    id: z.string(),
    title: z.string(),
  });
}
