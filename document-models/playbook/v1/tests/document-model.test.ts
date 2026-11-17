/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */
/**
 * This is a scaffold file meant for customization:
 * - change it by adding new tests or modifying the existing ones
 */

import {
  assertIsPlaybookDocument,
  assertIsPlaybookState,
  initialGlobalState,
  initialLocalState,
  isPlaybookDocument,
  isPlaybookState,
  playbookDocumentType,
  utils,
} from "document-models/playbook/v1";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

describe("Playbook Document Model", () => {
  it("should create a new Playbook document", () => {
    const document = utils.createDocument();

    expect(document).toBeDefined();
    expect(document.header.documentType).toBe(playbookDocumentType);
  });

  it("should create a new Playbook document with a valid initial state", () => {
    const document = utils.createDocument();
    expect(document.state.global).toStrictEqual(initialGlobalState);
    expect(document.state.local).toStrictEqual(initialLocalState);
    expect(isPlaybookDocument(document)).toBe(true);
    expect(isPlaybookState(document.state)).toBe(true);
  });
  it("should reject a document that is not a Playbook document", () => {
    const wrongDocumentType = utils.createDocument();
    wrongDocumentType.header.documentType = "the-wrong-thing-1234";
    try {
      expect(assertIsPlaybookDocument(wrongDocumentType)).toThrow();
      expect(isPlaybookDocument(wrongDocumentType)).toBe(false);
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
    expect(isPlaybookState(wrongState.state)).toBe(false);
    expect(assertIsPlaybookState(wrongState.state)).toThrow();
    expect(isPlaybookDocument(wrongState)).toBe(false);
    expect(assertIsPlaybookDocument(wrongState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const wrongInitialState = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  wrongInitialState.initialState.global = {
    ...{ notWhat: "you want" },
  };
  try {
    expect(isPlaybookState(wrongInitialState.state)).toBe(false);
    expect(assertIsPlaybookState(wrongInitialState.state)).toThrow();
    expect(isPlaybookDocument(wrongInitialState)).toBe(false);
    expect(assertIsPlaybookDocument(wrongInitialState)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingIdInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingIdInHeader.header.id;
  try {
    expect(isPlaybookDocument(missingIdInHeader)).toBe(false);
    expect(assertIsPlaybookDocument(missingIdInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingNameInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingNameInHeader.header.name;
  try {
    expect(isPlaybookDocument(missingNameInHeader)).toBe(false);
    expect(assertIsPlaybookDocument(missingNameInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingCreatedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingCreatedAtUtcIsoInHeader.header.createdAtUtcIso;
  try {
    expect(isPlaybookDocument(missingCreatedAtUtcIsoInHeader)).toBe(false);
    expect(assertIsPlaybookDocument(missingCreatedAtUtcIsoInHeader)).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }

  const missingLastModifiedAtUtcIsoInHeader = utils.createDocument();
  // @ts-expect-error - we are testing the error case
  delete missingLastModifiedAtUtcIsoInHeader.header.lastModifiedAtUtcIso;
  try {
    expect(isPlaybookDocument(missingLastModifiedAtUtcIsoInHeader)).toBe(false);
    expect(
      assertIsPlaybookDocument(missingLastModifiedAtUtcIsoInHeader),
    ).toThrow();
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError);
  }
});
