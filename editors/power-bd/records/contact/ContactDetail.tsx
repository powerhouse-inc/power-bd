import { NotesField } from "./NotesField.js";
import type { DocumentDispatch } from "@powerhousedao/reactor-browser";
import { organisationLabel } from "../../kit/organisation-list/index.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import {
  actions,
  type ContactAction,
  type ContactDocument,
} from "document-models/contact";
import { useState } from "react";
import { useRenameRecord } from "../../components/shared/useRenameRecord.js";
import { Icon } from "../../components/Icon.js";
import {
  Section,
  useRun,
  dispatchWith,
  type OnErrors,
} from "../../components/shared/relationship/common.js";
import { CommitField } from "../settings/CommitField.js";
import { Gathered } from "./Gathered.js";
import { People } from "./People.js";

/** The organisation page: shown in the Organisations place and in the thin editor. */
export function ContactDetail({
  document,
  dispatch,
}: {
  document: ContactDocument;
  dispatch: DocumentDispatch<ContactAction>;
}) {
  const s = document.state.global;
  const profile = useRun();
  const renameEntry = useRenameRecord(document.header.id);
  const address = useRun();
  const tagRun = useRun();
  const notes = useRun();
  const archive = useRun();
  const [tag, setTag] = useState("");
  const send = (action: ContactAction, onErrors: OnErrors) =>
    dispatchWith(dispatch, action, onErrors);
  const archived = s.status === "ARCHIVED";
  const setProfile = (patch: Parameters<typeof actions.setProfile>[0]) =>
    profile.run(
      (e) => send(actions.setProfile(patch), e),
      () => patch.name && renameEntry(patch.name),
    );
  const setAddress = (patch: Partial<typeof s.address>) =>
    address.run((e) =>
      send(
        actions.setAddress({
          street: s.address.street,
          postalCode: s.address.postalCode,
          city: s.address.city,
          country: s.address.country,
          ...patch,
        }),
        e,
      ),
    );
  const addTag = () => {
    if (!tag.trim()) return;
    tagRun.run(
      (e) => send(actions.addTag({ tag: tag.trim() }), e),
      () => setTag(""),
    );
  };

  return (
    <div className="pb-page">
      <div className="pb-page__head pb-page__head--row">
        <h1 className="pb-page__title">{organisationLabel(s.name)}</h1>
        {archived && <span className="pb-tag pb-tag--default">Archived</span>}
        <span className="pb-toolbar__spacer pb-flex-1" />
        <button
          className="pb-btn pb-btn--sm"
          onClick={() =>
            archive.run((e) =>
              send(actions.archiveContact({ archived: !archived }), e),
            )
          }
        >
          <Icon name="archive" />
          {archived ? "Bring back" : "Archive"}
        </button>
      </div>
      <ErrorLine message={archive.error} />
      <p className="pb-reassure pb-mb-12">
        Archiving hides the organisation from new work. Nothing is deleted.
      </p>

      <Section title="Details">
        <div className="pb-grid pb-gap-10 pb-autofit-220">
          <CommitField
            label="Name"
            value={s.name ?? ""}
            onCommit={(v) => setProfile({ name: v })}
          />
          <CommitField
            label="Website"
            value={s.website ?? ""}
            onCommit={(v) => setProfile({ website: v })}
          />
          <CommitField
            label="Email"
            value={s.email ?? ""}
            onCommit={(v) => setProfile({ email: v })}
          />
          <CommitField
            label="Phone"
            value={s.phone ?? ""}
            onCommit={(v) => setProfile({ phone: v })}
          />
        </div>
        <ErrorLine message={profile.error} />
      </Section>

      <Section title="Address">
        <div className="pb-grid pb-gap-10 pb-autofit-180">
          <CommitField
            label="Country"
            value={s.address.country ?? ""}
            onCommit={(v) => setAddress({ country: v })}
          />
          <CommitField
            label="Street"
            value={s.address.street ?? ""}
            onCommit={(v) => setAddress({ street: v })}
          />
          <CommitField
            label="Postal code"
            value={s.address.postalCode ?? ""}
            onCommit={(v) => setAddress({ postalCode: v })}
          />
          <CommitField
            label="City"
            value={s.address.city ?? ""}
            onCommit={(v) => setAddress({ city: v })}
          />
        </div>
        <ErrorLine message={address.error} />
      </Section>

      <Section title="Tags">
        <span className="pb-tags">
          {s.tags.map((t) => (
            <span key={t} className="pb-tag pb-tag--default">
              {t}
              <button
                className="pb-btn pb-btn--ghost pb-btn--sm"
                aria-label={`Remove tag ${t}`}
                onClick={() =>
                  tagRun.run((e) => send(actions.removeTag({ tag: t }), e))
                }
              >
                <Icon name="close" />
              </button>
            </span>
          ))}
          <input
            className="pb-input pb-maxw-160"

            placeholder="Add a tag"
            aria-label="Add a tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
          />
        </span>
        <ErrorLine message={tagRun.error} />
      </Section>

      <Section title="Notes">
        <NotesField
          value={s.notes ?? ""}
          onCommit={(v) =>
            notes.run((e) => send(actions.setProfile({ notes: v }), e))
          }
        />
        <ErrorLine message={notes.error} />
      </Section>

      <People people={s.people} send={send} />
      <Gathered contactId={document.header.id} />
    </div>
  );
}
