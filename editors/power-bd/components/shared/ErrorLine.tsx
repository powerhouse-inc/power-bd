import { Icon } from "../Icon.js";

/** The reducer's message beside the control that caused it; nothing when there is none. */
export function ErrorLine({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="pb-field__error" role="alert">
      <Icon name="alert-circle" className="pb-icon pb-icon--xs" />
      {message}
    </div>
  );
}
