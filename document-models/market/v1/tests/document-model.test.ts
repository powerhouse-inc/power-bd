/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsMarketDocument,
  assertIsMarketState,
  initialGlobalState,
  initialLocalState,
  isMarketDocument,
  isMarketState,
  marketDocumentType,
  utils,
} from "document-models/market/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("Market Document Model", () => {
  it("should create a new Market document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(marketDocumentType);
  });

  it("should create a new Market document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isMarketDocument(document)).toBe(true);
    expect(isMarketState(document.state)).toBe(true);
  });
  it("should reject a document that is not a Market document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsMarketDocument(wrongDocumentType)).toThrow();
      expect(isMarketDocument(wrongDocumentType)).toBe(false);
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
    expect(isMarketState(wrongState.state)).toBe(false);
    expect(assertIsMarketState(wrongState.state)).toThrow();
    expect(isMarketDocument(wrongState)).toBe(false);
    expect(assertIsMarketDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isMarketState(wrongInitialState.state)).toBe(false);
    expect(assertIsMarketState(wrongInitialState.state)).toThrow();
    expect(isMarketDocument(wrongInitialState)).toBe(false);
    expect(assertIsMarketDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isMarketDocument(missingIdInHeader)).toBe(false);
    expect(assertIsMarketDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isMarketDocument(missingNameInHeader)).toBe(false);
    expect(assertIsMarketDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isMarketDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(assertIsMarketDocument(missingCreatedAtUtcIsoInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isMarketDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsMarketDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
