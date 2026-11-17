import { dispatchActions } from "@powerhousedao/reactor-browser";
import {
  actions,
  reducer,
  utils,
  type ContactAction,
} from "document-models/contact";
import { useState } from "react";
import { Icon } from "../../../components/Icon.js";
import { ErrorLine } from "../../../components/shared/ErrorLine.js";
import { useCreateRecord } from "../../../components/shared/useCreateRecord.js";
import { firstRefusal } from "../../../kit/first-run/index.js";

/** Step 4: the first organisation, with just enough to tell it apart. */
export function OrganisationStep({
  driveId,
  count,
  onNext,
}: {
  driveId: string;
  /** Organisations the drive already has. */
  count: number;
  onNext: () => void;
}) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [country, setCountry] = useState("");
  const [refused, setRefused] = useState<string | null>(null);
  const record = useCreateRecord(
    driveId,
    "Organisations",
    "powerbd/contact",
    "The organisation could not be added.",
  );

  /** Adds the organisation; anything unexpected shows as the form's message. */
  const add = () => {
    tryAdd().catch((e: unknown) =>
      setRefused(
        e instanceof Error ? e.message : "The organisation could not be added.",
      ),
    );
  };
  const tryAdd = async () => {
    setRefused(null);
    const steps: ContactAction[] = [
      actions.setProfile({
        name: name.trim(),
        ...(website.trim() ? { website: website.trim() } : {}),
      }),
      ...(country.trim()
        ? [actions.setAddress({ country: country.trim() })]
        : []),
    ];
    // The model's own rules, checked before the record exists.
    const refusal = firstRefusal(reducer, utils.createDocument(), steps);
    if (refusal) return setRefused(refusal);
    const id = await record.create(name.trim(), { open: false });
    if (!id) return;
    let failed: string | undefined;
    try {
      await dispatchActions(steps, id, (errors) => {
        failed = errors[0]?.message;
      });
    } catch (e) {
      failed =
        e instanceof Error ? e.message : "The organisation could not be added.";
    }
    if (failed) return setRefused(failed);
    setName("");
    setWebsite("");
    setCountry("");
    onNext();
  };

  return (
    <div className="pb-guide__form">
      {count > 0 && (
        <p className="pb-guide__done">
          <Icon name="check" />
          {count === 1
            ? "You have one organisation. Add another here, or carry on."
            : `You have ${count} organisations. Add another here, or carry on.`}
        </p>
      )}
      <div className="pb-guide__fields">
        <label className="pb-field is-wide">
          <span className="pb-field__label">Name</span>
          <input
            className="pb-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && name.trim() && add()}
            placeholder="Kelvar Institute"
          />
          <span className="pb-field__help">
            The everyday name, as the team says it. A customer, a partner or a
            funder all count.
          </span>
        </label>
        <label className="pb-field">
          <span className="pb-field__label">Website</span>
          <input
            className="pb-input"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="kelvar.example"
          />
          <span className="pb-field__help">
            Optional. It tells apart two organisations with similar names.
          </span>
        </label>
        <label className="pb-field">
          <span className="pb-field__label">Country</span>
          <input
            className="pb-input"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Switzerland"
          />
          <span className="pb-field__help">Optional.</span>
        </label>
      </div>
      <ErrorLine message={refused ?? record.error} />
      <div className="pb-guide__actions">
        <button
          type="button"
          className="pb-btn pb-btn--primary"
          disabled={!name.trim() || record.busy}
          onClick={add}
        >
          <Icon name="plus" />
          Add the organisation
        </button>
        {count > 0 && (
          <button
            type="button"
            className="pb-btn pb-btn--ghost"
            onClick={onNext}
          >
            Continue
            <Icon name="arrow-right" />
          </button>
        )}
      </div>
      <p className="pb-reassure">
        <Icon name="shield" />
        People, tags and notes can be added on the organisation's page whenever
        you have them.
      </p>
    </div>
  );
}
