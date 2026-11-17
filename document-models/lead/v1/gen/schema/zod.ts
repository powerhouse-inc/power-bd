/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddAngleInput,
  AddConfidentialItemInput,
  AddInteractionInput,
  AddInteractionNotesSourceInput,
  AddInteractionPersonInput,
  AddNextStepInput,
  AddReferenceInput,
  Angle,
  ApproveMessageInput,
  CompleteNextStepInput,
  ConfidentialItem,
  ContactLink,
  DiscardMessageInput,
  DraftMessageInput,
  DraftMessageRecipientInput,
  Fit,
  Interaction,
  InteractionKind,
  InteractionStatus,
  LeadKind,
  LeadState,
  LeadStatus,
  LinkContactInput,
  MarkMessageSentInput,
  Message,
  MessageChannel,
  MessageStatus,
  NextStep,
  ParkLeadInput,
  PersonRef,
  Reference,
  ReferenceKind,
  RemoveAngleInput,
  RemoveConfidentialItemInput,
  RemoveInteractionInput,
  RemoveNextStepInput,
  RemoveReferenceInput,
  ReopenMessageInput,
  ReopenNextStepInput,
  SetLeadDetailsInput,
  SetLeadStatusInput,
  SetOwnerInput,
  UnlinkContactInput,
  UnparkLeadInput,
  UpdateAngleInput,
  UpdateInteractionInput,
  UpdateInteractionNotesSourceInput,
  UpdateInteractionPersonInput,
  UpdateMessageInput,
  UpdateMessageRecipientInput,
  UpdateNextStepInput,
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

export const FitSchema = z.enum(["BEST", "GOOD", "LATER", "UNLIKELY"]);

export const InteractionKindSchema = z.enum([
  "CALL",
  "EMAIL",
  "EVENT",
  "MEETING",
  "MESSAGE",
  "OTHER",
]);

export const InteractionStatusSchema = z.enum([
  "CANCELLED",
  "HELD",
  "SCHEDULED",
]);

export const LeadKindSchema = z.enum([
  "EXCHANGE",
  "INVESTOR",
  "PARTNERSHIP",
  "SALES",
]);

export const LeadStatusSchema = z.enum([
  "IN_TOUCH",
  "LOST",
  "MEETING_SET",
  "MET",
  "PARKED",
  "PROPOSAL",
  "TO_CONTACT",
  "WON",
]);

export const MessageChannelSchema = z.enum(["EMAIL", "LINKEDIN", "OTHER"]);

export const MessageStatusSchema = z.enum([
  "APPROVED",
  "DISCARDED",
  "DRAFT",
  "SENT",
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

export function AddAngleInputSchema(): z.ZodObject<Properties<AddAngleInput>> {
  return z.object({
    fit: FitSchema,
    id: z.string(),
    positioningId: z.string().nullish(),
    summary: z.string(),
  });
}

export function AddConfidentialItemInputSchema(): z.ZodObject<
  Properties<AddConfidentialItemInput>
> {
  return z.object({
    addedAt: z.iso.datetime(),
    addedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
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
        z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
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

export function AngleSchema(): z.ZodObject<Properties<Angle>> {
  return z.object({
    __typename: z.literal("Angle").optional(),
    fit: FitSchema,
    id: z.string(),
    positioningId: z.string().nullish(),
    summary: z.string(),
  });
}

export function ApproveMessageInputSchema(): z.ZodObject<
  Properties<ApproveMessageInput>
> {
  return z.object({
    approvedAt: z.iso.datetime(),
    approvedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
    id: z.string(),
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

export function ConfidentialItemSchema(): z.ZodObject<
  Properties<ConfidentialItem>
> {
  return z.object({
    __typename: z.literal("ConfidentialItem").optional(),
    addedAt: z.iso.datetime(),
    addedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
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

export function DiscardMessageInputSchema(): z.ZodObject<
  Properties<DiscardMessageInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function DraftMessageInputSchema(): z.ZodObject<
  Properties<DraftMessageInput>
> {
  return z.object({
    angleId: z.string().nullish(),
    body: z.string(),
    channel: MessageChannelSchema,
    draftedAt: z.iso.datetime(),
    draftedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
    id: z.string(),
    recipient: z.lazy(() => DraftMessageRecipientInputSchema().nullish()),
    subject: z.string().nullish(),
  });
}

export function DraftMessageRecipientInputSchema(): z.ZodObject<
  Properties<DraftMessageRecipientInput>
> {
  return z.object({
    contactId: z.string(),
    personId: z.string(),
  });
}

export function InteractionSchema(): z.ZodObject<Properties<Interaction>> {
  return z.object({
    __typename: z.literal("Interaction").optional(),
    at: z.iso.datetime().nullish(),
    id: z.string(),
    kind: InteractionKindSchema,
    notesSource: z.lazy(() => VaultRefSchema().nullish()),
    people: z.array(z.lazy(() => PersonRefSchema())),
    status: InteractionStatusSchema,
    summary: z.string().nullish(),
    teamMembers: z.array(
      z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      }),
    ),
    timeZone: z.string().nullish(),
  });
}

export function LeadStateSchema(): z.ZodObject<Properties<LeadState>> {
  return z.object({
    __typename: z.literal("LeadState").optional(),
    angles: z.array(z.lazy(() => AngleSchema())),
    closedAt: z.iso.datetime().nullish(),
    confidentialItems: z.array(z.lazy(() => ConfidentialItemSchema())),
    contactLinks: z.array(z.lazy(() => ContactLinkSchema())),
    interactions: z.array(z.lazy(() => InteractionSchema())),
    kind: LeadKindSchema.nullish(),
    messages: z.array(z.lazy(() => MessageSchema())),
    name: z.string().nullish(),
    nextSteps: z.array(z.lazy(() => NextStepSchema())),
    organisationId: z.string().nullish(),
    owner: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    parkedFrom: LeadStatusSchema.nullish(),
    references: z.array(z.lazy(() => ReferenceSchema())),
    status: LeadStatusSchema,
    statusReason: z.string().nullish(),
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

export function MarkMessageSentInputSchema(): z.ZodObject<
  Properties<MarkMessageSentInput>
> {
  return z.object({
    id: z.string(),
    sentAt: z.iso.datetime(),
    sentBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
  });
}

export function MessageSchema(): z.ZodObject<Properties<Message>> {
  return z.object({
    __typename: z.literal("Message").optional(),
    angleId: z.string().nullish(),
    approvedAt: z.iso.datetime().nullish(),
    approvedBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    body: z.string(),
    channel: MessageChannelSchema,
    draftedAt: z.iso.datetime(),
    draftedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
    id: z.string(),
    recipient: z.lazy(() => PersonRefSchema().nullish()),
    sentAt: z.iso.datetime().nullish(),
    sentBy: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    status: MessageStatusSchema,
    subject: z.string().nullish(),
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

export function ParkLeadInputSchema(): z.ZodObject<Properties<ParkLeadInput>> {
  return z.object({
    parkedAt: z.iso.datetime(),
    reason: z.string(),
  });
}

export function PersonRefSchema(): z.ZodObject<Properties<PersonRef>> {
  return z.object({
    __typename: z.literal("PersonRef").optional(),
    contactId: z.string(),
    personId: z.string(),
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

export function RemoveAngleInputSchema(): z.ZodObject<
  Properties<RemoveAngleInput>
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

export function RemoveReferenceInputSchema(): z.ZodObject<
  Properties<RemoveReferenceInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function ReopenMessageInputSchema(): z.ZodObject<
  Properties<ReopenMessageInput>
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

export function SetLeadDetailsInputSchema(): z.ZodObject<
  Properties<SetLeadDetailsInput>
> {
  return z.object({
    kind: LeadKindSchema.nullish(),
    name: z.string().nullish(),
    organisationId: z.string().nullish(),
  });
}

export function SetLeadStatusInputSchema(): z.ZodObject<
  Properties<SetLeadStatusInput>
> {
  return z.object({
    changedAt: z.iso.datetime(),
    reason: z.string().nullish(),
    status: LeadStatusSchema,
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

export function UnlinkContactInputSchema(): z.ZodObject<
  Properties<UnlinkContactInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function UnparkLeadInputSchema(): z.ZodObject<
  Properties<UnparkLeadInput>
> {
  return z.object({
    _empty: z.boolean().nullish(),
  });
}

export function UpdateAngleInputSchema(): z.ZodObject<
  Properties<UpdateAngleInput>
> {
  return z.object({
    fit: FitSchema.nullish(),
    id: z.string(),
    positioningId: z.string().nullish(),
    summary: z.string().nullish(),
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
        z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
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

export function UpdateMessageInputSchema(): z.ZodObject<
  Properties<UpdateMessageInput>
> {
  return z.object({
    angleId: z.string().nullish(),
    body: z.string().nullish(),
    channel: MessageChannelSchema.nullish(),
    id: z.string(),
    recipient: z.lazy(() => UpdateMessageRecipientInputSchema().nullish()),
    subject: z.string().nullish(),
  });
}

export function UpdateMessageRecipientInputSchema(): z.ZodObject<
  Properties<UpdateMessageRecipientInput>
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

export function VaultRefSchema(): z.ZodObject<Properties<VaultRef>> {
  return z.object({
    __typename: z.literal("VaultRef").optional(),
    id: z.string(),
    title: z.string(),
  });
}
