import { getAttachmentClient } from "@powerhousedao/reactor-browser";
import { useState } from "react";
import type { DocBlock } from "../../kit/proposal-render/blocks.js";
import {
  base64Of,
  documentPictures,
  markdownWithPictures,
  unreadPicturesMessage,
  type DocPicture,
} from "../../kit/proposal-render/pictures.js";

/**
 * Reads each picture's bytes from the space's attachment service, as base64
 * under its reference. A picture that can't be read is left out, so the
 * export can name it.
 */
async function readPictures(
  documentId: string,
  pictures: readonly DocPicture[],
): Promise<Map<string, string>> {
  const data = new Map<string, string>();
  const client = getAttachmentClient();
  if (!client || pictures.length === 0) return data;
  const read = await Promise.allSettled(
    pictures.map(async (picture) => {
      const { blob } = await client.downloadBlob(
        { documentId, ref: picture.ref },
        { mimeType: picture.type },
      );
      return {
        ref: picture.ref,
        base64: base64Of(new Uint8Array(await blob.arrayBuffer())),
      };
    }),
  );
  for (const r of read)
    if (r.status === "fulfilled") data.set(r.value.ref, r.value.base64);
  return data;
}

/**
 * The text Export saves and Copy markdown copies, with its pictures inside.
 * The pictures are read when the button is pressed; while they are, `preparing`
 * is true. When one can't be read, nothing comes back and `error` names it.
 */
export function useWithPictures(
  documentId: string,
  blocks: readonly DocBlock[],
) {
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prepare = async (action: "export" | "copy"): Promise<string | null> => {
    setError(null);
    const pictures = documentPictures(blocks);
    setPreparing(pictures.length > 0);
    try {
      const result = markdownWithPictures(
        blocks,
        await readPictures(documentId, pictures),
      );
      if (result.ok) return result.markdown;
      setError(unreadPicturesMessage(result.missing, action));
      return null;
    } finally {
      setPreparing(false);
    }
  };
  return { preparing, error, prepare };
}
