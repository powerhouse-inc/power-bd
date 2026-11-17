import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { actions, type ContactAction } from "document-models/contact";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import {
  initials,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { CommitField } from "../settings/CommitField.js";

export type Person = {
  id: string;
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
};

export function PersonRow({
  person,
  send,
}: {
  person: Person;
  send: (action: ContactAction, onErrors: OnErrors) => void;
}) {
  const [open, setOpen] = useState(false);
  const run = useRun();
  const update = (patch: Partial<Omit<Person, "id">>) =>
    run.run((e) => send(actions.updatePerson({ id: person.id, ...patch }), e));
  return (
    <div className="pb-ruled">
      <div className="pb-flex pb-flex--center pb-gap-10">
        <span className="pb-avatar pb-avatar--md">{initials(person.name)}</span>
        <span className="pb-flex-1 pb-minw-0">
          <strong>{person.name}</strong>
          <span className="pb-muted pb-small">
            {[person.role, person.email, person.phone]
              .filter(Boolean)
              .map((t) => ` · ${t}`)}
          </span>
        </span>
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm"
          onClick={() => setOpen(!open)}
        >
          <Icon name="edit" />
          {open ? "Done" : "Edit"}
        </button>
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm"
          onClick={() =>
            run.run((e) => send(actions.removePerson({ id: person.id }), e))
          }
        >
          <Icon name="trash" />
          Remove
        </button>
      </div>
      {open && (
        <div className="pb-grid pb-gap-8 pb-autofit-180 pb-mt-8">
          <CommitField
            label="Name"
            value={person.name}
            onCommit={(v) => v && update({ name: v })}
          />
          <CommitField
            label="Role"
            value={person.role ?? ""}
            onCommit={(v) => update({ role: v })}
          />
          <CommitField
            label="Email"
            value={person.email ?? ""}
            onCommit={(v) => update({ email: v })}
          />
          <CommitField
            label="Phone"
            value={person.phone ?? ""}
            onCommit={(v) => update({ phone: v })}
          />
        </div>
      )}
      <ErrorLine message={run.error} />
    </div>
  );
}
