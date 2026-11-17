/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";
import type {
  AddPersonInput,
  AddTagInput,
  ArchiveContactInput,
  ContactKind,
  ContactPerson,
  ContactState,
  ContactStatus,
  PostalAddress,
  RemovePersonInput,
  RemoveTagInput,
  SetAddressInput,
  SetProfileInput,
  UpdatePersonInput,
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

export const ContactKindSchema = z.enum([
  "BOTH",
  "CUSTOMER",
  "OTHER",
  "SUPPLIER",
]);

export const ContactStatusSchema = z.enum(["ACTIVE", "ARCHIVED"]);

export function AddPersonInputSchema(): z.ZodObject<
  Properties<AddPersonInput>
> {
  return z.object({
    email: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    phone: z.string().nullish(),
    role: z.string().nullish(),
  });
}

export function AddTagInputSchema(): z.ZodObject<Properties<AddTagInput>> {
  return z.object({
    tag: z.string(),
  });
}

export function ArchiveContactInputSchema(): z.ZodObject<
  Properties<ArchiveContactInput>
> {
  return z.object({
    archived: z.boolean(),
  });
}

export function ContactPersonSchema(): z.ZodObject<Properties<ContactPerson>> {
  return z.object({
    __typename: z.literal("ContactPerson").optional(),
    email: z.string().nullish(),
    id: z.string(),
    name: z.string(),
    phone: z.string().nullish(),
    role: z.string().nullish(),
  });
}

export function ContactStateSchema(): z.ZodObject<Properties<ContactState>> {
  return z.object({
    __typename: z.literal("ContactState").optional(),
    address: z.lazy(() => PostalAddressSchema()),
    email: z.string().nullish(),
    kind: ContactKindSchema,
    name: z.string().nullish(),
    notes: z.string().nullish(),
    people: z.array(z.lazy(() => ContactPersonSchema())),
    phone: z.string().nullish(),
    registrationNumber: z.string().nullish(),
    status: ContactStatusSchema,
    tags: z.array(z.string()),
    vatId: z.string().nullish(),
    website: z.string().nullish(),
  });
}

export function PostalAddressSchema(): z.ZodObject<Properties<PostalAddress>> {
  return z.object({
    __typename: z.literal("PostalAddress").optional(),
    city: z.string().nullish(),
    country: z.string().nullish(),
    postalCode: z.string().nullish(),
    street: z.string().nullish(),
  });
}

export function RemovePersonInputSchema(): z.ZodObject<
  Properties<RemovePersonInput>
> {
  return z.object({
    id: z.string(),
  });
}

export function RemoveTagInputSchema(): z.ZodObject<
  Properties<RemoveTagInput>
> {
  return z.object({
    tag: z.string(),
  });
}

export function SetAddressInputSchema(): z.ZodObject<
  Properties<SetAddressInput>
> {
  return z.object({
    city: z.string().nullish(),
    country: z.string().nullish(),
    postalCode: z.string().nullish(),
    street: z.string().nullish(),
  });
}

export function SetProfileInputSchema(): z.ZodObject<
  Properties<SetProfileInput>
> {
  return z.object({
    email: z.string().nullish(),
    kind: ContactKindSchema.nullish(),
    name: z.string().nullish(),
    notes: z.string().nullish(),
    phone: z.string().nullish(),
    registrationNumber: z.string().nullish(),
    vatId: z.string().nullish(),
    website: z.string().nullish(),
  });
}

export function UpdatePersonInputSchema(): z.ZodObject<
  Properties<UpdatePersonInput>
> {
  return z.object({
    email: z.string().nullish(),
    id: z.string(),
    name: z.string().nullish(),
    phone: z.string().nullish(),
    role: z.string().nullish(),
  });
}
