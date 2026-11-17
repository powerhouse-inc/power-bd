/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsBdSettingsDocument,
  assertIsBdSettingsState,
  bdSettingsDocumentType,
  initialGlobalState,
  initialLocalState,
  isBdSettingsDocument,
  isBdSettingsState,
  utils,
} from "document-models/bd-settings/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("BdSettings Document Model", () => {
  it("should create a new BdSettings document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(bdSettingsDocumentType);
  });

  it("should create a new BdSettings document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isBdSettingsDocument(document)).toBe(true);
    expect(isBdSettingsState(document.state)).toBe(true);
  });
  it("should reject a document that is not a BdSettings document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsBdSettingsDocument(wrongDocumentType)).toThrow();
      expect(isBdSettingsDocument(wrongDocumentType)).toBe(false);
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
    }
  });
  const wrongState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongState.state.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isBdSettingsState(wrongState.state)).toBe(false);
    expect(assertIsBdSettingsState(wrongState.state)).toThrow();
    expect(isBdSettingsDocument(wrongState)).toBe(false);
    expect(assertIsBdSettingsDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isBdSettingsState(wrongInitialState.state)).toBe(false);
    expect(assertIsBdSettingsState(wrongInitialState.state)).toThrow();
    expect(isBdSettingsDocument(wrongInitialState)).toBe(false);
    expect(assertIsBdSettingsDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isBdSettingsDocument(missingIdInHeader)).toBe(false);
    expect(assertIsBdSettingsDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isBdSettingsDocument(missingNameInHeader)).toBe(false);
    expect(assertIsBdSettingsDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isBdSettingsDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsBdSettingsDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isBdSettingsDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsBdSettingsDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
