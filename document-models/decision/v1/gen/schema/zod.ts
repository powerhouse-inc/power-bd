/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddReferenceInput,
  AnswerDecisionInput,
  DecisionState,
  DecisionStatus,
  Reference,
  ReferenceKind,
  RemoveReferenceInput,
  ReopenDecisionInput,
  SetDecideByInput,
  SetDecisionOwnerInput,
  SetQuestionInput,
  WithdrawDecisionInput,
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

export const DecisionStatusSchema = z.enum(["ANSWERED", "OPEN", "WITHDRAWN"]);

export const ReferenceKindSchema = z.enum([
  "COMPARABLE",
  "DECISION",
  "LEAD",
  "NOTE",
  "OPPORTUNITY",
  "OTHER",
  "RESEARCH",
  "SOURCE",
]);

export function AddReferenceInputSchema(): z.ZodObject<
  Properties<AddReferenceInput>
> {
  return z.object({
    documentId: z.string(),
    id: z.string(),
    kind: ReferenceKindSchema,
    title: z.string(),
  });
}

export function AnswerDecisionInputSchema(): z.ZodObject<
  Properties<AnswerDecisionInput>
> {
  return z.object({
    answer: z.string(),
    answeredAt: z.iso.datetime(),
    answeredBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
  });
}

export function DecisionStateSchema(): z.ZodObject<Properties<DecisionState>> {
  return z.object({
    __typename: z.literal("DecisionState").optional(),
    answer: z.string().nullish(),
    answeredAt: z.iso.datetime().nullish(),
    answeredBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    context: z.string().nullish(),
    decideBy: z.iso.datetime().nullish(),
    owner: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    question: z.string().nullish(),
    reason: z.string().nullish(),
    references: z.array(z.lazy(() => ReferenceSchema())),
    status: DecisionStatusSchema,
  });
}

export function ReferenceSchema(): z.ZodObject<Properties<Reference>> {
  return z.object({
    __typename: z.literal("Reference").optional(),
    documentId: z.string(),
    id: z.string(),
    kind: ReferenceKindSchema,
    title: z.string(),
  });
}

export function RemoveReferenceInputSchema(): z.ZodObject<
  Properties<RemoveReferenceInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function ReopenDecisionInputSchema(): z.ZodObject<
  Properties<ReopenDecisionInput>
> {
  return z.object({
    reason: z.string().nullish(),
  });
}

export function SetDecideByInputSchema(): z.ZodObject<
  Properties<SetDecideByInput>
> {
  return z.object({
    decideBy: z.iso.datetime().nullish(),
  });
}

export function SetDecisionOwnerInputSchema(): z.ZodObject<
  Properties<SetDecisionOwnerInput>
> {
  return z.object({
    owner: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
  });
}

export function SetQuestionInputSchema(): z.ZodObject<
  Properties<SetQuestionInput>
> {
  return z.object({
    context: z.string().nullish(),
    question: z.string(),
  });
}

export function WithdrawDecisionInputSchema(): z.ZodObject<
  Properties<WithdrawDecisionInput>
> {
  return z.object({
    reason: z.string().nullish(),
  });
}
