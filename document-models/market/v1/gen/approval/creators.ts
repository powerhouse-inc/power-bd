/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import {
  ApproveSizeInputSchema,
  ReopenSizeInputSchema,
} from "../schema/zod.js";
import type { ApproveSizeInput, ReopenSizeInput } from "../types.js";
import type { ApproveSizeAction, ReopenSizeAction } from "./actions.js";

export const approveSize = (input: ApproveSizeInput) =>
  createAction<ApproveSizeAction>(
    "APPROVE_SIZE",
    { ...input },
    undefined,
    ApproveSizeInputSchema,
    "global",
  );

export const reopenSize = (input: ReopenSizeInput = {}) =>
  createAction<ReopenSizeAction>(
    "REOPEN_SIZE",
    { ...input },
    undefined,
    ReopenSizeInputSchema,
    "global",
  );
