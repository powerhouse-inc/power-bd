/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsOpportunityDocument,
  assertIsOpportunityState,
  initialGlobalState,
  initialLocalState,
  isOpportunityDocument,
  isOpportunityState,
  opportunityDocumentType,
  utils,
} from "document-models/opportunity/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("Opportunity Document Model", () => {
  it("should create a new Opportunity document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(opportunityDocumentType);
  });

  it("should create a new Opportunity document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isOpportunityDocument(document)).toBe(true);
    expect(isOpportunityState(document.state)).toBe(true);
  });
  it("should reject a document that is not a Opportunity document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsOpportunityDocument(wrongDocumentType)).toThrow();
      expect(isOpportunityDocument(wrongDocumentType)).toBe(false);
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
    expect(isOpportunityState(wrongState.state)).toBe(false);
    expect(assertIsOpportunityState(wrongState.state)).toThrow();
    expect(isOpportunityDocument(wrongState)).toBe(false);
    expect(assertIsOpportunityDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isOpportunityState(wrongInitialState.state)).toBe(false);
    expect(assertIsOpportunityState(wrongInitialState.state)).toThrow();
    expect(isOpportunityDocument(wrongInitialState)).toBe(false);
    expect(assertIsOpportunityDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isOpportunityDocument(missingIdInHeader)).toBe(false);
    expect(assertIsOpportunityDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isOpportunityDocument(missingNameInHeader)).toBe(false);
    expect(assertIsOpportunityDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isOpportunityDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsOpportunityDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isOpportunityDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsOpportunityDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
