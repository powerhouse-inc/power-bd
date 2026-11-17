import {
  actions,
  type SetProposalDetailsInput,
} from "document-models/proposal";
import { ErrorLine } from "../../../components/shared/ErrorLine.js";
import { useRenameRecord } from "../../../components/shared/useRenameRecord.js";
import { useRun } from "../../../components/shared/useRun.js";
import { VaultNotes } from "../../../components/shared/VaultNotes.js";
import { CURRENCY_FORMAT, currencyCode } from "../../../kit/format/index.js";
import type { ContactChoice } from "../../../kit/proposal-view/index.js";
import { Cell, convert, type Field } from "../Items.js";
import type { TabProps } from "./types.js";
import { asText } from "./values.js";

const field = (
  key: string,
  label: string,
  kind: Field["kind"],
  size?: Field["size"],
): Field => ({ key, label, kind, size });

const TITLE = field("title", "Title", "text", "fill");
const CODE = field("code", "Code", "text", "short");
const CURRENCY = field("currency", "Currency", "text", "short");
const VALID_UNTIL = field("validUntil", "Valid until", "date");
const BINDING = field(
  "bindingOnSignature",
  "Signing makes it binding",
  "check",
);
const PERSONAL_DATA = field(
  "processesPersonalData",
  "Personal data is processed",
  "check",
);

/** The text fields of the details, each with how its raw value becomes the action's input. */
const TEXT_ROWS: {
  label: string;
  field: Field;
  read: (raw: unknown) => SetProposalDetailsInput;
  /** Why what was typed can't be saved; nothing is sent then. */
  check?: (raw: unknown) => string | null;
  value: (s: TabProps["s"]) => string | null | undefined;
}[] = [
  {
    label: "Title",
    field: TITLE,
    read: (raw) => ({ title: asText(convert(TITLE, raw)) }),
    value: (s) => s.title,
  },
  {
    label: "Short code",
    field: CODE,
    read: (raw) => ({ code: asText(convert(CODE, raw)) }),
    value: (s) => s.code,
  },
  {
    label: "Currency",
    field: CURRENCY,
    read: (raw) => ({ currency: currencyCode(String(raw)) }),
    check: (raw) => (currencyCode(String(raw)) ? null : CURRENCY_FORMAT),
    value: (s) => s.currency,
  },
  {
    label: "Valid until",
    field: VALID_UNTIL,
    read: (raw) => ({ validUntil: asText(convert(VALID_UNTIL, raw)) }),
    value: (s) => s.validUntil,
  },
];

/** Details and parties. */
export function DetailsTab({
  s,
  send,
  disabled,
  leadName,
  contacts,
  documentId,
}: TabProps & {
  documentId: string;
  leadName: string;
  contacts: readonly ContactChoice[];
}) {
  const run = useRun();
  const entityRun = useRun();
  const renameEntry = useRenameRecord(documentId);
  const set = (input: SetProposalDetailsInput) =>
    run.run(
      (e) => send(actions.setProposalDetails(input), e),
      () => input.title != null && renameEntry(input.title),
    );
  const recipient = s.recipient
    ? `${s.recipient.contactId}|${s.recipient.personId ?? ""}`
    : "";
  return (
    <div className="pb-stack pb-gap-12">
      <div className="pb-props">
        {TEXT_ROWS.map((row) => (
          <div key={row.label} className="pb-contents">
            <div className="pb-prop__key">{row.label}</div>
            <div
              className="pb-prop__value is-readonly"
              data-find={`field:${row.field.key}`}
            >
              <Cell
                field={row.field}
                value={row.value(s)}
                disabled={disabled}
                onCommit={(raw) => {
                  const why = row.check?.(raw);
                  if (why) run.run((e) => e([new Error(why)]));
                  else set(row.read(raw));
                }}
              />
            </div>
          </div>
        ))}
        <div className="pb-prop__key">Signing</div>
        <div className="pb-prop__value pb-stack pb-gap-4">
          <Cell
            field={BINDING}
            value={s.bindingOnSignature}
            disabled={disabled}
            onCommit={(v) => set({ bindingOnSignature: !!v })}
          />
          <Cell
            field={PERSONAL_DATA}
            value={s.processesPersonalData}
            disabled={disabled}
            onCommit={(v) => set({ processesPersonalData: !!v })}
          />
        </div>
        <div className="pb-prop__key">Client</div>
        <div className="pb-prop__value">{leadName}</div>
        <div className="pb-prop__key">Recipient</div>
        <div className="pb-prop__value">
          <select
            className="pb-select pb-input--auto"
            aria-label="Recipient"
            disabled={disabled}
            value={recipient}
            onChange={(e) => {
              const [contactId, personId] = e.target.value.split("|");
              if (!contactId) return;
              run.run((er) =>
                send(
                  actions.setProposalParties({
                    recipient: { contactId, personId: personId || undefined },
                  }),
                  er,
                ),
              );
            }}
          >
            <option value="">Not set</option>
            {contacts.flatMap((c) =>
              c.people.map((p) => (
                <option
                  key={`${c.id}|${p.id}`}
                  value={`${c.id}|${p.id}`}
                >{`${p.name} · ${c.name}`}</option>
              )),
            )}
          </select>
        </div>
      </div>
      <VaultNotes
        label="Contracting entity (a company fact in the vault)"
        notes={s.contractingEntity ? [s.contractingEntity] : []}
        disabled={disabled}
        error={entityRun.error ?? undefined}
        onAdd={(n) =>
          entityRun.run((e) =>
            send(actions.setProposalParties({ contractingEntity: n }), e),
          )
        }
        onRemove={() =>
          entityRun.run((e) =>
            send(actions.setProposalParties({ contractingEntity: null }), e),
          )
        }
      />
      <ErrorLine message={run.error} />
    </div>
  );
}
