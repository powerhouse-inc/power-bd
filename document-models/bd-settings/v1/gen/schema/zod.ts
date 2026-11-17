/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddTeamMemberInput,
  BdSettingsState,
  DeactivateTeamMemberInput,
  ReactivateTeamMemberInput,
  SetDueWindowInput,
  SetRetentionInput,
  SetTimeZoneInput,
  SetVaultDriveInput,
  TeamMember,
  UpdateTeamMemberInput,
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

export function AddTeamMemberInputSchema(): z.ZodObject<
  Properties<AddTeamMemberInput>
> {
  return z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
    id: z.string(),
    name: z.string(),
  });
}

export function BdSettingsStateSchema(): z.ZodObject<
  Properties<BdSettingsState>
> {
  return z.object({
    __typename: z.literal("BdSettingsState").optional(),
    dueWindowDays: z.number(),
    retentionMonths: z.number(),
    teamMembers: z.array(z.lazy(() => TeamMemberSchema())),
    timeZone: z.string().nullish(),
    vaultDriveId: z.string().nullish(),
  });
}

export function DeactivateTeamMemberInputSchema(): z.ZodObject<
  Properties<DeactivateTeamMemberInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function ReactivateTeamMemberInputSchema(): z.ZodObject<
  Properties<ReactivateTeamMemberInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function SetDueWindowInputSchema(): z.ZodObject<
  Properties<SetDueWindowInput>
> {
  return z.object({
    days: z.number(),
  });
}

export function SetRetentionInputSchema(): z.ZodObject<
  Properties<SetRetentionInput>
> {
  return z.object({
    months: z.number(),
  });
}

export function SetTimeZoneInputSchema(): z.ZodObject<
  Properties<SetTimeZoneInput>
> {
  return z.object({
    timeZone: z.string(),
  });
}

export function SetVaultDriveInputSchema(): z.ZodObject<
  Properties<SetVaultDriveInput>
> {
  return z.object({
    driveId: z.string(),
  });
}

export function TeamMemberSchema(): z.ZodObject<Properties<TeamMember>> {
  return z.object({
    __typename: z.literal("TeamMember").optional(),
    active: z.boolean(),
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
      error: "Invalid Ethereum address format",
    }),
    id: z.string(),
    name: z.string(),
  });
}

export function UpdateTeamMemberInputSchema(): z.ZodObject<
  Properties<UpdateTeamMemberInput>
> {
  return z.object({
    address: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, {
        error: "Invalid Ethereum address format",
      })
      .nullish(),
    id: z.string(),
    name: z.string().nullish(),
  });
}
