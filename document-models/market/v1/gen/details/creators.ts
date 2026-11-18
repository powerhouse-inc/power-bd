/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import { createAction } from "document-model";
import { SetMarketDetailsInputSchema } from "../schema/zod.js";
import type { SetMarketDetailsInput } from "../types.js";
import type { SetMarketDetailsAction } from "./actions.js";

export const setMarketDetails = (input: SetMarketDetailsInput) =>
  createAction<SetMarketDetailsAction>(
    "SET_MARKET_DETAILS",
    { ...input },
    undefined,
    SetMarketDetailsInputSchema,
    "global",
  );
