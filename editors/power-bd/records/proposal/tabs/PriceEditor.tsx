import {
  actions,
  type Pricing,
  type ProposalState,
  type RateUnit,
  type RecurringPeriod,
} from "document-models/proposal";
import { useState } from "react";
import { ErrorLine } from "../../../components/shared/ErrorLine.js";
import { useRun } from "../../../components/shared/useRun.js";
import { dayOf, toIso } from "../Items.js";
import { PERIODS, PRICING, UNITS } from "./options.js";
import type { Option, Send } from "./types.js";
import { asOneOf } from "./values.js";

type Draft = {
  pricing: Pricing;
  amount: string;
  upper: string;
  period: RecurringPeriod;
  unit: RateUnit;
  until: string;
  note: string;
};

const number = (text: string) => (text === "" ? undefined : Number(text));

/** A select over typed options: a value that is not one of them is ignored. */
function Choice<T extends string>({
  label,
  list,
  value,
  disabled,
  onPick,
}: {
  label: string;
  list: readonly Option<T>[];
  value: T;
  disabled: boolean;
  onPick: (value: T) => void;
}) {
  return (
    <select
      className="pb-select pb-input--auto"
      aria-label={label}
      disabled={disabled}
      value={value}
      onChange={(e) => {
        const picked = asOneOf(list, e.target.value);
        if (picked) onPick(picked);
      }}
    >
      {list.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** The price of one deliverable: its kind, amounts, period or unit, and a note. */
export function PriceEditor({
  deliverable,
  currency,
  disabled,
  send,
}: {
  deliverable: ProposalState["deliverables"][number];
  currency: string | null | undefined;
  disabled: boolean;
  send: Send;
}) {
  const run = useRun();
  const p = deliverable.price;
  const [v, setV] = useState<Draft>({
    pricing: p?.pricing ?? "FIXED",
    amount: p?.amount?.toString() ?? "",
    upper: p?.upperAmount?.toString() ?? "",
    period: p?.period ?? "MONTH",
    unit: p?.unit ?? "HOUR",
    until: dayOf(p?.until),
    note: p?.note ?? "",
  });
  const change = (patch: Partial<Draft>) => setV((o) => ({ ...o, ...patch }));
  const priced = v.pricing !== "INCLUDED";
  return (
    <div className="pb-row">
      <Choice
        label="Price kind"
        list={PRICING}
        value={v.pricing}
        disabled={disabled}
        onPick={(pricing) => change({ pricing })}
      />
      {priced ? (
        <>
          <input
            className="pb-input pb-w-100"
            type="number"
            aria-label="Amount"
            placeholder="Amount"
            disabled={disabled}
            value={v.amount}
            onChange={(e) => change({ amount: e.target.value })}
          />
          <input
            className="pb-input pb-w-100"
            type="number"
            aria-label="Upper amount"
            placeholder="Up to"
            disabled={disabled}
            value={v.upper}
            onChange={(e) => change({ upper: e.target.value })}
          />
        </>
      ) : null}
      {v.pricing === "RECURRING" ? (
        <>
          <Choice
            label="Period"
            list={PERIODS}
            value={v.period}
            disabled={disabled}
            onPick={(period) => change({ period })}
          />
          <input
            className="pb-input pb-w-130"
            type="date"
            aria-label="Ends"
            disabled={disabled}
            value={v.until}
            onChange={(e) => change({ until: e.target.value })}
          />
        </>
      ) : null}
      {v.pricing === "RATE" ? (
        <Choice
          label="Unit"
          list={UNITS}
          value={v.unit}
          disabled={disabled}
          onPick={(unit) => change({ unit })}
        />
      ) : null}
      <input
        className="pb-input pb-w-160"
        aria-label="Price note"
        placeholder="Price note"
        disabled={disabled}
        value={v.note}
        onChange={(e) => change({ note: e.target.value })}
      />
      <button
        className="pb-btn pb-btn--sm"
        disabled={disabled}
        onClick={() =>
          run.run((e) =>
            send(
              actions.setDeliverablePrice({
                id: deliverable.id,
                pricing: v.pricing,
                amount: priced ? number(v.amount) : undefined,
                upperAmount: priced ? number(v.upper) : undefined,
                currency: currency ?? undefined,
                period: v.pricing === "RECURRING" ? v.period : undefined,
                unit: v.pricing === "RATE" ? v.unit : undefined,
                until: v.pricing === "RECURRING" ? toIso(v.until) : undefined,
                note: v.note || undefined,
              }),
              e,
            ),
          )
        }
      >
        Set price
      </button>
      <ErrorLine message={run.error} />
    </div>
  );
}
