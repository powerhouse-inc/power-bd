/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  Actor,
  AddActorInput,
  AddAdjustmentInput,
  AddAnnexInput,
  AddBoundaryInput,
  AddClauseInput,
  AddDeliverableInput,
  AddFigureFileInput,
  AddFigureInput,
  AddOptionInput,
  AddPackageInput,
  AddPaymentStepInput,
  AddReferenceInput,
  AddSectionInput,
  AddUseCaseInput,
  Adjustment,
  Annex,
  AnnexKind,
  ApproveProposalInput,
  Boundary,
  BoundaryKind,
  Clause,
  ClauseKind,
  Deliverable,
  DeliverablePrice,
  Figure,
  FigureAnchorKind,
  FileRef,
  MarkProposalSentCopyInput,
  MarkProposalSentInput,
  Option,
  Package,
  PaymentStep,
  PaymentTrigger,
  Pricing,
  ProposalState,
  ProposalStatus,
  RateUnit,
  Recipient,
  RecordProposalAnswerInput,
  RecurringPeriod,
  Reference,
  ReferenceKind,
  RemoveActorInput,
  RemoveAdjustmentInput,
  RemoveAnnexInput,
  RemoveBoundaryInput,
  RemoveClauseInput,
  RemoveDeliverableInput,
  RemoveFigureInput,
  RemoveOptionInput,
  RemovePackageInput,
  RemovePaymentStepInput,
  RemoveReferenceInput,
  RemoveSectionInput,
  RemoveUseCaseInput,
  ReopenProposalInput,
  ReorderClausesInput,
  ReorderDeliverablesInput,
  ReorderFiguresInput,
  ReorderPackagesInput,
  ReorderSectionsInput,
  Section,
  SectionKind,
  SetDeliverablePriceInput,
  SetProposalDetailsInput,
  SetProposalPartiesContractingEntityInput,
  SetProposalPartiesInput,
  SetProposalPartiesRecipientInput,
  SetSentCopyFileInput,
  SetSentCopyInput,
  SetSignedCopyFileInput,
  SetSignedCopyInput,
  SupersedeProposalInput,
  UpdateActorInput,
  UpdateAnnexInput,
  UpdateBoundaryInput,
  UpdateClauseInput,
  UpdateDeliverableInput,
  UpdateFigureFileInput,
  UpdateFigureInput,
  UpdateOptionInput,
  UpdatePackageInput,
  UpdatePaymentStepInput,
  UpdateSectionInput,
  UpdateUseCaseInput,
  UseCase,
  VaultRef,
  WithdrawProposalInput,
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

export const AnnexKindSchema = z.enum(["DATA_PROCESSING", "FORM", "OTHER"]);

export const BoundaryKindSchema = z.enum([
  "ASSUMPTION",
  "CLIENT_INPUT",
  "EXCLUSION",
  "GUARANTEE",
]);

export const ClauseKindSchema = z.enum([
  "CONFIDENTIALITY",
  "CONTRACTING_PARTY",
  "FINAL_PROVISIONS",
  "GOVERNING_LAW",
  "INTELLECTUAL_PROPERTY",
  "LIABILITY",
  "OTHER",
  "TERMINATION",
]);

export const FigureAnchorKindSchema = z.enum(["SECTION", "USE_CASE"]);

export const PaymentTriggerSchema = z.enum([
  "ON_ACCEPTANCE",
  "ON_DATE",
  "ON_SIGNATURE",
]);

export const PricingSchema = z.enum(["FIXED", "INCLUDED", "RATE", "RECURRING"]);

export const ProposalStatusSchema = z.enum([
  "ACCEPTED",
  "APPROVED",
  "DECLINED",
  "DRAFT",
  "SENT",
  "SUPERSEDED",
  "WITHDRAWN",
]);

export const RateUnitSchema = z.enum(["DAY", "HOUR"]);

export const RecurringPeriodSchema = z.enum(["MONTH", "QUARTER", "YEAR"]);

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

export const SectionKindSchema = z.enum([
  "ACCEPTANCE",
  "ANNEXES",
  "ASSUMPTIONS",
  "DELIVERABLES",
  "PRICING",
  "PROSE",
  "SCHEDULE",
  "SCOPE",
  "TERMS",
]);

export function ActorSchema(): z.ZodObject<Properties<Actor>> {
  return z.object({
    __typename: z.literal("Actor").optional(),
    code: z.string(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function AddActorInputSchema(): z.ZodObject<Properties<AddActorInput>> {
  return z.object({
    code: z.string(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string(),
  });
}

export function AddAdjustmentInputSchema(): z.ZodObject<
  Properties<AddAdjustmentInput>
> {
  return z.object({
    amount: z.number(),
    condition: z.string().nullish(),
    currency: z.string().nullish(),
    id: z.string(),
    label: z.string(),
    optionId: z.string(),
  });
}

export function AddAnnexInputSchema(): z.ZodObject<Properties<AddAnnexInput>> {
  return z.object({
    body: z.string().nullish(),
    id: z.string(),
    kind: AnnexKindSchema,
    partOfAgreement: z.boolean().nullish(),
    title: z.string(),
  });
}

export function AddBoundaryInputSchema(): z.ZodObject<
  Properties<AddBoundaryInput>
> {
  return z.object({
    id: z.string(),
    kind: BoundaryKindSchema,
    packageId: z.string().nullish(),
    text: z.string(),
    value: z.string().nullish(),
  });
}

export function AddClauseInputSchema(): z.ZodObject<
  Properties<AddClauseInput>
> {
  return z.object({
    body: z.string().nullish(),
    id: z.string(),
    kind: ClauseKindSchema,
    title: z.string(),
  });
}

export function AddDeliverableInputSchema(): z.ZodObject<
  Properties<AddDeliverableInput>
> {
  return z.object({
    body: z.string().nullish(),
    code: z.string(),
    id: z.string(),
    packageId: z.string(),
    title: z.string(),
  });
}

export function AddFigureFileInputSchema(): z.ZodObject<
  Properties<AddFigureFileInput>
> {
  return z.object({
    name: z.string(),
    ref: z.custom<`attachment://v${number}:${string}`>((val) =>
      /^attachment:\/\/v\d+:.+$/.test(val as string),
    ),
    type: z.string(),
  });
}

export function AddFigureInputSchema(): z.ZodObject<
  Properties<AddFigureInput>
> {
  return z.object({
    anchorId: z.string(),
    anchorKind: FigureAnchorKindSchema,
    caption: z.string().nullish(),
    file: z.lazy(() => AddFigureFileInputSchema()),
    id: z.string(),
  });
}

export function AddOptionInputSchema(): z.ZodObject<
  Properties<AddOptionInput>
> {
  return z.object({
    id: z.string(),
    label: z.string(),
    packageIds: z.array(z.string()),
  });
}

export function AddPackageInputSchema(): z.ZodObject<
  Properties<AddPackageInput>
> {
  return z.object({
    code: z.string(),
    currency: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    price: z.number().nullish(),
    requires: z.array(z.string()).nullish(),
    summary: z.string().nullish(),
    targetDate: z.iso.datetime().nullish(),
  });
}

export function AddPaymentStepInputSchema(): z.ZodObject<
  Properties<AddPaymentStepInput>
> {
  return z.object({
    date: z.iso.datetime().nullish(),
    id: z.string(),
    label: z.string(),
    percentage: z.number(),
    trigger: PaymentTriggerSchema,
  });
}

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

export function AddSectionInputSchema(): z.ZodObject<
  Properties<AddSectionInput>
> {
  return z.object({
    body: z.string().nullish(),
    id: z.string(),
    kind: SectionKindSchema,
    positioningId: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function AddUseCaseInputSchema(): z.ZodObject<
  Properties<AddUseCaseInput>
> {
  return z.object({
    actorId: z.string(),
    body: z.string().nullish(),
    code: z.string(),
    id: z.string(),
    packageId: z.string(),
    title: z.string(),
  });
}

export function AdjustmentSchema(): z.ZodObject<Properties<Adjustment>> {
  return z.object({
    __typename: z.literal("Adjustment").optional(),
    amount: z.number(),
    condition: z.string().nullish(),
    id: z.string(),
    label: z.string(),
  });
}

export function AnnexSchema(): z.ZodObject<Properties<Annex>> {
  return z.object({
    __typename: z.literal("Annex").optional(),
    body: z.string().nullish(),
    id: z.string(),
    kind: AnnexKindSchema,
    partOfAgreement: z.boolean(),
    title: z.string(),
  });
}

export function ApproveProposalInputSchema(): z.ZodObject<
  Properties<ApproveProposalInput>
> {
  return z.object({
    approvedAt: z.iso.datetime(),
    approvedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
  });
}

export function BoundarySchema(): z.ZodObject<Properties<Boundary>> {
  return z.object({
    __typename: z.literal("Boundary").optional(),
    id: z.string(),
    kind: BoundaryKindSchema,
    packageId: z.string().nullish(),
    text: z.string(),
    value: z.string().nullish(),
  });
}

export function ClauseSchema(): z.ZodObject<Properties<Clause>> {
  return z.object({
    __typename: z.literal("Clause").optional(),
    body: z.string().nullish(),
    id: z.string(),
    kind: ClauseKindSchema,
    title: z.string(),
  });
}

export function DeliverableSchema(): z.ZodObject<Properties<Deliverable>> {
  return z.object({
    __typename: z.literal("Deliverable").optional(),
    body: z.string().nullish(),
    code: z.string(),
    id: z.string(),
    packageId: z.string(),
    price: z.lazy(() => DeliverablePriceSchema().nullish()),
    title: z.string(),
  });
}

export function DeliverablePriceSchema(): z.ZodObject<
  Properties<DeliverablePrice>
> {
  return z.object({
    __typename: z.literal("DeliverablePrice").optional(),
    amount: z.number().nullish(),
    note: z.string().nullish(),
    period: RecurringPeriodSchema.nullish(),
    pricing: PricingSchema,
    unit: RateUnitSchema.nullish(),
    until: z.iso.datetime().nullish(),
    upperAmount: z.number().nullish(),
  });
}

export function FigureSchema(): z.ZodObject<Properties<Figure>> {
  return z.object({
    __typename: z.literal("Figure").optional(),
    anchorId: z.string(),
    anchorKind: FigureAnchorKindSchema,
    caption: z.string().nullish(),
    file: z.lazy(() => FileRefSchema()),
    id: z.string(),
  });
}

export function FileRefSchema(): z.ZodObject<Properties<FileRef>> {
  return z.object({
    __typename: z.literal("FileRef").optional(),
    name: z.string(),
    ref: z.custom<`attachment://v${number}:${string}`>((val) =>
      /^attachment:\/\/v\d+:.+$/.test(val as string),
    ),
    type: z.string(),
  });
}

export function MarkProposalSentCopyInputSchema(): z.ZodObject<
  Properties<MarkProposalSentCopyInput>
> {
  return z.object({
    name: z.string(),
    ref: z.custom<`attachment://v${number}:${string}`>((val) =>
      /^attachment:\/\/v\d+:.+$/.test(val as string),
    ),
    type: z.string(),
  });
}

export function MarkProposalSentInputSchema(): z.ZodObject<
  Properties<MarkProposalSentInput>
> {
  return z.object({
    copy: z.lazy(() => MarkProposalSentCopyInputSchema().nullish()),
    sentAt: z.iso.datetime(),
    sentBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
  });
}

export function OptionSchema(): z.ZodObject<Properties<Option>> {
  return z.object({
    __typename: z.literal("Option").optional(),
    adjustments: z.array(z.lazy(() => AdjustmentSchema())),
    id: z.string(),
    label: z.string(),
    packageIds: z.array(z.string()),
  });
}

export function PackageSchema(): z.ZodObject<Properties<Package>> {
  return z.object({
    __typename: z.literal("Package").optional(),
    code: z.string(),
    id: z.string(),
    name: z.string(),
    price: z.number().nullish(),
    requires: z.array(z.string()),
    summary: z.string().nullish(),
    targetDate: z.iso.datetime().nullish(),
  });
}

export function PaymentStepSchema(): z.ZodObject<Properties<PaymentStep>> {
  return z.object({
    __typename: z.literal("PaymentStep").optional(),
    date: z.iso.datetime().nullish(),
    id: z.string(),
    label: z.string(),
    percentage: z.number(),
    trigger: PaymentTriggerSchema,
  });
}

export function ProposalStateSchema(): z.ZodObject<Properties<ProposalState>> {
  return z.object({
    __typename: z.literal("ProposalState").optional(),
    actors: z.array(z.lazy(() => ActorSchema())),
    annexes: z.array(z.lazy(() => AnnexSchema())),
    answeredAt: z.iso.datetime().nullish(),
    approvedAt: z.iso.datetime().nullish(),
    approvedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    bindingOnSignature: z.boolean(),
    boundaries: z.array(z.lazy(() => BoundarySchema())),
    chosenOptionId: z.string().nullish(),
    clauses: z.array(z.lazy(() => ClauseSchema())),
    code: z.string().nullish(),
    contractingEntity: z.lazy(() => VaultRefSchema().nullish()),
    currency: z.string().nullish(),
    deliverables: z.array(z.lazy(() => DeliverableSchema())),
    figures: z.array(z.lazy(() => FigureSchema())),
    leadId: z.string().nullish(),
    options: z.array(z.lazy(() => OptionSchema())),
    packages: z.array(z.lazy(() => PackageSchema())),
    paymentSteps: z.array(z.lazy(() => PaymentStepSchema())),
    processesPersonalData: z.boolean(),
    reason: z.string().nullish(),
    recipient: z.lazy(() => RecipientSchema().nullish()),
    references: z.array(z.lazy(() => ReferenceSchema())),
    revisesProposalId: z.string().nullish(),
    sections: z.array(z.lazy(() => SectionSchema())),
    sentAt: z.iso.datetime().nullish(),
    sentBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    sentCopy: z.lazy(() => FileRefSchema().nullish()),
    signedCopy: z.lazy(() => FileRefSchema().nullish()),
    status: ProposalStatusSchema,
    supersededByProposalId: z.string().nullish(),
    title: z.string().nullish(),
    useCases: z.array(z.lazy(() => UseCaseSchema())),
    validUntil: z.iso.datetime().nullish(),
  });
}

export function RecipientSchema(): z.ZodObject<Properties<Recipient>> {
  return z.object({
    __typename: z.literal("Recipient").optional(),
    contactId: z.string(),
    personId: z.string().nullish(),
  });
}

export function RecordProposalAnswerInputSchema(): z.ZodObject<
  Properties<RecordProposalAnswerInput>
> {
  return z.object({
    accepted: z.boolean(),
    answeredAt: z.iso.datetime(),
    chosenOptionId: z.string().nullish(),
    reason: z.string().nullish(),
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

export function RemoveActorInputSchema(): z.ZodObject<
  Properties<RemoveActorInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveAdjustmentInputSchema(): z.ZodObject<
  Properties<RemoveAdjustmentInput>
> {
  return z.object({
    id: z.string(),
    optionId: z.string(),
  });
}

export function RemoveAnnexInputSchema(): z.ZodObject<
  Properties<RemoveAnnexInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveBoundaryInputSchema(): z.ZodObject<
  Properties<RemoveBoundaryInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveClauseInputSchema(): z.ZodObject<
  Properties<RemoveClauseInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveDeliverableInputSchema(): z.ZodObject<
  Properties<RemoveDeliverableInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveFigureInputSchema(): z.ZodObject<
  Properties<RemoveFigureInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveOptionInputSchema(): z.ZodObject<
  Properties<RemoveOptionInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemovePackageInputSchema(): z.ZodObject<
  Properties<RemovePackageInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemovePaymentStepInputSchema(): z.ZodObject<
  Properties<RemovePaymentStepInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveReferenceInputSchema(): z.ZodObject<
  Properties<RemoveReferenceInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveSectionInputSchema(): z.ZodObject<
  Properties<RemoveSectionInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveUseCaseInputSchema(): z.ZodObject<
  Properties<RemoveUseCaseInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function ReopenProposalInputSchema(): z.ZodObject<
  Properties<ReopenProposalInput>
> {
  return z.object({
    _empty: z.boolean().nullish(),
  });
}

export function ReorderClausesInputSchema(): z.ZodObject<
  Properties<ReorderClausesInput>
> {
  return z.object({
    ids: z.array(z.string()),
  });
}

export function ReorderDeliverablesInputSchema(): z.ZodObject<
  Properties<ReorderDeliverablesInput>
> {
  return z.object({
    ids: z.array(z.string()),
  });
}

export function ReorderFiguresInputSchema(): z.ZodObject<
  Properties<ReorderFiguresInput>
> {
  return z.object({
    anchorId: z.string(),
    anchorKind: FigureAnchorKindSchema,
    ids: z.array(z.string()),
  });
}

export function ReorderPackagesInputSchema(): z.ZodObject<
  Properties<ReorderPackagesInput>
> {
  return z.object({
    ids: z.array(z.string()),
  });
}

export function ReorderSectionsInputSchema(): z.ZodObject<
  Properties<ReorderSectionsInput>
> {
  return z.object({
    ids: z.array(z.string()),
  });
}

export function SectionSchema(): z.ZodObject<Properties<Section>> {
  return z.object({
    __typename: z.literal("Section").optional(),
    body: z.string().nullish(),
    id: z.string(),
    kind: SectionKindSchema,
    positioningId: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function SetDeliverablePriceInputSchema(): z.ZodObject<
  Properties<SetDeliverablePriceInput>
> {
  return z.object({
    amount: z.number().nullish(),
    currency: z.string().nullish(),
    id: z.string(),
    note: z.string().nullish(),
    period: RecurringPeriodSchema.nullish(),
    pricing: PricingSchema,
    unit: RateUnitSchema.nullish(),
    until: z.iso.datetime().nullish(),
    upperAmount: z.number().nullish(),
  });
}

export function SetProposalDetailsInputSchema(): z.ZodObject<
  Properties<SetProposalDetailsInput>
> {
  return z.object({
    bindingOnSignature: z.boolean().nullish(),
    code: z.string().nullish(),
    currency: z.string().nullish(),
    processesPersonalData: z.boolean().nullish(),
    revisesProposalId: z.string().nullish(),
    title: z.string().nullish(),
    validUntil: z.iso.datetime().nullish(),
  });
}

export function SetProposalPartiesContractingEntityInputSchema(): z.ZodObject<
  Properties<SetProposalPartiesContractingEntityInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function SetProposalPartiesInputSchema(): z.ZodObject<
  Properties<SetProposalPartiesInput>
> {
  return z.object({
    contractingEntity: z.lazy(() =>
      SetProposalPartiesContractingEntityInputSchema().nullish(),
    ),
    leadId: z.string().nullish(),
    recipient: z.lazy(() => SetProposalPartiesRecipientInputSchema().nullish()),
  });
}

export function SetProposalPartiesRecipientInputSchema(): z.ZodObject<
  Properties<SetProposalPartiesRecipientInput>
> {
  return z.object({
    contactId: z.string(),
    personId: z.string().nullish(),
  });
}

export function SetSentCopyFileInputSchema(): z.ZodObject<
  Properties<SetSentCopyFileInput>
> {
  return z.object({
    name: z.string(),
    ref: z.custom<`attachment://v${number}:${string}`>((val) =>
      /^attachment:\/\/v\d+:.+$/.test(val as string),
    ),
    type: z.string(),
  });
}

export function SetSentCopyInputSchema(): z.ZodObject<
  Properties<SetSentCopyInput>
> {
  return z.object({
    file: z.lazy(() => SetSentCopyFileInputSchema().nullish()),
  });
}

export function SetSignedCopyFileInputSchema(): z.ZodObject<
  Properties<SetSignedCopyFileInput>
> {
  return z.object({
    name: z.string(),
    ref: z.custom<`attachment://v${number}:${string}`>((val) =>
      /^attachment:\/\/v\d+:.+$/.test(val as string),
    ),
    type: z.string(),
  });
}

export function SetSignedCopyInputSchema(): z.ZodObject<
  Properties<SetSignedCopyInput>
> {
  return z.object({
    file: z.lazy(() => SetSignedCopyFileInputSchema().nullish()),
  });
}

export function SupersedeProposalInputSchema(): z.ZodObject<
  Properties<SupersedeProposalInput>
> {
  return z.object({
    supersededByProposalId: z.string(),
  });
}

export function UpdateActorInputSchema(): z.ZodObject<
  Properties<UpdateActorInput>
> {
  return z.object({
    code: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
  });
}

export function UpdateAnnexInputSchema(): z.ZodObject<
  Properties<UpdateAnnexInput>
> {
  return z.object({
    body: z.string().nullish(),
    id: z.string(),
    kind: AnnexKindSchema.nullish(),
    partOfAgreement: z.boolean().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateBoundaryInputSchema(): z.ZodObject<
  Properties<UpdateBoundaryInput>
> {
  return z.object({
    id: z.string(),
    kind: BoundaryKindSchema.nullish(),
    packageId: z.string().nullish(),
    text: z.string().nullish(),
    value: z.string().nullish(),
  });
}

export function UpdateClauseInputSchema(): z.ZodObject<
  Properties<UpdateClauseInput>
> {
  return z.object({
    body: z.string().nullish(),
    id: z.string(),
    kind: ClauseKindSchema.nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateDeliverableInputSchema(): z.ZodObject<
  Properties<UpdateDeliverableInput>
> {
  return z.object({
    body: z.string().nullish(),
    code: z.string().nullish(),
    id: z.string(),
    packageId: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateFigureFileInputSchema(): z.ZodObject<
  Properties<UpdateFigureFileInput>
> {
  return z.object({
    name: z.string(),
    ref: z.custom<`attachment://v${number}:${string}`>((val) =>
      /^attachment:\/\/v\d+:.+$/.test(val as string),
    ),
    type: z.string(),
  });
}

export function UpdateFigureInputSchema(): z.ZodObject<
  Properties<UpdateFigureInput>
> {
  return z.object({
    caption: z.string().nullish(),
    file: z.lazy(() => UpdateFigureFileInputSchema().nullish()),
    id: z.string(),
  });
}

export function UpdateOptionInputSchema(): z.ZodObject<
  Properties<UpdateOptionInput>
> {
  return z.object({
    id: z.string(),
    label: z.string().nullish(),
    packageIds: z.array(z.string()).nullish(),
  });
}

export function UpdatePackageInputSchema(): z.ZodObject<
  Properties<UpdatePackageInput>
> {
  return z.object({
    code: z.string().nullish(),
    currency: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    price: z.number().nullish(),
    requires: z.array(z.string()).nullish(),
    summary: z.string().nullish(),
    targetDate: z.iso.datetime().nullish(),
  });
}

export function UpdatePaymentStepInputSchema(): z.ZodObject<
  Properties<UpdatePaymentStepInput>
> {
  return z.object({
    date: z.iso.datetime().nullish(),
    id: z.string(),
    label: z.string().nullish(),
    percentage: z.number().nullish(),
    trigger: PaymentTriggerSchema.nullish(),
  });
}

export function UpdateSectionInputSchema(): z.ZodObject<
  Properties<UpdateSectionInput>
> {
  return z.object({
    body: z.string().nullish(),
    id: z.string(),
    positioningId: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function UpdateUseCaseInputSchema(): z.ZodObject<
  Properties<UpdateUseCaseInput>
> {
  return z.object({
    actorId: z.string().nullish(),
    body: z.string().nullish(),
    code: z.string().nullish(),
    id: z.string(),
    packageId: z.string().nullish(),
    title: z.string().nullish(),
  });
}

export function UseCaseSchema(): z.ZodObject<Properties<UseCase>> {
  return z.object({
    __typename: z.literal("UseCase").optional(),
    actorId: z.string(),
    body: z.string().nullish(),
    code: z.string(),
    id: z.string(),
    packageId: z.string(),
    title: z.string(),
  });
}

export function VaultRefSchema(): z.ZodObject<Properties<VaultRef>> {
  return z.object({
    __typename: z.literal("VaultRef").optional(),
    id: z.string(),
    title: z.string(),
  });
}

export function WithdrawProposalInputSchema(): z.ZodObject<
  Properties<WithdrawProposalInput>
> {
  return z.object({
    reason: z.string(),
  });
}
