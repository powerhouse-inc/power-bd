/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsLeadDocument,
  assertIsLeadState,
  initialGlobalState,
  initialLocalState,
  isLeadDocument,
  isLeadState,
  leadDocumentType,
  utils,
} from "document-models/lead/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("Lead Document Model", () => {
  it("should create a new Lead document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(leadDocumentType);
  });

  it("should create a new Lead document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isLeadDocument(document)).toBe(true);
    expect(isLeadState(document.state)).toBe(true);
  });
  it("should reject a document that is not a Lead document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsLeadDocument(wrongDocumentType)).toThrow();
      expect(isLeadDocument(wrongDocumentType)).toBe(false);
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
    expect(isLeadState(wrongState.state)).toBe(false);
    expect(assertIsLeadState(wrongState.state)).toThrow();
    expect(isLeadDocument(wrongState)).toBe(false);
    expect(assertIsLeadDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isLeadState(wrongInitialState.state)).toBe(false);
    expect(assertIsLeadState(wrongInitialState.state)).toThrow();
    expect(isLeadDocument(wrongInitialState)).toBe(false);
    expect(assertIsLeadDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isLeadDocument(missingIdInHeader)).toBe(false);
    expect(assertIsLeadDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isLeadDocument(missingNameInHeader)).toBe(false);
    expect(assertIsLeadDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isLeadDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(assertIsLeadDocument(missingCreatedAtUtcIsoInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isLeadDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(false);
    expect(assertIsLeadDocument(missingLastModifiedAtUtcIsoInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
