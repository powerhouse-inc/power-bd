import { useTeam } from "./useTeam.js";

/**
 * Picks an owner by name from the team list. The value is the member's
 * address. A deactivated member stays selectable only while they are the
 * current owner, so nobody new is given work they cannot pick up.
 */
export function OwnerPicker({
  value,
  onChange,
  label = "Owner",
  emptyLabel = "No owner",
  error,
  bare = false,
}: {
  value: string | null | undefined;
  onChange: (address: string | undefined) => void;
  label?: string;
  emptyLabel?: string;
  error?: string;
  /** The row beside the picker already names it: the label is read out, not shown twice. */
  bare?: boolean;
}) {
  const { active, members } = useTeam();
  const current = value
    ? members.find((m) => m.address.toLowerCase() === value.toLowerCase())
    : undefined;
  const options = current && !current.active ? [...active, current] : active;
  return (
    <label className="pb-field">
      {bare ? null : <span className="pb-field__label">{label}</span>}
      <select
        className="pb-input"
        aria-label={bare ? label : undefined}
        value={current?.address ?? (value ? "unknown" : "")}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value || undefined)}
      >
        <option value="">{emptyLabel}</option>
        {value && !current && (
          <option value="unknown">Someone not on the team</option>
        )}
        {options.map((m) => (
          <option key={m.id} value={m.address}>
            {m.name}
            {m.active ? "" : " (inactive)"}
          </option>
        ))}
      </select>
      {error && <span className="pb-field__error">{error}</span>}
    </label>
  );
}
