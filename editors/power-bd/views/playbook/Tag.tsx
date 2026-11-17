import { VOCABULARY } from "../../../../design-system/vocabulary.js";

/** The positioning status as the design system's tag. */
export function StatusTag({ status }: { status: string }) {
  const term = VOCABULARY.positioningStatus.find((t) => t.value === status);
  return (
    <span className={`pb-tag pb-tag--${term?.tone ?? "default"}`}>
      {term?.label ?? status}
    </span>
  );
}
