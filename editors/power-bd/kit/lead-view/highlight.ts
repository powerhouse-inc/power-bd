export type Segment = { text: string; marked: boolean };

/** Cuts `text` into plain and marked pieces; overlapping ranges merge. */
export function highlight(
  text: string,
  ranges: readonly { start: number; end: number }[],
): Segment[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let at = 0;
  for (const r of sorted) {
    if (r.end <= Math.max(at, r.start)) continue;
    const start = Math.max(r.start, at);
    if (start > at) out.push({ text: text.slice(at, start), marked: false });
    const last = out.at(-1);
    if (start === at && last?.marked) last.text += text.slice(start, r.end);
    else out.push({ text: text.slice(start, r.end), marked: true });
    at = r.end;
  }
  if (at < text.length) out.push({ text: text.slice(at), marked: false });
  return out.length > 0 ? out : [{ text, marked: false }];
}
