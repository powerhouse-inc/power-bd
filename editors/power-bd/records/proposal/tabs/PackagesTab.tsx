import { generateId } from "document-model";
import {
  actions,
  type UpdateDeliverableInput,
  type UpdatePackageInput,
} from "document-models/proposal";
import { Items, type Field } from "../Items.js";
import { PackageChecklist } from "./PackageChecklist.js";
import { PriceEditor } from "./PriceEditor.js";
import type { TabProps } from "./types.js";
import { asNumber, asText, readPatch, type Values } from "./values.js";

type PackageText = Pick<
  UpdatePackageInput,
  "code" | "name" | "summary" | "targetDate"
>;
type DeliverableText = Pick<UpdateDeliverableInput, "code" | "title" | "body">;

const PACKAGE_FIELDS: Field[] = [
  { key: "code", label: "Code", kind: "text", required: true, size: "short" },
  { key: "name", label: "Name", kind: "text", required: true },
  { key: "summary", label: "Summary", kind: "area" },
  { key: "price", label: "Price of the whole package", kind: "number" },
  { key: "targetDate", label: "Target date", kind: "date" },
];
const DELIVERABLE_FIELDS: Field[] = [
  { key: "code", label: "Code", kind: "text", required: true, size: "short" },
  { key: "title", label: "Title", kind: "text", required: true },
  { key: "body", label: "Description", kind: "area" },
];

/** Packages, their deliverables and prices. */
export function PackagesTab({ s, send, disabled }: TabProps) {
  const packagePatch = (patch: Values): Omit<UpdatePackageInput, "id"> => ({
    ...readPatch<PackageText>(patch, {
      code: asText,
      name: asText,
      summary: asText,
      targetDate: asText,
    }),
    ...("price" in patch
      ? { currency: s.currency, price: asNumber(patch.price) ?? null }
      : {}),
  });
  return (
    <div className="pb-stack pb-gap-12">
      <Items
        noun="package"
        list="packages"
        disabled={disabled}
        items={s.packages}
        fields={PACKAGE_FIELDS}
        moves={(ids, e) => send(actions.reorderPackages({ ids }), e)}
        onAdd={(v, e) =>
          send(
            actions.addPackage({
              id: generateId(),
              code: asText(v.code) ?? "",
              name: asText(v.name) ?? "",
              summary: asText(v.summary),
              price: asNumber(v.price),
              targetDate: asText(v.targetDate),
              currency: v.price != null ? s.currency : undefined,
            }),
            e,
          )
        }
        onUpdate={(id, patch, e) =>
          send(actions.updatePackage({ ...packagePatch(patch), id }), e)
        }
        onRemove={(id, e) => send(actions.removePackage({ id }), e)}
        extra={(pkg) => (
          <div className="pb-stack">
            <PackageChecklist
              label="Needs:"
              packages={s.packages.filter((p) => p.id !== pkg.id)}
              checked={pkg.requires}
              disabled={disabled}
              onToggle={(packageId, on) =>
                send(
                  actions.updatePackage({
                    id: pkg.id,
                    requires: on
                      ? [...pkg.requires, packageId]
                      : pkg.requires.filter((x) => x !== packageId),
                  }),
                  () => undefined,
                )
              }
            />
            <Items
              title="Deliverables"
              noun="deliverable"
              list="deliverables"
              disabled={disabled}
              items={s.deliverables.filter((d) => d.packageId === pkg.id)}
              fields={DELIVERABLE_FIELDS}
              onAdd={(v, e) =>
                send(
                  actions.addDeliverable({
                    id: generateId(),
                    packageId: pkg.id,
                    code: asText(v.code) ?? "",
                    title: asText(v.title) ?? "",
                    body: asText(v.body),
                  }),
                  e,
                )
              }
              onUpdate={(id, patch, e) =>
                send(
                  actions.updateDeliverable({
                    id,
                    ...readPatch<DeliverableText>(patch, {
                      code: asText,
                      title: asText,
                      body: asText,
                    }),
                  }),
                  e,
                )
              }
              onRemove={(id, e) => send(actions.removeDeliverable({ id }), e)}
              extra={(d) => (
                <PriceEditor
                  deliverable={d}
                  currency={s.currency}
                  disabled={disabled}
                  send={send}
                />
              )}
            />
          </div>
        )}
      />
    </div>
  );
}
