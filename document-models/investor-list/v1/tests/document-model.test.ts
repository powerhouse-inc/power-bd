/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsInvestorListDocument,
  assertIsInvestorListState,
  initialGlobalState,
  initialLocalState,
  investorListDocumentType,
  isInvestorListDocument,
  isInvestorListState,
  utils,
} from "document-models/investor-list/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("InvestorList Document Model", () => {
  it("should create a new InvestorList document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(investorListDocumentType);
  });

  it("should create a new InvestorList document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isInvestorListDocument(document)).toBe(true);
    expect(isInvestorListState(document.state)).toBe(true);
  });
  it("should reject a document that is not a InvestorList document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsInvestorListDocument(wrongDocumentType)).toThrow();
      expect(isInvestorListDocument(wrongDocumentType)).toBe(false);
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
    expect(isInvestorListState(wrongState.state)).toBe(false);
    expect(assertIsInvestorListState(wrongState.state)).toThrow();
    expect(isInvestorListDocument(wrongState)).toBe(false);
    expect(assertIsInvestorListDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isInvestorListState(wrongInitialState.state)).toBe(false);
    expect(assertIsInvestorListState(wrongInitialState.state)).toThrow();
    expect(isInvestorListDocument(wrongInitialState)).toBe(false);
    expect(assertIsInvestorListDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isInvestorListDocument(missingIdInHeader)).toBe(false);
    expect(assertIsInvestorListDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isInvestorListDocument(missingNameInHeader)).toBe(false);
    expect(assertIsInvestorListDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isInvestorListDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsInvestorListDocument(missingCreatedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isInvestorListDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(
      false,
    );
    expect(
      assertIsInvestorListDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
