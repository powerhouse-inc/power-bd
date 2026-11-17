import { useDrives, useSelectedDriveId } from "@powerhousedao/reactor-browser";
import { Icon } from "../../components/Icon.js";
import { vaultChoice } from "../../kit/vault/index.js";

/**
 * The vault BD links point at, chosen from the vaults open in this browser.
 * A vault chosen earlier stays chosen, and listed, even when this browser
 * does not have it open. Saves on choosing, like every field on the page.
 */
export function VaultField({
  saved,
  error,
  onChoose,
}: {
  saved: string | null | undefined;
  error?: string;
  onChoose: (driveId: string) => void;
}) {
  const drives = useDrives();
  const ownDriveId = useSelectedDriveId() ?? "";
  const choice = vaultChoice(drives, ownDriveId, saved);
  return (
    <div className="pb-stack pb-gap-6">
      <label className="pb-field">
        <span className="pb-field__label">Vault</span>
        <select
          className={`pb-input${error ? " is-invalid" : ""}`}
          value={choice.value}
          disabled={choice.disabled}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            const driveId = e.target.value;
            if (driveId && driveId !== choice.value) onChoose(driveId);
          }}
        >
          {choice.placeholder !== null && (
            <option value="">{choice.placeholder}</option>
          )}
          {choice.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error ? (
          <span className="pb-field__error">{error}</span>
        ) : (
          <span className="pb-field__help">{choice.help}</span>
        )}
      </label>
      <p className="pb-reassure">
        <Icon name="shield" />
        Choosing a vault changes nothing in it. Links already made keep the
        titles they were made with.
      </p>
    </div>
  );
}
