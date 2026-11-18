import { useUser } from "@powerhousedao/reactor-browser";
import { generateId } from "document-model";
import {
  actions,
  isBdSettingsDocument,
} from "document-models/bd-settings";
import { useState } from "react";
import { Icon } from "../../../components/Icon.js";
import { ErrorLine } from "../../../components/shared/ErrorLine.js";
import { dispatchWith, useRun } from "../../../components/shared/useRun.js";
import { ownerTone } from "../../../kit/overview-view/owner-tone.js";
import {
  ADDRESS_FORMAT,
  initials,
  isAddress,
  memberName,
} from "../../../kit/settings/index.js";
import { useRecordById } from "../../../components/data/driveData.js";

/** Step 1: the people who can own work, added one at a time. */
export function TeamStep({
  settingsId,
  onStay,
  onNext,
}: {
  settingsId: string;
  /** Keeps this step open while more people are added. */
  onStay: () => void;
  onNext: () => void;
}) {
  const [document, dispatch] = useRecordById(settingsId, isBdSettingsDocument);
  const mine = useUser()?.address;
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [formatError, setFormatError] = useState<string | null>(null);
  const added = useRun();
  if (!document) return null;
  const members = document.state.global.teamMembers;
  const active = members.filter((m) => m.active);
  const error = formatError ?? added.error;

  const add = () => {
    setFormatError(null);
    added.clear();
    if (!isAddress(address)) return setFormatError(ADDRESS_FORMAT);
    onStay();
    added.run(
      (onErrors) =>
        dispatchWith(
          dispatch,
          actions.addTeamMember({
            id: generateId(),
            name: name.trim(),
            address: address.trim(),
          }),
          onErrors,
        ),
      () => {
        setName("");
        setAddress("");
      },
    );
  };

  return (
    <div className="pb-guide__form">
      {active.length > 0 && (
        <ul className="pb-guide__team" aria-label="On the team">
          {active.map((m) => (
            <li key={m.id}>
              <span
                className={`pb-avatar pb-avatar--${ownerTone(m.address, members) ?? "blue"}`}
              >
                {initials(m.name)}
              </span>
              {m.name}
            </li>
          ))}
        </ul>
      )}
      <div className="pb-guide__fields">
        <label className="pb-field">
          <span className="pb-field__label">Name</span>
          <input
            className="pb-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mara Lind"
          />
          <span className="pb-field__help">
            As the team says it. It shows wherever this person owns something.
          </span>
        </label>
        <label className="pb-field">
          <span className="pb-field__label">Vault address</span>
          <input
            className={`pb-input pb-mono${error ? " is-invalid" : ""}`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="0x…"
            aria-invalid={error ? true : undefined}
          />
          <ErrorLine message={error} />
          <span className="pb-field__help">
            The address this person signs in with:{" "}
            <span className="pb-eg">0x</span> and 40 more letters and digits.
            They can copy it from their own profile.
          </span>
        </label>
      </div>
      <div className="pb-guide__actions">
        <button
          type="button"
          className={`pb-btn${active.length === 0 ? " pb-btn--primary" : ""}`}
          disabled={!name.trim() || !address.trim()}
          onClick={add}
        >
          <Icon name="plus" />
          {active.length === 0 ? "Add to the team" : "Add another person"}
        </button>
        {mine && !memberName(members, mine) && address.trim() !== mine && (
          <button
            type="button"
            className="pb-btn pb-btn--ghost"
            onClick={() => setAddress(mine)}
          >
            Use the address I am signed in with
          </button>
        )}
        {active.length > 0 && (
          <button
            type="button"
            className="pb-btn pb-btn--primary"
            onClick={onNext}
          >
            Continue
            <Icon name="arrow-right" />
          </button>
        )}
      </div>
      <p className="pb-reassure">
        <Icon name="shield" />
        You can rename people, or deactivate someone who leaves, in Settings at
        any time.
      </p>
    </div>
  );
}
