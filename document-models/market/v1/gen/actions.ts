/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 */
import type { MarketApprovalAction } from "./approval/actions.js";
import type { MarketDetailsAction } from "./details/actions.js";
import type { MarketFiguresAction } from "./figures/actions.js";
import type { MarketMapAction } from "./map/actions.js";
import type { MarketSegmentsAction } from "./segments/actions.js";

export * from "./approval/actions.js";
export * from "./details/actions.js";
export * from "./figures/actions.js";
export * from "./map/actions.js";
export * from "./segments/actions.js";

export type MarketAction =
  | MarketDetailsAction
  | MarketSegmentsAction
  | MarketFiguresAction
  | MarketMapAction
  | MarketApprovalAction;
