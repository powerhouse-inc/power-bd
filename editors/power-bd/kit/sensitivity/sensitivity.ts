import type { ConfidentialItem } from "document-models/lead";
import type { NeverClaim } from "document-models/playbook";

/** Shared words needed before a quote of a confidential item counts. */
export const QUOTE_WORDS = 8;

export type NeverClaimItem = Pick<NeverClaim, "id" | "phrases">;
export type ConfidentialText = Pick<ConfidentialItem, "id" | "text">;

/** `start` and `end` are character offsets in the checked text; `end` is exclusive. */
export type NeverClaimFinding = {
  kind: "never-claim";
  itemId: string;
  phrase: string;
  start: number;
  end: number;
};

export type ConfidentialFinding = {
  kind: "confidential";
  itemId: string;
  words: number;
  start: number;
  end: number;
};

export type SensitivityFinding = NeverClaimFinding | ConfidentialFinding;

type Word = { word: string; start: number; end: number };

function wordsOf(text: string): Word[] {
  return [...text.matchAll(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)].map(
    (m) => ({
      word: m[0].toLowerCase(),
      start: m.index,
      end: m.index + m[0].length,
    }),
  );
}

function neverClaimFindings(
  text: string,
  items: readonly NeverClaimItem[],
): NeverClaimFinding[] {
  const lower = text.toLowerCase();
  const found: NeverClaimFinding[] = [];
  for (const item of items) {
    for (const phrase of item.phrases) {
      const needle = phrase.trim().toLowerCase();
      if (!needle) continue;
      for (
        let at = lower.indexOf(needle);
        at !== -1;
        at = lower.indexOf(needle, at + needle.length)
      ) {
        found.push({
          kind: "never-claim",
          itemId: item.id,
          phrase: needle,
          start: at,
          end: at + needle.length,
        });
      }
    }
  }
  return found;
}

function confidentialFindings(
  textWords: readonly Word[],
  items: readonly ConfidentialText[],
): ConfidentialFinding[] {
  const found: ConfidentialFinding[] = [];
  for (const item of items) {
    const itemWords = wordsOf(item.text);
    const runs: { i: number; length: number }[] = [];
    for (let i = 0; i < textWords.length; i++) {
      let best = 0;
      for (let j = 0; j < itemWords.length; j++) {
        if (i > 0 && j > 0 && textWords[i - 1].word === itemWords[j - 1].word) {
          continue; // not the start of a maximal run
        }
        let length = 0;
        while (
          i + length < textWords.length &&
          j + length < itemWords.length &&
          textWords[i + length].word === itemWords[j + length].word
        ) {
          length++;
        }
        best = Math.max(best, length);
      }
      if (best >= QUOTE_WORDS) runs.push({ i, length: best });
    }
    let covered = -1;
    for (const { i, length } of runs) {
      if (i + length - 1 <= covered) continue;
      covered = i + length - 1;
      found.push({
        kind: "confidential",
        itemId: item.id,
        words: length,
        start: textWords[i].start,
        end: textWords[i + length - 1].end,
      });
    }
  }
  return found;
}

/**
 * Checks any text against the playbook's never-claim phrases (case-insensitive)
 * and the confidential items of a lead (eight or more consecutive shared words,
 * ignoring case and punctuation). Findings come in text order.
 */
export function checkSensitivity(
  text: string,
  neverClaims: readonly NeverClaimItem[],
  confidentialItems: readonly ConfidentialText[],
): SensitivityFinding[] {
  return [
    ...neverClaimFindings(text, neverClaims),
    ...confidentialFindings(wordsOf(text), confidentialItems),
  ].sort((a, b) => a.start - b.start);
}
