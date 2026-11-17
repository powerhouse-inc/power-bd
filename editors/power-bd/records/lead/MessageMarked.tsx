import { highlight } from "../../kit/lead-view/index.js";
import { type SensitivityFinding } from "../../kit/sensitivity/sensitivity.js";

export type Found = { field: "subject" | "body"; finding: SensitivityFinding };

export function Marked({ text, found }: { text: string; found: Found[] }) {
  return (
    <>
      {highlight(
        text,
        found.map((f) => f.finding),
      ).map((s, i) =>
        s.marked ? (
          <mark key={i} className="pb-mark">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}
