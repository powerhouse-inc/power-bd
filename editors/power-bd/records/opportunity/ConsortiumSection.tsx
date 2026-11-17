import type {
  AddPartnerInput,
  PartnerStatus,
} from "document-models/opportunity";
import { generateId } from "document-model";
import { useState } from "react";
import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import {
  ErrorLine,
  Section,
  useRun,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { enumValue } from "../../kit/enums.js";
import { PARTNER_STATUSES } from "../../kit/funding/index.js";

export type PartnerItem = {
  id: string;
  organisationId: string;
  role?: string | null;
  country?: string | null;
  status: PartnerStatus;
};
const PARTNER_STATUS = VOCABULARY.partnerStatus.map(
  (t) => [t.value, t.label, t.tone] as const,
);

/** The consortium: its coordinator and partners, each an organisation we track. */
export function ConsortiumSection({
  coordinatorId,
  partners,
  contacts,
  onCoordinator,
  onAdd,
  onRemove,
  onStatus,
}: {
  coordinatorId?: string | null;
  partners: readonly PartnerItem[];
  contacts: readonly { id: string; name: string }[];
  onCoordinator: (id: string | undefined, e: OnErrors) => void;
  onAdd: (p: AddPartnerInput, e: OnErrors) => void;
  onRemove: (id: string, e: OnErrors) => void;
  /** A partner moves on: asked, interested, committed, signed. */
  onStatus: (id: string, status: PartnerItem["status"], e: OnErrors) => void;
}) {
  const run = useRun();
  const [org, setOrg] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<PartnerStatus>("ASKED");
  const name = (id: string) =>
    contacts.find((c) => c.id === id)?.name ?? "An organisation";
  return (
    <Section title="Consortium" count={partners.length}>
      <div className="pb-row pb-mb-8">
        <span className="pb-small pb-muted">Coordinator</span>
        <select
          className="pb-select pb-select--inline"
          aria-label="Coordinator"
          value={coordinatorId ?? ""}
          onChange={(e) =>
            run.run((er) => onCoordinator(e.target.value || undefined, er))
          }
        >
          <option value="">Not set</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {partners.length === 0 ? (
        <p className="pb-faint pb-small">No partners yet.</p>
      ) : (
        <div className="pb-list">
          {partners.map((p) => {
            return (
              <div className="pb-list__item" key={p.id}>
                <span className="pb-list__lead">
                  <Icon name="organisations" />
                </span>
                <div className="pb-list__main">
                  <span className="pb-list__title">
                    {name(p.organisationId)}
                  </span>
                  <span className="pb-list__sub">
                    {[p.role, p.country].filter(Boolean).join(" · ")}
                  </span>
                </div>
                <div className="pb-list__end">
                  <select
                    className="pb-select pb-select--inline"
                    aria-label={`Status of ${name(p.organisationId)}`}
                    value={p.status}
                    onChange={(e) => {
                      const next = enumValue(PARTNER_STATUSES, e.target.value);
                      if (next) run.run((er) => onStatus(p.id, next, er));
                    }}
                  >
                    {PARTNER_STATUS.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <button
                    className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--icon"
                    aria-label={`Remove partner ${name(p.organisationId)}`}
                    onClick={() => run.run((er) => onRemove(p.id, er))}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="pb-row pb-wrap pb-mt-8">
        <select
          className="pb-select pb-select--inline"
          aria-label="Partner organisation"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
        >
          <option value="">Choose an organisation</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="pb-input"
          placeholder="Role"
          aria-label="Partner role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <input
          className="pb-input"
          placeholder="Country"
          aria-label="Partner country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <select
          className="pb-select pb-select--inline"
          aria-label="Partner status"
          value={status}
          onChange={(e) =>
            setStatus(enumValue(PARTNER_STATUSES, e.target.value) ?? status)
          }
        >
          {PARTNER_STATUS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button
          className="pb-btn pb-btn--sm"
          disabled={!org}
          onClick={() =>
            run.run(
              (er) => {
                onAdd(
                  {
                    id: generateId(),
                    organisationId: org,
                    role: role.trim() || undefined,
                    country: country.trim() || undefined,
                    status,
                  },
                  er,
                );
              },
              () => {
                setOrg("");
                setRole("");
                setCountry("");
              },
            )
          }
        >
          <Icon name="plus" />
          Add partner
        </button>
      </div>
      <ErrorLine message={run.error} />
    </Section>
  );
}
