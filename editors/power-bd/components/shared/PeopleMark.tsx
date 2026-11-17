import { Icon } from "../Icon.js";

/** The mark on a button that only a person may press. */
export function PeopleMark() {
  return (
    <span className="pb-btn__people">
      <Icon name="people-only" className="pb-icon pb-icon--xs" />
    </span>
  );
}
