/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsDecisionDocument,
  assertIsDecisionState,
  decisionDocumentType,
  initialGlobalState,
  initialLocalState,
  isDecisionDocument,
  isDecisionState,
  utils,
} from "document-models/decision/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("Decision Document Model", () => {
  it("should create a new Decision document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(decisionDocumentType);
  });

  it("should create a new Decision document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isDecisionDocument(document)).toBe(true);
    expect(isDecisionState(document.state)).toBe(true);
  });
  it("should reject a document that is not a Decision document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsDecisionDocument(wrongDocumentType)).toThrow();
      expect(isDecisionDocument(wrongDocumentType)).toBe(false);
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
    expect(isDecisionState(wrongState.state)).toBe(false);
    expect(assertIsDecisionState(wrongState.state)).toThrow();
    expect(isDecisionDocument(wrongState)).toBe(false);
    expect(assertIsDecisionDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isDecisionState(wrongInitialState.state)).toBe(false);
    expect(assertIsDecisionState(wrongInitialState.state)).toThrow();
    expect(isDecisionDocument(wrongInitialState)).toBe(false);
    expect(assertIsDecisionDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isDecisionDocument(missingIdInHeader)).toBe(false);
    expect(assertIsDecisionDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isDecisionDocument(missingNameInHeader)).toBe(false);
    expect(assertIsDecisionDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isDecisionDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(assertIsDecisionDocument(missingCreatedAtUtcIsoInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isDecisionDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsDecisionDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
