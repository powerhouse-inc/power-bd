import type { IconName } from "../../../design-system/icons.js";
import { Icon } from "./Icon.js";

/** A place or record that has nothing to show yet: one sentence, no button. */
export function EmptyPlace({
  icon,
  title,
  text,
}: {
  icon: IconName;
  title: string;
  text: string;
}) {
  return (
    <div className="pb-empty" role="status">
      <Icon name={icon} />
      <div className="pb-empty__title">{title}</div>
      <p>{text}</p>
    </div>
  );
}
