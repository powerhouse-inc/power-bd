import { Icon } from "../../components/Icon.js";

/** The "Mine" filter: shows only what the signed-in person owns. */
export function MineButton({
  on,
  disabled,
  onClick,
}: {
  on: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`pb-filter${on ? "" : " pb-filter--off"}`}
      aria-pressed={on}
      disabled={disabled}
      title={disabled ? "Sign in to see what is yours" : undefined}
      onClick={onClick}
    >
      <Icon name="user" className="pb-icon pb-icon--sm" />
      Mine
    </button>
  );
}
