import { useState } from "react";
import { ErrorLine } from "../ErrorLine.js";
import { generateId } from "document-model";
import { Icon } from "../../Icon.js";
import { initials, Section, useRun, type OnErrors } from "./common.js";

export type ContactLinkItem = {
  id: string;
  contactId: string;
  personId?: string | null;
  role?: string | null;
};
export type ContactChoice = {
  id: string;
  name: string;
  people: { id: string; name: string; role?: string | null }[];
};

export function ContactLinksSection({
  items,
  contacts,
  onLink,
  onUnlink,
}: {
  items: readonly ContactLinkItem[];
  contacts: readonly ContactChoice[];
  onLink: (
    link: { id: string; contactId: string; personId?: string; role?: string },
    onErrors: OnErrors,
  ) => void;
  onUnlink: (id: string, onErrors: OnErrors) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [contactId, setContactId] = useState("");
  const [personId, setPersonId] = useState("");
  const [role, setRole] = useState("");
  const { error, run } = useRun();
  const chosen = contacts.find((c) => c.id === contactId);
  return (
    <Section
      title="People"
      count={items.length}
      action={
        <button
          className="pb-btn pb-btn--ghost pb-btn--sm"
          onClick={() => setAdding(!adding)}
        >
          <Icon name="plus" />
          Link
        </button>
      }
    >
      {adding ? (
        <div className="pb-row pb-mb-8">
          <select
            className="pb-select pb-select--inline"
            aria-label="Organisation"
            value={contactId}
            onChange={(e) => {
              setContactId(e.target.value);
              setPersonId("");
            }}
          >
            <option value="">Pick an organisation</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="pb-select pb-select--inline"
            aria-label="Person"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
          >
            <option value="">The organisation as a whole</option>
            {chosen?.people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            className="pb-input"
            placeholder="Role in this relationship"
            aria-label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <button
            className="pb-btn pb-btn--primary pb-btn--sm"
            disabled={!contactId}
            onClick={() =>
              run((onErrors) =>
                onLink(
                  {
                    id: generateId(),
                    contactId,
                    personId: personId || undefined,
                    role: role.trim() || undefined,
                  },
                  onErrors,
                ),
                () => {
                  setContactId("");
                  setPersonId("");
                  setRole("");
                  setAdding(false);
                },
              )
            }
          >
            Link person
          </button>
        </div>
      ) : null}
      <ErrorLine message={error} />
      {items.length === 0 ? (
        <p className="pb-faint pb-small">No people linked yet.</p>
      ) : null}
      {items.map((l) => {
        const contact = contacts.find((c) => c.id === l.contactId);
        const person = contact?.people.find((p) => p.id === l.personId);
        const name = person?.name ?? contact?.name ?? "Unknown contact";
        return (
          <div key={l.id} className="pb-row">
            <span className="pb-person">
              <span className="pb-avatar pb-avatar--md pb-avatar--pink">
                {initials(name)}
              </span>
              {name}
            </span>
            <span className="pb-faint pb-small">
              {[person ? contact?.name : null, l.role ?? person?.role]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <button
              className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
              aria-label="Unlink this person"
              onClick={() => run((onErrors) => onUnlink(l.id, onErrors))}
            >
              <Icon name="close" />
            </button>
          </div>
        );
      })}
    </Section>
  );
}
