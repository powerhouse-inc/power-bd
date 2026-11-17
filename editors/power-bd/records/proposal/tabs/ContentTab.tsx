import { generateId } from "document-model";
import {
  actions,
  type UpdateAnnexInput,
  type UpdateClauseInput,
  type UpdateSectionInput,
} from "document-models/proposal";
import { useState, type ReactNode } from "react";
import { ErrorLine } from "../../../components/shared/ErrorLine.js";
import { useRun } from "../../../components/shared/useRun.js";
import { Items, type Field } from "../Items.js";
import { ANNEX_KINDS, CLAUSE_KINDS, SECTION_KINDS } from "./options.js";
import type { TabProps } from "./types.js";
import { asFlag, asOneOf, asText, readPatch } from "./values.js";

const SECTION_FIELDS: Field[] = [
  {
    key: "kind",
    label: "Kind",
    kind: "select",
    options: SECTION_KINDS,
    fixed: true,
    required: true,
  },
  { key: "title", label: "Title", kind: "text" },
  { key: "body", label: "Text", kind: "area" },
];
const CLAUSE_FIELDS: Field[] = [
  {
    key: "kind",
    label: "Kind",
    kind: "select",
    options: CLAUSE_KINDS,
    fixed: true,
    required: true,
  },
  { key: "title", label: "Title", kind: "text", required: true },
  { key: "body", label: "Text", kind: "area" },
];
const ANNEX_FIELDS: Field[] = [
  {
    key: "kind",
    label: "Kind",
    kind: "select",
    options: ANNEX_KINDS,
    fixed: true,
    required: true,
  },
  { key: "title", label: "Title", kind: "text", required: true },
  { key: "body", label: "Text", kind: "area" },
  {
    key: "partOfAgreement",
    label: "Part of the agreement",
    kind: "check",
  },
];

/** Sections, clauses and annexes; the figures go in `children`. */
export function ContentTab({
  s,
  send,
  disabled,
  positioning,
  children,
}: TabProps & {
  positioning: { id: string; title: string; text: string }[];
  children?: ReactNode;
}) {
  const run = useRun();
  const [pick, setPick] = useState("");
  const chosen = positioning.find((p) => p.id === pick);
  return (
    <div className="pb-stack pb-gap-16">
      <Items
        title="Sections, in order"
        noun="section"
        list="sections"
        disabled={disabled}
        items={s.sections}
        fields={SECTION_FIELDS}
        moves={(ids, e) => send(actions.reorderSections({ ids }), e)}
        onAdd={(v, e) => {
          const kind = asOneOf(SECTION_KINDS, v.kind);
          if (!kind) return;
          send(
            actions.addSection({
              id: generateId(),
              kind,
              title: asText(v.title),
              body: asText(v.body),
            }),
            e,
          );
        }}
        onUpdate={(id, patch, e) =>
          send(
            actions.updateSection({
              id,
              ...readPatch<Pick<UpdateSectionInput, "title" | "body">>(patch, {
                title: asText,
                body: asText,
              }),
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removeSection({ id }), e)}
      />
      {positioning.length > 0 ? (
        <div className="pb-row">
          <select
            className="pb-select pb-input--auto"
            aria-label="Approved positioning"
            disabled={disabled}
            value={pick}
            onChange={(e) => setPick(e.target.value)}
          >
            <option value="">Take a section from approved positioning…</option>
            {positioning.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button
            className="pb-btn pb-btn--sm"
            disabled={disabled || !chosen}
            onClick={() =>
              chosen &&
              run.run((e) =>
                send(
                  actions.addSection({
                    id: generateId(),
                    kind: "PROSE",
                    title: chosen.title,
                    body: chosen.text,
                    positioningId: chosen.id,
                  }),
                  e,
                ),
              )
            }
          >
            Add as a section
          </button>
          <ErrorLine message={run.error} />
        </div>
      ) : null}
      <Items
        title="Clauses, in order"
        noun="clause"
        list="clauses"
        disabled={disabled}
        items={s.clauses}
        fields={CLAUSE_FIELDS}
        moves={(ids, e) => send(actions.reorderClauses({ ids }), e)}
        onAdd={(v, e) => {
          const kind = asOneOf(CLAUSE_KINDS, v.kind);
          if (!kind) return;
          send(
            actions.addClause({
              id: generateId(),
              kind,
              title: asText(v.title) ?? "",
              body: asText(v.body),
            }),
            e,
          );
        }}
        onUpdate={(id, patch, e) =>
          send(
            actions.updateClause({
              id,
              ...readPatch<Pick<UpdateClauseInput, "title" | "body">>(patch, {
                title: asText,
                body: asText,
              }),
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removeClause({ id }), e)}
      />
      <Items
        title="Annexes"
        noun="annex"
        list="annexes"
        disabled={disabled}
        items={s.annexes}
        fields={ANNEX_FIELDS}
        onAdd={(v, e) => {
          const kind = asOneOf(ANNEX_KINDS, v.kind);
          if (!kind) return;
          send(
            actions.addAnnex({
              id: generateId(),
              kind,
              title: asText(v.title) ?? "",
              body: asText(v.body),
              partOfAgreement: asFlag(v.partOfAgreement),
            }),
            e,
          );
        }}
        onUpdate={(id, patch, e) =>
          send(
            actions.updateAnnex({
              id,
              ...readPatch<
                Pick<UpdateAnnexInput, "title" | "body" | "partOfAgreement">
              >(patch, {
                title: asText,
                body: asText,
                partOfAgreement: asFlag,
              }),
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removeAnnex({ id }), e)}
      />
      {children}
    </div>
  );
}
