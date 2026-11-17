import type { FileRef } from "document-models/proposal";
import { blockText, type DocBlock } from "./blocks.js";

/** A picture of the document: shown once or more, defined once at the end under its label. */
export type DocPicture = {
  label: string;
  ref: FileRef["ref"];
  type: string;
  caption: string;
};

/** The markdown with every picture in it, or the captions of the pictures that could not be had. */
export type WithPictures =
  | { ok: true; markdown: string }
  | { ok: false; missing: string[] };

/** A stretch of the Markdown view: the text as Export writes it, or the place of a picture's data URL. */
export type ShownPart =
  | { kind: "text"; text: string }
  | { kind: "picture"; picture: DocPicture };

/** A picture's data, folded to one line: its type and size, and whether it can't be read. */
export type PictureFold = { text: string; unread: boolean };

/** The body, each figure pointing at its picture's label, and the pictures in the order they first stand. */
function referenced(blocks: readonly DocBlock[]) {
  const pictures: DocPicture[] = [];
  const labels = new Map<string, string>();
  const body = blocks
    .map((block) => {
      if (block.kind !== "figure") return blockText(block);
      let label = labels.get(block.ref);
      if (label === undefined) {
        label = `figure-${labels.size + 1}`;
        labels.set(block.ref, label);
        pictures.push({
          label,
          ref: block.ref,
          type: block.type,
          caption: block.caption,
        });
      }
      return `![${block.caption}][${label}]`;
    })
    .join("\n\n");
  return { body, pictures };
}

/** The pictures Export and Copy carry: each once, in the order it first stands. */
export function documentPictures(blocks: readonly DocBlock[]): DocPicture[] {
  return referenced(blocks).pictures;
}

/**
 * The blocks as one markdown document that carries its pictures: each figure
 * points at a label (`![caption][figure-1]`), and the labels are defined at the
 * end as data URLs, so the body stays readable.
 */
export function markdownWithPictures(
  blocks: readonly DocBlock[],
  data: ReadonlyMap<string, string>,
): WithPictures {
  const { body, pictures } = referenced(blocks);
  const missing = pictures
    .filter((p) => !data.has(p.ref))
    .map((p) => p.caption);
  if (missing.length > 0) return { ok: false, missing };
  const definitions = pictures.map(
    (p) => `[${p.label}]: data:${p.type};base64,${data.get(p.ref)}`,
  );
  const end = definitions.length > 0 ? `\n\n${definitions.join("\n")}` : "";
  return { ok: true, markdown: `${body}${end}\n` };
}

/** "PNG picture" for `image/png`, "SVG picture" for `image/svg+xml`; "Picture" for any other type. */
function kindOf(type: string): string {
  const [kind, format] = type.split("/");
  return kind === "image" && format
    ? `${format.split("+")[0].toUpperCase()} picture`
    : "Picture";
}

/** 512 bytes, 9.9 KB, 412 KB, 1.2 MB: one decimal under ten, a whole number above. */
function sizeText(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  let value = bytes / 1024;
  let unit = "KB";
  if (value >= 999.5) {
    value /= 1024;
    unit = "MB";
  }
  return `${value < 9.95 ? value.toFixed(1) : Math.round(value)} ${unit}`;
}

/**
 * A picture's data, folded to one line for the Markdown view: its type and its
 * size in bytes; the type alone while the size is not known (undefined), and
 * a word that it can't be read (null).
 */
export function pictureFold(
  type: string,
  size: number | null | undefined,
): PictureFold {
  if (size === null)
    return { text: `${kindOf(type)}, can't be read`, unread: true };
  return {
    text:
      size === undefined ? kindOf(type) : `${kindOf(type)}, ${sizeText(size)}`,
    unread: false,
  };
}

/**
 * The text Export writes, as the Markdown view shows it: the same text, with
 * the place of each picture's data URL marked for its fold.
 */
export function foldedMarkdown(blocks: readonly DocBlock[]): ShownPart[] {
  const { body, pictures } = referenced(blocks);
  if (pictures.length === 0) return [{ kind: "text", text: `${body}\n` }];
  return [
    ...pictures.flatMap((picture, i): ShownPart[] => [
      {
        kind: "text",
        text: `${i === 0 ? `${body}\n\n` : "\n"}[${picture.label}]: `,
      },
      { kind: "picture", picture },
    ]),
    { kind: "text", text: "\n" },
  ];
}

/** Bytes are turned into characters a chunk at a time, under any engine's limit on arguments. */
const CHUNK = 0x8000;

/** A picture's bytes as base64, the way a data URL carries them. */
export function base64Of(bytes: Uint8Array): string {
  let binary = "";
  for (let at = 0; at < bytes.length; at += CHUNK)
    binary += String.fromCharCode(...bytes.subarray(at, at + CHUNK));
  return btoa(binary);
}

/** The file Export saves: named after the proposal's code. */
export function markdownFileName(code: string | null | undefined): string {
  return `${code || "proposal"}.md`;
}

/** The line over the Markdown view: how many pictures the export carries, and that they are folded there. */
export function picturesNote(count: number): string | null {
  if (count === 0) return null;
  return count === 1
    ? "Export and Copy carry 1 picture inside the text. Its data is folded here to one line."
    : `Export and Copy carry ${count} pictures inside the text. Their data is folded here, one line each.`;
}

/** "A", "A" and "B", "A", "B" and "C". */
const quoted = (captions: string[]) => {
  const q = captions.map((c) => `"${c}"`);
  return q.length === 1 ? q[0] : `${q.slice(0, -1).join(", ")} and ${q.at(-1)}`;
};

/** Why an export or a copy stopped: the pictures that could not be read, and the way round. */
export function unreadPicturesMessage(
  captions: string[],
  action: "export" | "copy",
): string {
  const done = action === "export" ? "exported" : "copied";
  return captions.length === 1
    ? `Couldn't read the picture ${quoted(captions)}, so nothing was ${done}. Try again in a moment, or replace the picture under Content.`
    : `Couldn't read ${captions.length} pictures, ${quoted(captions)}, so nothing was ${done}. Try again in a moment, or replace them under Content.`;
}
