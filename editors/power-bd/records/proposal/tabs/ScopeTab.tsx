import { generateId } from "document-model";
import {
  actions,
  type UpdateActorInput,
  type UpdateBoundaryInput,
  type UpdateUseCaseInput,
} from "document-models/proposal";
import { Items, type Field } from "../Items.js";
import { BOUNDARY_KINDS } from "./options.js";
import type { TabProps } from "./types.js";
import { asOneOf, asText, readPatch } from "./values.js";

const ACTOR_FIELDS: Field[] = [
  { key: "code", label: "Code", kind: "text", required: true, size: "short" },
  { key: "name", label: "Name", kind: "text", required: true },
  { key: "description", label: "Description", kind: "area" },
];

/** Actors, use cases and boundaries. */
export function ScopeTab({ s, send, disabled }: TabProps) {
  const actorOptions = s.actors.map((a) => ({
    value: a.id,
    label: a.name || a.code,
  }));
  const packageOptions = s.packages.map((p) => ({
    value: p.id,
    label: p.name || p.code,
  }));
  const useCaseFields: Field[] = [
    { key: "code", label: "Code", kind: "text", required: true, size: "short" },
    {
      key: "actorId",
      label: "Actor",
      kind: "select",
      options: actorOptions,
      required: true,
    },
    {
      key: "packageId",
      label: "Package",
      kind: "select",
      options: packageOptions,
      required: true,
    },
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "body", label: "Description", kind: "area" },
  ];
  const boundaryFields: Field[] = [
    {
      key: "kind",
      label: "Kind",
      kind: "select",
      options: BOUNDARY_KINDS,
      fixed: true,
      required: true,
    },
    {
      key: "packageId",
      label: "Package",
      kind: "select",
      options: packageOptions,
    },
    { key: "text", label: "Text", kind: "area", required: true },
    { key: "value", label: "Sizing figure", kind: "text" },
  ];
  return (
    <div className="pb-stack pb-gap-16">
      <Items
        title="Who uses it"
        noun="actor"
        list="actors"
        disabled={disabled}
        items={s.actors}
        fields={ACTOR_FIELDS}
        onAdd={(v, e) =>
          send(
            actions.addActor({
              id: generateId(),
              code: asText(v.code) ?? "",
              name: asText(v.name) ?? "",
              description: asText(v.description),
            }),
            e,
          )
        }
        onUpdate={(id, patch, e) =>
          send(
            actions.updateActor({
              id,
              ...readPatch<
                Pick<UpdateActorInput, "code" | "name" | "description">
              >(patch, { code: asText, name: asText, description: asText }),
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removeActor({ id }), e)}
      />
      <Items
        title="Use cases"
        noun="use case"
        list="useCases"
        disabled={disabled}
        items={s.useCases}
        fields={useCaseFields}
        onAdd={(v, e) =>
          send(
            actions.addUseCase({
              id: generateId(),
              code: asText(v.code) ?? "",
              actorId: asText(v.actorId) ?? "",
              packageId: asText(v.packageId) ?? "",
              title: asText(v.title) ?? "",
              body: asText(v.body),
            }),
            e,
          )
        }
        onUpdate={(id, patch, e) =>
          send(
            actions.updateUseCase({
              id,
              ...readPatch<
                Pick<
                  UpdateUseCaseInput,
                  "code" | "actorId" | "packageId" | "title" | "body"
                >
              >(patch, {
                code: asText,
                actorId: asText,
                packageId: asText,
                title: asText,
                body: asText,
              }),
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removeUseCase({ id }), e)}
      />
      <Items
        title="Assumptions, exclusions, client inputs and guarantees"
        noun="boundary"
        list="boundaries"
        disabled={disabled}
        items={s.boundaries}
        fields={boundaryFields}
        onAdd={(v, e) => {
          const kind = asOneOf(BOUNDARY_KINDS, v.kind);
          if (!kind) return;
          send(
            actions.addBoundary({
              id: generateId(),
              kind,
              packageId: asText(v.packageId),
              text: asText(v.text) ?? "",
              value: asText(v.value),
            }),
            e,
          );
        }}
        onUpdate={(id, patch, e) =>
          send(
            actions.updateBoundary({
              id,
              ...readPatch<
                Pick<UpdateBoundaryInput, "packageId" | "text" | "value">
              >(patch, { packageId: asText, text: asText, value: asText }),
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removeBoundary({ id }), e)}
      />
    </div>
  );
}
