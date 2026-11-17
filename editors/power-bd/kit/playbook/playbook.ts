/** Pure rules for the Playbook view: no React, no server. */

export type PositioningStatus = "DRAFT" | "APPROVED" | "RETIRED";

/** The line to show beside the edit control, before the person edits. */
export function editNote(status: PositioningStatus): string | undefined {
  if (status === "APPROVED")
    return "Editing approved positioning sends it back to draft and clears the approval. Someone has to approve it again.";
  if (status === "RETIRED") return "Retired positioning cannot change.";
  return undefined;
}

/** One phrase per line, trimmed, without blanks or repeats. */
export function parsePhrases(text: string): string[] {
  const seen = new Set<string>();
  for (const line of text.split("\n")) {
    const phrase = line.trim();
    if (phrase) seen.add(phrase);
  }
  return [...seen];
}

export function phrasesToText(phrases: readonly string[]): string {
  return phrases.join("\n");
}

/** Whether approve is on offer, and why not when it is not. */
export function approvalState(
  status: PositioningStatus,
  signedIn: boolean,
): { allowed: true } | { allowed: false; reason: string } {
  if (status !== "DRAFT")
    return { allowed: false, reason: "Only a draft can be approved." };
  if (!signedIn)
    return { allowed: false, reason: "Sign in to approve: only a person can." };
  return { allowed: true };
}
