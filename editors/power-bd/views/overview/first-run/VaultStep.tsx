import { useDrives } from "@powerhousedao/reactor-browser";
import {
  actions,
  useBdSettingsDocumentById,
} from "document-models/bd-settings";
import { useState } from "react";
import { vaultDrives } from "../../../kit/first-run/index.js";
import { Icon } from "../../../components/Icon.js";
import { ErrorLine } from "../../../components/shared/ErrorLine.js";
import { dispatchWith, useRun } from "../../../components/shared/useRun.js";

/** Step 3: the vault whose notes are linked from leads and opportunities. It can wait. */
export function VaultStep({
  settingsId,
  driveId,
  onSkip,
  onNext,
}: {
  settingsId: string;
  driveId: string;
  /** Leaves the step for later; absent once the vault is chosen. */
  onSkip?: () => void;
  onNext: () => void;
}) {
  const [document, dispatch] = useBdSettingsDocumentById(settingsId);
  const drives = useDrives();
  const [picked, setPicked] = useState<string>();
  const saving = useRun();
  if (!document) return null;
  const saved = document.state.global.vaultDriveId ?? "";
  const value = picked ?? saved;
  const others = vaultDrives(drives, driveId);
  const known = others.some((d) => d.id === saved);

  return (
    <div className="pb-guide__form">
      <label className="pb-field">
        <span className="pb-field__label">Vault</span>
        <select
          className={`pb-input${saving.error ? " is-invalid" : ""}`}
          value={value}
          disabled={others.length === 0 && !saved}
          aria-invalid={saving.error ? true : undefined}
          onChange={(e) => setPicked(e.target.value)}
        >
          <option value="">
            {others.length === 0 ? "No vault found" : "Choose a vault"}
          </option>
          {saved && !known && (
            <option value={saved}>The vault chosen earlier</option>
          )}
          {others.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <ErrorLine message={saving.error} />
        <span className="pb-field__help">
          {others.length === 0
            ? "No vault is open in this browser yet. Skip this for now, and choose the vault in Settings once it is added."
            : "The vault where the team keeps its notes. Only the vaults open in this browser are listed."}
        </span>
      </label>
      <div className="pb-guide__actions">
        <button
          type="button"
          className="pb-btn pb-btn--primary"
          disabled={!value || value === saved}
          onClick={() =>
            saving.run(
              (onErrors) =>
                dispatchWith(
                  dispatch,
                  actions.setVaultDrive({ driveId: value }),
                  onErrors,
                ),
              onNext,
            )
          }
        >
          <Icon name="check" />
          Use this vault
        </button>
        {onSkip && (
          <button
            type="button"
            className="pb-btn pb-btn--ghost"
            onClick={onSkip}
          >
            Skip for now
          </button>
        )}
      </div>
      <p className="pb-reassure">
        <Icon name="shield" />
        Choosing a vault changes nothing in it, and everything else works
        without one. You can set or change it in Settings.
      </p>
    </div>
  );
}
