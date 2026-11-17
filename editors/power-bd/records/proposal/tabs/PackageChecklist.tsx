import type { ProposalState } from "document-models/proposal";

type Package = ProposalState["packages"][number];

/** A row of packages to tick: "Needs:" on a package, "Packages:" on an option. */
export function PackageChecklist({
  label,
  packages,
  checked,
  disabled,
  onToggle,
}: {
  label: string;
  packages: readonly Package[];
  checked: readonly string[];
  disabled: boolean;
  onToggle: (packageId: string, on: boolean) => void;
}) {
  return (
    <div className="pb-row">
      <span className="pb-small pb-faint">{label}</span>
      {packages.map((p) => (
        <label key={p.id} className="pb-row pb-gap-4">
          <input
            type="checkbox"
            disabled={disabled}
            checked={checked.includes(p.id)}
            onChange={(ev) => onToggle(p.id, ev.target.checked)}
          />
          <span className="pb-small">{p.name || p.code}</span>
        </label>
      ))}
    </div>
  );
}
