import type { ReactNode } from "react";
import type { IconName } from "../../../design-system/icons.js";
import { Icon } from "./Icon.js";

/**
 * An empty place that helps someone start: one sentence on what belongs
 * there, an invented example of one, and the one button that adds the first.
 * The example is never a real record, and is marked "For example".
 */
export function EmptyStart({
  icon,
  title,
  text,
  example,
  action,
}: {
  icon: IconName;
  title: string;
  text: string;
  example: { title: string; detail: string };
  /** The button that adds the first one; the place shows no other while empty. */
  action?: ReactNode;
}) {
  return (
    <div className="pb-empty pb-empty--start" role="status">
      <Icon name={icon} />
      <div className="pb-empty__title">{title}</div>
      <p>{text}</p>
      <div className="pb-empty__example">
        <span className="pb-empty__eg-label">For example</span>
        <span className="pb-empty__eg-title">{example.title}</span>
        <span className="pb-empty__eg-detail">{example.detail}</span>
      </div>
      {action}
    </div>
  );
}
