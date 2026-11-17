import { generateId } from "document-model";
import {
  actions,
  type UpdateOptionInput,
  type UpdatePaymentStepInput,
} from "document-models/proposal";
import { formatMoney, periodWord } from "../../../kit/format/index.js";
import type { ProposalTotals } from "../../../kit/proposal-totals/proposal-totals.js";
import { Items, type Field } from "../Items.js";
import { TRIGGERS } from "./options.js";
import { PackageChecklist } from "./PackageChecklist.js";
import type { TabProps } from "./types.js";
import { asNumber, asOneOf, asText, readPatch } from "./values.js";

const OPTION_FIELDS: Field[] = [
  { key: "label", label: "Option name", kind: "text", required: true },
];
const ADJUSTMENT_FIELDS: Field[] = [
  {
    key: "label",
    label: "Adjustment",
    kind: "text",
    required: true,
    fixed: true,
  },
  {
    key: "amount",
    label: "Amount (negative for a discount)",
    kind: "number",
    required: true,
    fixed: true,
  },
  { key: "condition", label: "Condition", kind: "text", fixed: true },
];
const STEP_FIELDS: Field[] = [
  { key: "label", label: "Step", kind: "text", required: true },
  {
    key: "trigger",
    label: "When",
    kind: "select",
    options: TRIGGERS,
    required: true,
  },
  { key: "percentage", label: "Percent", kind: "number", required: true },
  { key: "date", label: "Date", kind: "date" },
];

type StepPatch = Pick<UpdatePaymentStepInput, "label" | "percentage" | "date">;

/** Options with adjustments and their totals, and the payment steps. Every figure shown comes from the totals. */
export function OptionsTab({
  s,
  send,
  disabled,
  totals,
}: TabProps & { totals: ProposalTotals }) {
  const m = (n: number) => formatMoney(n, s.currency);
  const span = (amount: number, upper: number | null | undefined) =>
    upper != null ? `${m(amount)} to ${m(upper)}` : m(amount);
  return (
    <div className="pb-stack pb-gap-16">
      {totals.range ? (
        <p className="pb-small">
          Totals range from <strong>{m(totals.range.lowest)}</strong> to{" "}
          <strong>{m(totals.range.highest)}</strong>.
        </p>
      ) : null}
      <Items
        noun="option"
        list="options"
        disabled={disabled}
        items={s.options}
        fields={OPTION_FIELDS}
        onAdd={(v, e) =>
          send(
            actions.addOption({
              id: generateId(),
              packageIds: [],
              label: asText(v.label) ?? "",
            }),
            e,
          )
        }
        onUpdate={(id, patch, e) =>
          send(
            actions.updateOption({
              id,
              ...readPatch<Pick<UpdateOptionInput, "label">>(patch, {
                label: asText,
              }),
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removeOption({ id }), e)}
        extra={(o) => {
          const t = totals.options.find((x) => x.optionId === o.id);
          return (
            <div className="pb-stack">
              <PackageChecklist
                label="Packages:"
                packages={s.packages}
                checked={o.packageIds}
                disabled={disabled}
                onToggle={(packageId, on) =>
                  send(
                    actions.updateOption({
                      id: o.id,
                      packageIds: on
                        ? [...o.packageIds, packageId]
                        : o.packageIds.filter((x) => x !== packageId),
                    }),
                    () => undefined,
                  )
                }
              />
              <Items
                title="Adjustments"
                noun="adjustment"
                list="adjustments"
                disabled={disabled}
                items={o.adjustments}
                fields={ADJUSTMENT_FIELDS}
                onAdd={(v, e) =>
                  send(
                    actions.addAdjustment({
                      optionId: o.id,
                      id: generateId(),
                      currency: s.currency,
                      label: asText(v.label) ?? "",
                      amount: asNumber(v.amount) ?? 0,
                      condition: asText(v.condition),
                    }),
                    e,
                  )
                }
                onUpdate={() => undefined}
                onRemove={(id, e) =>
                  send(actions.removeAdjustment({ optionId: o.id, id }), e)
                }
              />
              {t ? (
                <div className="pb-table-wrap">
                  <table className="pb-table pb-table--compact">
                    <tbody>
                      <tr>
                        <td>Total</td>
                        <td className="pb-table__num">
                          <strong>{m(t.fixedTotal)}</strong>
                        </td>
                      </tr>
                      {t.payments.map((p) => (
                        <tr key={p.stepId}>
                          <td>{p.label}</td>
                          <td className="pb-table__num">{m(p.amount)}</td>
                        </tr>
                      ))}
                      {t.recurring.flatMap((g) =>
                        g.lines.map((l) => (
                          <tr key={l.deliverableId}>
                            <td>Recurring, per {periodWord(g.period)}</td>
                            <td className="pb-table__num">
                              {span(l.amount, l.upperAmount)}
                            </td>
                          </tr>
                        )),
                      )}
                      {t.rates.map((r) => (
                        <tr key={r.deliverableId}>
                          <td>
                            Rate, per {r.unit === "HOUR" ? "hour" : "day"}
                          </td>
                          <td className="pb-table__num">
                            {span(r.amount, r.upperAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          );
        }}
      />
      <Items
        title="Payment steps"
        noun="payment step"
        list="paymentSteps"
        disabled={disabled}
        items={s.paymentSteps}
        fields={STEP_FIELDS}
        onAdd={(v, e) => {
          const trigger = asOneOf(TRIGGERS, v.trigger);
          if (!trigger) return;
          send(
            actions.addPaymentStep({
              id: generateId(),
              label: asText(v.label) ?? "",
              trigger,
              percentage: asNumber(v.percentage) ?? 0,
              date: asText(v.date),
            }),
            e,
          );
        }}
        onUpdate={(id, patch, e) =>
          send(
            actions.updatePaymentStep({
              id,
              ...readPatch<StepPatch>(patch, {
                label: asText,
                percentage: asNumber,
                date: asText,
              }),
              ...("trigger" in patch
                ? { trigger: asOneOf(TRIGGERS, patch.trigger) }
                : {}),
            }),
            e,
          )
        }
        onRemove={(id, e) => send(actions.removePaymentStep({ id }), e)}
      />
    </div>
  );
}
