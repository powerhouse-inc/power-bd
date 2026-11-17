import { useEffect, useRef, useState } from "react";
import { copyText } from "../../kit/clipboard/index.js";

/** How long a button says "Copied" before it reads as itself again. */
const COPIED_FOR_MS = 2000;

/** Copies a text: "Copied" for a moment, or the line saying why the browser would not. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    clearTimeout(timer.current);
    setCopied(false);
    const result = await copyText(text, navigator.clipboard);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), COPIED_FOR_MS);
  };
  return { copied, error, copy };
}
