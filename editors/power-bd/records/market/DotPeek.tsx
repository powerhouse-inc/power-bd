import { actions, type MarketState } from "document-models/market";
import { useSetSelectedNode } from "../../components/shared/useOpenRecord.js";
import { useEffect, useRef } from "react";
import type { ViewportBox } from "../../components/shared/useViewportBox.js";
import { Icon } from "../../components/Icon.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { VaultNotes } from "../../components/shared/VaultNotes.js";
import { useRun } from "../../components/shared/relationship/common.js";
import { checkSensitivity, type NeverClaimItem } from "../../kit/sensitivity/sensitivity.js";
import type { Selected, Send } from "./shared.js";

type Contact = { id: string; name?: string | null; tags: readonly string[] };
type Lead = { id: string; name?: string | null; organisationId?: string | null };
type Positioning = { id: string; title: string; status: string };

/**
 * One dot seen without leaving the map: why it sits there, the evidence, the
 * organisation's tags and leads, and taking it off the map. For Powerhouse:
 * the note, checked against the never-claim list, and the positioning
 * statement it stands for.
 */
export function DotPeek({
  market: s,
  selected,
  contacts,
  leads,
  positioning,
  neverClaims,
  send,
  place,
  onClose,
}: {
  market: MarketState;
  selected: NonNullable<Selected>;
  contacts: readonly Contact[];
  leads: readonly Lead[];
  positioning: readonly Positioning[];
  neverClaims: readonly (NeverClaimItem & { claim: string })[];
  send: Send;
  /** Where the page is in view: the peek covers that part. */
  place: ViewportBox | null;
  onClose: () => void;
}) {
  const open = useSetSelectedNode();
  const note = useRun();
  const evidence = useRun();
  const remove = useRun();
  const closeButton = useRef<HTMLButtonElement>(null);
  // Focus without scrolling: autoFocus would scroll the page to the peek's top and lose the map.
  useEffect(() => closeButton.current?.focus({ preventScroll: true }), []);
  const player = selected.kind === "player" ? s.players.find((p) => p.id === selected.id) : undefined;
  const us = selected.kind === "us" ? s.us : undefined;
  if (!player && !us) return null;
  const contact = player ? contacts.find((c) => c.id === player.organisationId) : undefined;
  const title = player ? contact?.name?.trim() || "Unknown organisation" : "Powerhouse";
  const text = (player ? player.note : us?.note) ?? "";
  const theirLeads = player ? leads.filter((l) => l.organisationId === player.organisationId) : [];
  const findings = us ? checkSensitivity(text, neverClaims, []) : [];
  const claimOf = (id: string) => neverClaims.find((n) => n.id === id)?.claim;
  const saveNote = (value: string) =>
    note.run((e) =>
      send(
        player
          ? actions.setPlayerNote({ id: player.id, note: value || null })
          : actions.setOurPosition({ x: us?.x ?? 50, y: us?.y ?? 50, note: value || null, positioningId: us?.positioningId ?? undefined }),
        e,
      ),
    );

  return (
    <aside
      className="pb-peek"
      role="dialog"
      aria-label={title}
      style={place ? { top: place.top, bottom: "auto", height: place.height } : undefined}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="pb-peek__bar">
        <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" ref={closeButton} onClick={onClose}>
          <Icon name="close" />
          Close
        </button>
        {player ? (
          <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={() => open(player.organisationId)}>
            <Icon name="expand" />
            Open the organisation
          </button>
        ) : null}
      </div>
      <div className="pb-peek__body">
        <h2 className="pb-peek__title">{title}</h2>
        {contact && contact.tags.length > 0 ? (
          <p className="pb-tags pb-mb-8">
            {contact.tags.map((t) => (
              <span key={t} className="pb-tag pb-tag--default">{t}</span>
            ))}
          </p>
        ) : null}
        <label className="pb-field">
          <span className="pb-field__label">Why it sits here</span>
          <textarea
            className="pb-textarea"
            defaultValue={text}
            key={`${selected.kind}-${text}`}
            placeholder={player ? "Builds custom software per customer with forward-deployed engineers" : "What our place on this map rests on"}
            onBlur={(e) => e.target.value.trim() !== text && saveNote(e.target.value.trim())}
          />
        </label>
        <ErrorLine message={note.error} />
        {findings.length > 0 ? (
          <div className="pb-callout pb-callout--red">
            <Icon name="alert" />
            <div className="pb-callout__body">
              <div className="pb-callout__title">This note breaks the never-claim list</div>
              {findings.map((f, i) => (
                <div key={i} className="pb-callout__text">
                  “{text.slice(f.start, f.end)}”{f.kind === "never-claim" && claimOf(f.itemId) ? `: ${claimOf(f.itemId)}` : ""}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {us ? (
          <label className="pb-field pb-mt-14">
            <span className="pb-field__label">Stands for this positioning</span>
            <select
              className="pb-select"
              value={us.positioningId ?? ""}
              onChange={(e) =>
                note.run((er) =>
                  send(actions.setOurPosition({ x: us.x, y: us.y, note: us.note ?? undefined, positioningId: e.target.value || null }), er),
                )
              }
            >
              <option value="">None</option>
              {positioning.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                  {p.status === "APPROVED" ? "" : " (not approved yet)"}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {player ? (
          <>
            <div className="pb-mt-14">
              <VaultNotes
                label="Evidence"
                notes={player.evidence}
                error={evidence.error}
                onAdd={(n, done) =>
                  evidence.run((e) => send(actions.linkPlayerEvidence({ id: player.id, refId: n.id, refTitle: n.title }), e), done)
                }
                onRemove={(id) => evidence.run((e) => send(actions.unlinkPlayerEvidence({ id: player.id, refId: id }), e))}
              />
            </div>
            <div className="pb-field pb-mt-14">
              <span className="pb-field__label">Leads</span>
              {theirLeads.length > 0 ? (
                <div className="pb-list">
                  {theirLeads.map((l) => (
                    <button key={l.id} type="button" className="pb-list__item" onClick={() => open(l.id)}>
                      <span className="pb-list__lead"><Icon name="leads" /></span>
                      <span className="pb-list__title">{l.name || "Untitled lead"}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <span className="pb-faint pb-small">No lead with this organisation</span>
              )}
            </div>
            <div className="pb-mt-14">
              <button
                type="button"
                className="pb-btn pb-btn--sm"
                onClick={() => remove.run((e) => send(actions.removePlayer({ id: player.id }), e), onClose)}
              >
                <Icon name="trash" />
                Take off the map
              </button>
              <p className="pb-reassure pb-mt-8">
                <Icon name="shield" />
                The organisation and its research stay; only its place on this map goes.
              </p>
              <ErrorLine message={remove.error} />
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
}
