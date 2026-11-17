/**
 * WARNING: DO NOT EDIT
 * This file is auto-generated and updated by codegen
 * Factory methods for creating BdSettingsDocument instances
 */
import type { PHAuthState, PHBaseState, PHDocumentState } from "document-model";
import { createBaseState, defaultBaseState } from "document-model";
import type {
  BdSettingsDocument,
  BdSettingsGlobalState,
  BdSettingsLocalState,
  BdSettingsPHState,
} from "./types.js";
import { utils } from "./utils.js";

export function defaultGlobalState(): BdSettingsGlobalState {
  return {
    teamMembers: [],
    timeZone: null,
    dueWindowDays: 14,
    vaultDriveId: null,
    retentionMonths: 12,
  };
}

export function defaultLocalState(): BdSettingsLocalState {
  return {};
}

export function defaultPHState(): BdSettingsPHState {
  return {
    ...defaultBaseState(),
    global: defaultGlobalState(),
    local: defaultLocalState(),
  };
}

export function createGlobalState(
  state?: Partial<BdSettingsGlobalState>,
): BdSettingsGlobalState {
  return {
    ...defaultGlobalState(),
    ...(state || {}),
  };
}

export function createLocalState(
  state?: Partial<BdSettingsLocalState>,
): BdSettingsLocalState {
  return {
    ...defaultLocalState(),
    ...(state || {}),
  } as BdSettingsLocalState;
}

export function createState(
  baseState?: Partial<PHBaseState>,
  globalState?: Partial<BdSettingsGlobalState>,
  localState?: Partial<BdSettingsLocalState>,
): BdSettingsPHState {
  return {
    ...createBaseState(baseState?.auth, baseState?.document),
    global: createGlobalState(globalState),
    local: createLocalState(localState),
  };
}

/**
 * Creates a BdSettingsDocument with custom global and local state
 * This properly handles the PHBaseState requirements while allowing
 * document-specific state to be set.
 */
export function createBdSettingsDocument(
  state?: Partial<{
    auth?: Partial<PHAuthState>;
    document?: Partial<PHDocumentState>;
    global?: Partial<BdSettingsGlobalState>;
    local?: Partial<BdSettingsLocalState>;
  }>,
): BdSettingsDocument {
  const document = utils.createDocument(
    createState(
      createBaseState(state?.auth, { version: 1, ...state?.document }),
      state?.global,
      state?.local,
    ),
  );

  return document;
}
