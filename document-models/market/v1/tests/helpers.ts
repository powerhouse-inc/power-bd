import {
  addSegment,
  approveSize,
  reducer,
  setAxes,
  setSegmentSource,
  updateSegment,
  utils,
} from "document-models/market/v1";

export type MarketDoc = ReturnType<typeof utils.createDocument>;
type Action = Parameters<typeof reducer>[1];

export const AT = "2026-11-18T09:00:00.000Z";
export const ME = "0x1111111111111111111111111111111111111111";
export const URL_ = "https://example.org/registry";

/** Applies the actions in order to a new document, or to the one given. */
export function run(...actions: Action[]): MarketDoc;
export function run(doc: MarketDoc, ...actions: Action[]): MarketDoc;
export function run(first: MarketDoc | Action, ...rest: Action[]): MarketDoc {
  const isDoc = (x: MarketDoc | Action): x is MarketDoc => "operations" in x;
  const start = isDoc(first) ? first : utils.createDocument();
  const actions = isDoc(first) ? rest : [first, ...rest];
  return actions.reduce<MarketDoc>((d, a) => reducer(d, a), start);
}

/** The error of the last operation, or undefined when it was accepted. */
export const lastError = (doc: MarketDoc) => doc.operations.global.at(-1)?.error;

/** A segment counted and sourced for both numbers. */
export const countedSegment = (id = "s1", name = "Mid-size finance teams"): Action[] => [
  addSegment({ id, name }),
  updateSegment({ id, accounts: 120, annualValue: 40000, serviceable: true, targetAccounts: 6 }),
  setSegmentSource({ id, figure: "ACCOUNTS", title: "Registry count", url: URL_ }),
  setSegmentSource({ id, figure: "ANNUAL_VALUE", title: "Price list", documentId: "vault-note-1" }),
];

/** A market whose figures a person has approved. */
export const approvedDoc = () =>
  run(...countedSegment(), approveSize({ approvedBy: ME, approvedAt: AT }));

export const AXES = {
  xLabel: "Who builds it",
  xLow: "Built per customer",
  xHigh: "A product the customer configures",
  yLabel: "What the record shows",
  yLow: "Outputs only",
  yHigh: "Signed record of who approved what",
};
export const withAxes = () => run(setAxes(AXES));
