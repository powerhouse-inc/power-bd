import { PersonRow, type Person } from "./PersonRow.js";
import { generateId } from "document-model";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { actions, type ContactAction } from "document-models/contact";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import {
  Section,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";

/** The people we know at an organisation: add, edit in place, remove. */
export function People({
  people,
  send,
}: {
  people: readonly Person[];
  send: (action: ContactAction, onErrors: OnErrors) => void;
}) {
  const add = useRun();
  const [draft, setDraft] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });
  const set = (k: keyof typeof draft) => (e: { target: { value: string } }) =>
    setDraft({ ...draft, [k]: e.target.value });
  const submit = () => {
    if (!draft.name.trim()) return;
    add.run(
      (e) =>
        send(
          actions.addPerson({
            id: generateId(),
            name: draft.name.trim(),
            role: draft.role.trim() || null,
            email: draft.email.trim() || null,
            phone: draft.phone.trim() || null,
          }),
          e,
        ),
      () => setDraft({ name: "", role: "", email: "", phone: "" }),
    );
  };
  return (
    <Section title="People" count={people.length}>
      {people.length === 0 ? (
        <p className="pb-muted">Nobody added yet.</p>
      ) : (
        people.map((p) => <PersonRow key={p.id} person={p} send={send} />)
      )}
      <div className="pb-field pb-mt-12">
        <span className="pb-field__label">Add a person</span>
        <span className="pb-flex pb-gap-8 pb-wrap">
          {(["name", "role", "email", "phone"] as const).map((k) => (
            <input
              key={k}
              className="pb-input pb-flex-1 pb-minw-140"

              placeholder={k[0].toUpperCase() + k.slice(1)}
              aria-label={k}
              value={draft[k]}
              onChange={set(k)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          ))}
          <button
            className="pb-btn pb-btn--sm"
            disabled={!draft.name.trim()}
            onClick={submit}
          >
            <Icon name="plus" />
            Add person
          </button>
        </span>
        <ErrorLine message={add.error} />
      </div>
    </Section>
  );
}
