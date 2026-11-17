import { actions, type ProposalState } from "document-models/proposal";
import { useEffect, useRef } from "react";
import { ReferencesSection } from "../../components/shared/relationship/ReferencesSection.js";
import type { ProposalTotals } from "../../kit/proposal-totals/proposal-totals.js";
import {
  PROPOSAL_TABS,
  type ContactChoice,
  type FindingTarget,
  type ProposalTab,
} from "../../kit/proposal-view/index.js";
import { Figures, type useAttach } from "./Files.js";
import { ContentTab } from "./tabs/ContentTab.js";
import { DetailsTab } from "./tabs/DetailsTab.js";
import { OptionsTab } from "./tabs/OptionsTab.js";
import { PackagesTab } from "./tabs/PackagesTab.js";
import { ScopeTab } from "./tabs/ScopeTab.js";
import type { Send } from "./tabs/types.js";

/** A finding the person asked to be taken to; `n` tells two visits to one place apart. */
export type Found = FindingTarget & { n: number };

const FOCUSABLE =
  "input:not([disabled]), textarea:not([disabled]), select:not([disabled])";

/** Brings the place a finding concerns into view, shows it once and puts the cursor in it. */
function useShowFound(found: Found | null) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panel = root.current;
    if (!found || !panel) return;
    const place =
      panel.querySelector<HTMLElement>(
        `[data-find="${CSS.escape(found.key)}"]`,
      ) ?? panel;
    place.scrollIntoView({ block: "center", behavior: "smooth" });
    place.classList.add("pb-found");
    const field = found.field
      ? place.querySelector<HTMLElement>(
          `[data-field="${CSS.escape(found.field)}"]:not([disabled])`,
        )
      : null;
    (field ?? place.querySelector<HTMLElement>(FOCUSABLE))?.focus({
      preventScroll: true,
    });
    const timer = window.setTimeout(
      () => place.classList.remove("pb-found"),
      1800,
    );
    return () => {
      window.clearTimeout(timer);
      place.classList.remove("pb-found");
    };
  }, [found]);
  return root;
}

/** The Edit view: the tabs of the proposal, at the full width of the page. */
export function EditView({
  s,
  send,
  disabled,
  tab,
  onTab,
  found,
  documentId,
  clientName,
  contacts,
  totals,
  positioning,
  attach,
}: {
  s: ProposalState;
  send: Send;
  disabled: boolean;
  tab: ProposalTab;
  onTab: (tab: ProposalTab) => void;
  found: Found | null;
  documentId: string;
  clientName: string;
  contacts: readonly ContactChoice[];
  totals: ProposalTotals;
  positioning: { id: string; title: string; text: string }[];
  attach: ReturnType<typeof useAttach>["attach"];
}) {
  const panel = useShowFound(found);
  return (
    <div className="pb-stack pb-gap-12 pb-minw-0">
      <div className="pb-tabs" role="tablist">
        {PROPOSAL_TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`pb-tab${tab === id ? " is-active" : ""}`}
            onClick={() => onTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div ref={panel} role="tabpanel">
        {tab === "details" ? (
          <DetailsTab
            s={s}
            send={send}
            disabled={disabled}
            leadName={clientName}
            documentId={documentId}
            contacts={contacts}
          />
        ) : tab === "packages" ? (
          <PackagesTab s={s} send={send} disabled={disabled} />
        ) : tab === "options" ? (
          <OptionsTab s={s} send={send} disabled={disabled} totals={totals} />
        ) : tab === "scope" ? (
          <ScopeTab s={s} send={send} disabled={disabled} />
        ) : tab === "content" ? (
          <ContentTab
            s={s}
            send={send}
            disabled={disabled}
            positioning={positioning}
          >
            <Figures
              s={s}
              documentId={documentId}
              disabled={disabled}
              attach={attach}
              send={send}
            />
          </ContentTab>
        ) : (
          <ReferencesSection
            items={s.references}
            onAdd={(r, e) => send(actions.addReference(r), e)}
            onRemove={(id, e) => send(actions.removeReference({ id }), e)}
          />
        )}
      </div>
    </div>
  );
}
