/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddConditionFactNoteInput,
  AddConditionInput,
  AddConfidentialItemInput,
  AddInteractionInput,
  AddInteractionNotesSourceInput,
  AddInteractionPersonInput,
  AddNextStepInput,
  AddPartnerInput,
  AddReferenceInput,
  AddStepInput,
  AttemptLimit,
  Blocked,
  ClearAttemptLimitInput,
  ClearBlockedInput,
  CompleteNextStepInput,
  Condition,
  ConditionKind,
  ConditionState,
  ConfidentialItem,
  ContactLink,
  DecideGoNoGoInput,
  Fit,
  GoNoGo,
  GoNoGoDecision,
  Instrument,
  Interaction,
  InteractionKind,
  InteractionOutcome,
  InteractionStatus,
  LinkContactInput,
  MarkConditionInput,
  MarkSubmissionInput,
  NextStep,
  OpportunityState,
  OpportunityStatus,
  Partner,
  PartnerStatus,
  PersonRef,
  RecordSubmissionOutcomeInput,
  Reference,
  ReferenceKind,
  RemoveConditionInput,
  RemoveConfidentialItemInput,
  RemoveInteractionInput,
  RemoveNextStepInput,
  RemovePartnerInput,
  RemoveReferenceInput,
  RemoveStepInput,
  ReopenNextStepInput,
  SetApplyingEntityEntityInput,
  SetApplyingEntityInput,
  SetAttemptLimitInput,
  SetBlockedInput,
  SetCoordinatorInput,
  SetDecideByInput,
  SetExpectedOpeningInput,
  SetFitInput,
  SetFitReasoningInput,
  SetInteractionOutcomeInput,
  SetOpportunityDetailsInput,
  SetOpportunityDetailsProgrammeInput,
  SetOpportunityStatusInput,
  SetOwnerInput,
  Step,
  StepKind,
  Submission,
  SubmissionOutcome,
  SubmissionResult,
  TargetCutOffInput,
  UnlinkContactInput,
  UpdateConditionFactNoteInput,
  UpdateConditionInput,
  UpdateInteractionInput,
  UpdateInteractionNotesSourceInput,
  UpdateInteractionPersonInput,
  UpdateNextStepInput,
  UpdatePartnerInput,
  UpdateStepInput,
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

export const ConditionKindSchema = z.enum([
  "CONSORTIUM",
  "COUNTRY",
  "CO_FUNDING",
  "ELIGIBILITY",
  "LEGAL_FORM",
  "OTHER",
  "PURPOSE",
  "READINESS",
]);

export const ConditionStateSchema = z.enum([
  "MET",
  "NOT_MET",
  "UNKNOWN",
  "WAITING_ON_DECISION",
]);

export const FitSchema = z.enum(["BEST", "GOOD", "LATER", "UNLIKELY"]);

export const GoNoGoSchema = z.enum(["GO", "NO_GO"]);

export const InstrumentSchema = z.enum([
  "ACCELERATOR",
  "CONSORTIUM_CALL",
  "EQUITY",
  "FELLOWSHIP",
  "GRANT",
  "IN_KIND",
  "MIXED",
  "PRIZE",
]);

export const InteractionKindSchema = z.enum([
  "CALL",
  "EMAIL",
  "EVENT",
  "MEETING",
  "MESSAGE",
  "OTHER",
]);

export const InteractionOutcomeSchema = z.enum([
  "NEGATIVE",
  "NEUTRAL",
  "POSITIVE",
]);

export const InteractionStatusSchema = z.enum([
  "CANCELLED",
  "HELD",
  "SCHEDULED",
]);

export const OpportunityStatusSchema = z.enum([
  "AWARDED",
  "DECIDING",
  "NEXT_STAGE",
  "NO_GO",
  "PREPARING",
  "REJECTED",
  "SUBMITTED",
  "TO_EVALUATE",
  "WATCHING",
  "WITHDRAWN",
]);

export const PartnerStatusSchema = z.enum([
  "ASKED",
  "COMMITTED",
  "INTERESTED",
  "SIGNED",
]);

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

export const StepKindSchema = z.enum([
  "CUT_OFF",
  "EXPECTED_RESULT",
  "FULL_PROPOSAL",
  "INTERVIEW",
  "LETTER_OF_INTENT",
  "OTHER",
  "STAGE",
]);

export const SubmissionResultSchema = z.enum([
  "AWARDED",
  "PASSED",
  "UNSUCCESSFUL",
  "WITHDRAWN",
]);

export function AddConditionFactNoteInputSchema(): z.ZodObject<
  Properties<AddConditionFactNoteInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function AddConditionInputSchema(): z.ZodObject<
  Properties<AddConditionInput>
> {
  return z.object({
    checkedAt: z.iso.datetime().nullish(),
    decisionIds: z.array(z.string()).nullish(),
    factNotes: z
      .array(z.lazy(() => AddConditionFactNoteInputSchema()))
      .nullish(),
    id: z.string(),
    kind: ConditionKindSchema,
    source: z.string().nullish(),
    state: ConditionStateSchema.nullish(),
    text: z.string(),
  });
}

export function AddConfidentialItemInputSchema(): z.ZodObject<
  Properties<AddConfidentialItemInput>
> {
  return z.object({
    addedAt: z.iso.datetime(),
    addedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      }),
    id: z.string(),
    subjectContactId: z.string().nullish(),
    text: z.string(),
  });
}

export function AddInteractionInputSchema(): z.ZodObject<
  Properties<AddInteractionInput>
> {
  return z.object({
    at: z.iso.datetime().nullish(),
    id: z.string(),
    kind: InteractionKindSchema,
    notesSource: z.lazy(() => AddInteractionNotesSourceInputSchema().nullish()),
    people: z.array(z.lazy(() => AddInteractionPersonInputSchema())).nullish(),
    status: InteractionStatusSchema,
    summary: z.string().nullish(),
    teamMembers: z
      .array(
        z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, {
            error: "Invalid Ethereum address format",
          }),
      )
      .nullish(),
    timeZone: z.string().nullish(),
  });
}

export function AddInteractionNotesSourceInputSchema(): z.ZodObject<
  Properties<AddInteractionNotesSourceInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function AddInteractionPersonInputSchema(): z.ZodObject<
  Properties<AddInteractionPersonInput>
> {
  return z.object({
    contactId: z.string(),
    personId: z.string(),
  });
}

export function AddNextStepInputSchema(): z.ZodObject<
  Properties<AddNextStepInput>
> {
  return z.object({
    dueDate: z.iso.datetime().nullish(),
    id: z.string(),
    owner: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    text: z.string(),
  });
}

export function AddPartnerInputSchema(): z.ZodObject<
  Properties<AddPartnerInput>
> {
  return z.object({
    country: z.string().nullish(),
    id: z.string(),
    leadId: z.string().nullish(),
    organisationId: z.string(),
    role: z.string().nullish(),
    status: PartnerStatusSchema.nullish(),
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

export function AddStepInputSchema(): z.ZodObject<Properties<AddStepInput>> {
  return z.object({
    at: z.iso.datetime(),
    checkedAt: z.iso.datetime().nullish(),
    id: z.string(),
    kind: StepKindSchema,
    label: z.string(),
    source: z.string().nullish(),
    timeZone: z.string(),
  });
}

export function AttemptLimitSchema(): z.ZodObject<Properties<AttemptLimit>> {
  return z.object({
    __typename: z.literal("AttemptLimit").optional(),
    checkedAt: z.iso.datetime(),
    max: z.number(),
    source: z.string(),
    withdrawnCounts: z.boolean(),
  });
}

export function BlockedSchema(): z.ZodObject<Properties<Blocked>> {
  return z.object({
    __typename: z.literal("Blocked").optional(),
    decisionId: z.string().nullish(),
    text: z.string().nullish(),
  });
}

export function ClearAttemptLimitInputSchema(): z.ZodObject<
  Properties<ClearAttemptLimitInput>
> {
  return z.object({
    _empty: z.boolean().nullish(),
  });
}

export function ClearBlockedInputSchema(): z.ZodObject<
  Properties<ClearBlockedInput>
> {
  return z.object({
    _empty: z.boolean().nullish(),
  });
}

export function CompleteNextStepInputSchema(): z.ZodObject<
  Properties<CompleteNextStepInput>
> {
  return z.object({
    doneAt: z.iso.datetime(),
    id: z.string(),
  });
}

export function ConditionSchema(): z.ZodObject<Properties<Condition>> {
  return z.object({
    __typename: z.literal("Condition").optional(),
    checkedAt: z.iso.datetime(),
    decisionIds: z.array(z.string()),
    factNotes: z.array(z.lazy(() => VaultRefSchema())),
    id: z.string(),
    kind: ConditionKindSchema,
    source: z.string(),
    state: ConditionStateSchema,
    text: z.string(),
  });
}

export function ConfidentialItemSchema(): z.ZodObject<
  Properties<ConfidentialItem>
> {
  return z.object({
    __typename: z.literal("ConfidentialItem").optional(),
    addedAt: z.iso.datetime(),
    addedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      }),
    id: z.string(),
    subjectContactId: z.string().nullish(),
    text: z.string(),
  });
}

export function ContactLinkSchema(): z.ZodObject<Properties<ContactLink>> {
  return z.object({
    __typename: z.literal("ContactLink").optional(),
    contactId: z.string(),
    id: z.string(),
    personId: z.string().nullish(),
    role: z.string().nullish(),
  });
}

export function DecideGoNoGoInputSchema(): z.ZodObject<
  Properties<DecideGoNoGoInput>
> {
  return z.object({
    attemptsLeft: z.number().nullish(),
    decidedAt: z.iso.datetime(),
    decidedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    decision: GoNoGoSchema,
    id: z.string(),
    reason: z.string(),
  });
}

export function GoNoGoDecisionSchema(): z.ZodObject<
  Properties<GoNoGoDecision>
> {
  return z.object({
    __typename: z.literal("GoNoGoDecision").optional(),
    attemptsLeft: z.number().nullish(),
    decidedAt: z.iso.datetime(),
    decidedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      }),
    decision: GoNoGoSchema,
    id: z.string(),
    reason: z.string(),
  });
}

export function InteractionSchema(): z.ZodObject<Properties<Interaction>> {
  return z.object({
    __typename: z.literal("Interaction").optional(),
    at: z.iso.datetime().nullish(),
    id: z.string(),
    kind: InteractionKindSchema,
    notesSource: z.lazy(() => VaultRefSchema().nullish()),
    outcome: InteractionOutcomeSchema.nullish(),
    people: z.array(z.lazy(() => PersonRefSchema())),
    status: InteractionStatusSchema,
    summary: z.string().nullish(),
    teamMembers: z.array(
      z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, {
          error: "Invalid Ethereum address format",
        }),
    ),
    timeZone: z.string().nullish(),
  });
}

export function LinkContactInputSchema(): z.ZodObject<
  Properties<LinkContactInput>
> {
  return z.object({
    contactId: z.string(),
    id: z.string(),
    personId: z.string().nullish(),
    role: z.string().nullish(),
  });
}

export function MarkConditionInputSchema(): z.ZodObject<
  Properties<MarkConditionInput>
> {
  return z.object({
    checkedAt: z.iso.datetime(),
    id: z.string(),
    state: ConditionStateSchema,
  });
}

export function MarkSubmissionInputSchema(): z.ZodObject<
  Properties<MarkSubmissionInput>
> {
  return z.object({
    id: z.string(),
    stepId: z.string().nullish(),
    submittedAt: z.iso.datetime(),
    submittedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      }),
    where: z.string().nullish(),
  });
}

export function NextStepSchema(): z.ZodObject<Properties<NextStep>> {
  return z.object({
    __typename: z.literal("NextStep").optional(),
    doneAt: z.iso.datetime().nullish(),
    dueDate: z.iso.datetime().nullish(),
    id: z.string(),
    owner: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    text: z.string(),
  });
}

export function OpportunityStateSchema(): z.ZodObject<
  Properties<OpportunityState>
> {
  return z.object({
    __typename: z.literal("OpportunityState").optional(),
    amount: z.number().nullish(),
    applyingEntity: z.lazy(() => VaultRefSchema().nullish()),
    attemptLimit: z.lazy(() => AttemptLimitSchema().nullish()),
    blocked: z.lazy(() => BlockedSchema().nullish()),
    closedAt: z.iso.datetime().nullish(),
    conditions: z.array(z.lazy(() => ConditionSchema())),
    confidentialItems: z.array(z.lazy(() => ConfidentialItemSchema())),
    contactLinks: z.array(z.lazy(() => ContactLinkSchema())),
    coordinatorId: z.string().nullish(),
    currency: z.string().nullish(),
    decideBy: z.iso.datetime().nullish(),
    expectedOpening: z.iso.datetime().nullish(),
    fit: FitSchema.nullish(),
    fitReasoning: z.lazy(() => VaultRefSchema().nullish()),
    funderId: z.string().nullish(),
    fundingRate: z.number().nullish(),
    goNoGoDecisions: z.array(z.lazy(() => GoNoGoDecisionSchema())),
    instrument: InstrumentSchema.nullish(),
    interactions: z.array(z.lazy(() => InteractionSchema())),
    name: z.string().nullish(),
    nextSteps: z.array(z.lazy(() => NextStepSchema())),
    owner: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    partners: z.array(z.lazy(() => PartnerSchema())),
    programme: z.lazy(() => VaultRefSchema().nullish()),
    references: z.array(z.lazy(() => ReferenceSchema())),
    rolling: z.boolean(),
    roundLabel: z.string().nullish(),
    roundOpenedAt: z.iso.datetime().nullish(),
    status: OpportunityStatusSchema,
    statusReason: z.string().nullish(),
    steps: z.array(z.lazy(() => StepSchema())),
    submissions: z.array(z.lazy(() => SubmissionSchema())),
    whereToApply: z.string().nullish(),
  });
}

export function PartnerSchema(): z.ZodObject<Properties<Partner>> {
  return z.object({
    __typename: z.literal("Partner").optional(),
    country: z.string().nullish(),
    id: z.string(),
    leadId: z.string().nullish(),
    organisationId: z.string(),
    role: z.string().nullish(),
    status: PartnerStatusSchema,
  });
}

export function PersonRefSchema(): z.ZodObject<Properties<PersonRef>> {
  return z.object({
    __typename: z.literal("PersonRef").optional(),
    contactId: z.string(),
    personId: z.string(),
  });
}

export function RecordSubmissionOutcomeInputSchema(): z.ZodObject<
  Properties<RecordSubmissionOutcomeInput>
> {
  return z.object({
    amount: z.number().nullish(),
    currency: z.string().nullish(),
    id: z.string(),
    receivedAt: z.iso.datetime(),
    result: SubmissionResultSchema,
    text: z.string().nullish(),
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

export function RemoveConditionInputSchema(): z.ZodObject<
  Properties<RemoveConditionInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveConfidentialItemInputSchema(): z.ZodObject<
  Properties<RemoveConfidentialItemInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveInteractionInputSchema(): z.ZodObject<
  Properties<RemoveInteractionInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveNextStepInputSchema(): z.ZodObject<
  Properties<RemoveNextStepInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemovePartnerInputSchema(): z.ZodObject<
  Properties<RemovePartnerInput>
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

export function RemoveStepInputSchema(): z.ZodObject<
  Properties<RemoveStepInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function ReopenNextStepInputSchema(): z.ZodObject<
  Properties<ReopenNextStepInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function SetApplyingEntityEntityInputSchema(): z.ZodObject<
  Properties<SetApplyingEntityEntityInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function SetApplyingEntityInputSchema(): z.ZodObject<
  Properties<SetApplyingEntityInput>
> {
  return z.object({
    entity: z.lazy(() => SetApplyingEntityEntityInputSchema().nullish()),
  });
}

export function SetAttemptLimitInputSchema(): z.ZodObject<
  Properties<SetAttemptLimitInput>
> {
  return z.object({
    checkedAt: z.iso.datetime().nullish(),
    max: z.number(),
    source: z.string().nullish(),
    withdrawnCounts: z.boolean(),
  });
}

export function SetBlockedInputSchema(): z.ZodObject<
  Properties<SetBlockedInput>
> {
  return z.object({
    decisionId: z.string().nullish(),
    text: z.string().nullish(),
  });
}

export function SetCoordinatorInputSchema(): z.ZodObject<
  Properties<SetCoordinatorInput>
> {
  return z.object({
    coordinatorId: z.string().nullish(),
  });
}

export function SetDecideByInputSchema(): z.ZodObject<
  Properties<SetDecideByInput>
> {
  return z.object({
    decideBy: z.iso.datetime().nullish(),
  });
}

export function SetExpectedOpeningInputSchema(): z.ZodObject<
  Properties<SetExpectedOpeningInput>
> {
  return z.object({
    expectedOpening: z.iso.datetime().nullish(),
  });
}

export function SetFitInputSchema(): z.ZodObject<Properties<SetFitInput>> {
  return z.object({
    fit: FitSchema.nullish(),
    reasoning: z.lazy(() => SetFitReasoningInputSchema().nullish()),
  });
}

export function SetFitReasoningInputSchema(): z.ZodObject<
  Properties<SetFitReasoningInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function SetInteractionOutcomeInputSchema(): z.ZodObject<
  Properties<SetInteractionOutcomeInput>
> {
  return z.object({
    id: z.string(),
    outcome: InteractionOutcomeSchema.nullish(),
  });
}

export function SetOpportunityDetailsInputSchema(): z.ZodObject<
  Properties<SetOpportunityDetailsInput>
> {
  return z.object({
    amount: z.number().nullish(),
    currency: z.string().nullish(),
    funderId: z.string().nullish(),
    fundingRate: z.number().nullish(),
    instrument: InstrumentSchema.nullish(),
    name: z.string().nullish(),
    programme: z.lazy(() =>
      SetOpportunityDetailsProgrammeInputSchema().nullish(),
    ),
    rolling: z.boolean().nullish(),
    roundLabel: z.string().nullish(),
    roundOpenedAt: z.iso.datetime().nullish(),
    whereToApply: z.string().nullish(),
  });
}

export function SetOpportunityDetailsProgrammeInputSchema(): z.ZodObject<
  Properties<SetOpportunityDetailsProgrammeInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function SetOpportunityStatusInputSchema(): z.ZodObject<
  Properties<SetOpportunityStatusInput>
> {
  return z.object({
    changedAt: z.iso.datetime(),
    reason: z.string().nullish(),
    status: OpportunityStatusSchema,
  });
}

export function SetOwnerInputSchema(): z.ZodObject<Properties<SetOwnerInput>> {
  return z.object({
    owner: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
  });
}

export function StepSchema(): z.ZodObject<Properties<Step>> {
  return z.object({
    __typename: z.literal("Step").optional(),
    at: z.iso.datetime(),
    checkedAt: z.iso.datetime(),
    id: z.string(),
    kind: StepKindSchema,
    label: z.string(),
    source: z.string(),
    targeted: z.boolean(),
    timeZone: z.string(),
  });
}

export function SubmissionSchema(): z.ZodObject<Properties<Submission>> {
  return z.object({
    __typename: z.literal("Submission").optional(),
    id: z.string(),
    outcome: z.lazy(() => SubmissionOutcomeSchema().nullish()),
    stepId: z.string().nullish(),
    submittedAt: z.iso.datetime(),
    submittedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      }),
    where: z.string().nullish(),
  });
}

export function SubmissionOutcomeSchema(): z.ZodObject<
  Properties<SubmissionOutcome>
> {
  return z.object({
    __typename: z.literal("SubmissionOutcome").optional(),
    amount: z.number().nullish(),
    currency: z.string().nullish(),
    receivedAt: z.iso.datetime(),
    result: SubmissionResultSchema,
    text: z.string().nullish(),
  });
}

export function TargetCutOffInputSchema(): z.ZodObject<
  Properties<TargetCutOffInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function UnlinkContactInputSchema(): z.ZodObject<
  Properties<UnlinkContactInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function UpdateConditionFactNoteInputSchema(): z.ZodObject<
  Properties<UpdateConditionFactNoteInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function UpdateConditionInputSchema(): z.ZodObject<
  Properties<UpdateConditionInput>
> {
  return z.object({
    checkedAt: z.iso.datetime().nullish(),
    decisionIds: z.array(z.string()).nullish(),
    factNotes: z
      .array(z.lazy(() => UpdateConditionFactNoteInputSchema()))
      .nullish(),
    id: z.string(),
    kind: ConditionKindSchema.nullish(),
    source: z.string().nullish(),
    text: z.string().nullish(),
  });
}

export function UpdateInteractionInputSchema(): z.ZodObject<
  Properties<UpdateInteractionInput>
> {
  return z.object({
    at: z.iso.datetime().nullish(),
    id: z.string(),
    kind: InteractionKindSchema.nullish(),
    notesSource: z.lazy(() =>
      UpdateInteractionNotesSourceInputSchema().nullish(),
    ),
    people: z
      .array(z.lazy(() => UpdateInteractionPersonInputSchema()))
      .nullish(),
    status: InteractionStatusSchema.nullish(),
    summary: z.string().nullish(),
    teamMembers: z
      .array(
        z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, {
            error: "Invalid Ethereum address format",
          }),
      )
      .nullish(),
    timeZone: z.string().nullish(),
  });
}

export function UpdateInteractionNotesSourceInputSchema(): z.ZodObject<
  Properties<UpdateInteractionNotesSourceInput>
> {
  return z.object({
    id: z.string(),
    title: z.string(),
  });
}

export function UpdateInteractionPersonInputSchema(): z.ZodObject<
  Properties<UpdateInteractionPersonInput>
> {
  return z.object({
    contactId: z.string(),
    personId: z.string(),
  });
}

export function UpdateNextStepInputSchema(): z.ZodObject<
  Properties<UpdateNextStepInput>
> {
  return z.object({
    dueDate: z.iso.datetime().nullish(),
    id: z.string(),
    owner: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    text: z.string().nullish(),
  });
}

export function UpdatePartnerInputSchema(): z.ZodObject<
  Properties<UpdatePartnerInput>
> {
  return z.object({
    country: z.string().nullish(),
    id: z.string(),
    leadId: z.string().nullish(),
    organisationId: z.string().nullish(),
    role: z.string().nullish(),
    status: PartnerStatusSchema.nullish(),
  });
}

export function UpdateStepInputSchema(): z.ZodObject<
  Properties<UpdateStepInput>
> {
  return z.object({
    at: z.iso.datetime().nullish(),
    checkedAt: z.iso.datetime().nullish(),
    id: z.string(),
    kind: StepKindSchema.nullish(),
    label: z.string().nullish(),
    source: z.string().nullish(),
    timeZone: z.string().nullish(),
  });
}

export function VaultRefSchema(): z.ZodObject<Properties<VaultRef>> {
  return z.object({
    __typename: z.literal("VaultRef").optional(),
    id: z.string(),
    title: z.string(),
  });
}
