/** The part of the browser's clipboard a copy needs. */
export interface TextClipboard {
  writeText(text: string): Promise<void>;
}

/** What a copy came to: done, or why not, in one short line for the person. */
export type CopyResult = { ok: true } | { ok: false; message: string };

export const COPY_REFUSED = "The browser refused to copy.";
export const COPY_UNAVAILABLE = "This browser can't copy from here.";

/**
 * Puts the text on the clipboard as given. A browser without a clipboard, or
 * one that refuses (no permission, page not in focus), is said so, never
 * passed over in silence.
 */
export async function copyText(
  text: string,
  clipboard: TextClipboard | undefined,
): Promise<CopyResult> {
  if (!clipboard) return { ok: false, message: COPY_UNAVAILABLE };
  try {
    await clipboard.writeText(text);
    return { ok: true };
  } catch {
    return { ok: false, message: COPY_REFUSED };
  }
}
