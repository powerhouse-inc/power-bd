import { useUser } from "@powerhousedao/reactor-browser";
import { generateId } from "document-model";
import type { Action } from "document-model";
import {
  actions as leadActions,
  reducer as leadReducer,
  utils as leadUtils,
  type LeadAction,
} from "document-models/lead";
import {
  actions as opportunityActions,
  reducer as opportunityReducer,
  utils as opportunityUtils,
  type OpportunityAction,
} from "document-models/opportunity";
import { useState } from "react";
import { VOCABULARY } from "../../../../../design-system/vocabulary.js";
import { Icon } from "../../../components/Icon.js";
import { ErrorLine } from "../../../components/shared/ErrorLine.js";
import { newDay } from "../../../components/shared/relationship/common.js";
import { OwnerPicker } from "../../../components/shared/OwnerPicker.js";
import { useCreateRecord } from "../../../components/shared/useCreateRecord.js";
import { useTeam } from "../../../components/shared/useTeam.js";
import { enumValue, LEAD_KINDS } from "../../../kit/enums.js";
import {
  firstRefusal,
  missingFields,
  parseAmount,
} from "../../../kit/first-run/index.js";
import { useContactDocumentsInSelectedDrive } from "../../../components/useDriveDocuments.js";
import { useDriveWrite } from "../../../components/data/driveData.js";

type Kind = "lead" | "opportunity";
type Problems = ReturnType<typeof missingFields> & {
  amount?: string;
  form?: string;
};

const WORDS = {
  lead: {
    pick: "Lead",
    name: "Pilot with Kelvar Institute",
    nameHelp:
      "What the team will call it: often the organisation and what it is about.",
    organisation: "Organisation",
    add: "Add the lead",
    failure: "The lead could not be added.",
  },
  opportunity: {
    pick: "Funding opportunity",
    name: "Harbour Innovation Fund, round 3",
    nameHelp: "The programme or call, and the round if it has one.",
    organisation: "Funder",
    add: "Add the opportunity",
    failure: "The opportunity could not be added.",
  },
} as const;

/** Step 5: the first lead or funding opportunity, with an owner and a next step. */
export function RelationshipStep({ driveId }: { driveId: string }) {
  const { dispatchTo } = useDriveWrite();
  const contacts = useContactDocumentsInSelectedDrive() ?? [];
  const team = useTeam();
  const mine = useUser()?.address;
  const [kind, setKind] = useState<Kind>("lead");
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState<string>();
  const [leadKind, setLeadKind] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [pickedOwner, setPickedOwner] = useState<string>();
  const [nextStep, setNextStep] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [problems, setProblems] = useState<Problems>({});
  const words = WORDS[kind];
  const lead = useCreateRecord(
    driveId,
    "Leads",
    "powerbd/lead",
    WORDS.lead.failure,
  );
  const opportunity = useCreateRecord(
    driveId,
    "Opportunities",
    "powerbd/opportunity",
    WORDS.opportunity.failure,
  );
  const record = kind === "lead" ? lead : opportunity;

  // Until someone is chosen: the person signed in, or the only one on the team.
  const signedIn = team.active.find(
    (m) => m.address.toLowerCase() === mine?.toLowerCase(),
  );
  const owner =
    pickedOwner ??
    signedIn?.address ??
    (team.active.length === 1 ? team.active[0].address : "");
  const organisationId = organisation ?? contacts.at(0)?.header.id ?? "";

  /** Creates the record and fills it; a refusal comes back as text. */
  const fill = async <A extends Action>(steps: A[]): Promise<string | null> => {
    const id = await record.create(name.trim(), { open: false });
    if (!id) return null;
    let failed: string | null = null;
    try {
      await dispatchTo(steps, id, (errors) => {
        failed = errors[0]?.message ?? words.failure;
      });
    } catch (e) {
      failed = e instanceof Error ? e.message : words.failure;
    }
    return failed;
  };

  /** Adds the record; anything unexpected shows as the form's message. */
  const add = () => {
    tryAdd().catch((e: unknown) =>
      setProblems({ form: e instanceof Error ? e.message : words.failure }),
    );
  };
  const tryAdd = async () => {
    const found: Problems = missingFields({ name, owner, nextStep });
    const figure = kind === "opportunity" ? parseAmount(amount) : null;
    if (figure === undefined)
      found.amount = "Write the amount in figures, such as 250000.";
    setProblems(found);
    if (Object.keys(found).length > 0) return;

    const step = {
      id: generateId(),
      text: nextStep.trim(),
      owner,
      ...(dueDate ? { dueDate: newDay(dueDate) } : {}),
    };
    if (kind === "lead") {
      const picked = enumValue(LEAD_KINDS, leadKind);
      const steps: LeadAction[] = [
        leadActions.setLeadDetails({
          name: name.trim(),
          ...(organisationId ? { organisationId } : {}),
          ...(picked ? { kind: picked } : {}),
        }),
        leadActions.setOwner({ owner }),
        leadActions.addNextStep(step),
      ];
      // The model's own rules, checked before the record exists.
      const refusal = firstRefusal(
        leadReducer,
        leadUtils.createDocument(),
        steps,
      );
      if (refusal) return setProblems({ form: refusal });
      const failed = await fill(steps);
      if (failed) setProblems({ form: failed });
      return;
    }
    const code = currency.trim().toUpperCase();
    const steps: OpportunityAction[] = [
      opportunityActions.setOpportunityDetails({
        name: name.trim(),
        ...(organisationId ? { funderId: organisationId } : {}),
        ...(figure != null ? { amount: figure } : {}),
        ...(code ? { currency: code } : {}),
      }),
      opportunityActions.setOwner({ owner }),
      opportunityActions.addNextStep(step),
    ];
    const refusal = firstRefusal(
      opportunityReducer,
      opportunityUtils.createDocument(),
      steps,
    );
    // The only rule a new opportunity can break here is about its amount.
    if (refusal) return setProblems({ amount: refusal });
    const failed = await fill(steps);
    if (failed) setProblems({ form: failed });
  };

  return (
    <div className="pb-guide__form">
      <div className="pb-segmented" role="group" aria-label="What to add">
        {(["lead", "opportunity"] as const).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            className={`pb-segmented__item${kind === k ? " is-active" : ""}`}
            onClick={() => {
              setKind(k);
              setProblems({});
            }}
          >
            <Icon name={k === "lead" ? "leads" : "funding"} />
            {WORDS[k].pick}
          </button>
        ))}
      </div>
      <div className="pb-guide__fields">
        <label className="pb-field is-wide">
          <span className="pb-field__label">Name</span>
          <input
            className={`pb-input${problems.name ? " is-invalid" : ""}`}
            value={name}
            aria-invalid={problems.name ? true : undefined}
            onChange={(e) => setName(e.target.value)}
            placeholder={words.name}
          />
          <ErrorLine message={problems.name} />
          <span className="pb-field__help">{words.nameHelp}</span>
        </label>
        <label className="pb-field">
          <span className="pb-field__label">{words.organisation}</span>
          <select
            className="pb-input"
            value={organisationId}
            onChange={(e) => setOrganisation(e.target.value)}
          >
            <option value="">Not set</option>
            {contacts.map((c) => (
              <option key={c.header.id} value={c.header.id}>
                {c.state.global.name || "Unnamed organisation"}
              </option>
            ))}
          </select>
          {contacts.length === 0 && (
            <span className="pb-field__help">
              No organisation yet. Add one in step 4, or set it later.
            </span>
          )}
        </label>
        {kind === "lead" ? (
          <label className="pb-field">
            <span className="pb-field__label">Kind</span>
            <select
              className="pb-input"
              value={leadKind}
              onChange={(e) => setLeadKind(e.target.value)}
            >
              <option value="">Decide later</option>
              {VOCABULARY.relationshipKind
                .filter((k) => enumValue(LEAD_KINDS, k.value))
                .map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
            </select>
          </label>
        ) : (
          <div className="pb-field">
            <span className="pb-field__label">Amount</span>
            <span className="pb-flex pb-flex--center pb-gap-8">
              <input
                className={`pb-input${problems.amount ? " is-invalid" : ""}`}
                inputMode="decimal"
                aria-label="Amount"
                aria-invalid={problems.amount ? true : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250000"
              />
              <input
                className="pb-input pb-w-80"
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="EUR"
              />
            </span>
            <ErrorLine message={problems.amount} />
            <span className="pb-field__help">
              Optional. The figure, then its three-letter currency:{" "}
              <span className="pb-eg">250000</span>{" "}
              <span className="pb-eg">EUR</span>. An amount always keeps its
              currency.
            </span>
          </div>
        )}
        <div className="pb-field">
          <OwnerPicker
            value={owner}
            onChange={(address) => setPickedOwner(address ?? "")}
            emptyLabel="Choose an owner"
            error={problems.owner}
          />
          <span className="pb-field__help">
            {team.active.length === 0
              ? "Nobody is on the team yet. Add people in step 1, then choose one here."
              : "The one person who keeps this moving. It shows under “Mine” for them."}
          </span>
        </div>
        <div className="pb-field">
          <span className="pb-field__label">Next step</span>
          <span className="pb-flex pb-flex--center pb-gap-8">
            <input
              className={`pb-input${problems.nextStep ? " is-invalid" : ""}`}
              aria-label="Next step"
              aria-invalid={problems.nextStep ? true : undefined}
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="Send the pilot outline"
            />
            <input
              className="pb-input pb-w-160"
              type="date"
              aria-label="Due on"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </span>
          <ErrorLine message={problems.nextStep} />
          <span className="pb-field__help">
            The one thing that moves this forward, and the day it is due. With a
            day, it shows under “Coming up”.
          </span>
        </div>
      </div>
      <ErrorLine message={problems.form ?? record.error} />
      <div className="pb-guide__actions">
        <button
          type="button"
          className="pb-btn pb-btn--primary"
          disabled={record.busy}
          onClick={add}
        >
          <Icon name="plus" />
          {words.add}
        </button>
      </div>
      <p className="pb-reassure">
        <Icon name="shield" />
        Adding it here sends nothing to anyone. It appears on the board, and you
        can change every detail on its page.
      </p>
    </div>
  );
}
