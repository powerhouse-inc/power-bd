import type { IconName } from "../../../design-system/icons.js";
import "../kit/design.js";

/** One icon from the design system's set; the name is type-checked. */
export function Icon({
  name,
  className = "pb-icon",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg className={className} aria-hidden="true">
      <use href={`#pb-i-${name}`} />
    </svg>
  );
}

export { Sprite } from "./Sprite.js";
