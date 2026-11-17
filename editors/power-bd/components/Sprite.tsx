import { spriteMarkup } from "../../../design-system/icons.js";
import "../kit/design.js";

/** The design system's icon sprite. Insert once, inside `.pb-root`. */
export function Sprite() {
  return <span dangerouslySetInnerHTML={{ __html: spriteMarkup() }} />;
}
