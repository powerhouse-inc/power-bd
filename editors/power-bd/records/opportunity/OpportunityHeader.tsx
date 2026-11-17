import { VOCABULARY } from "../../../../design-system/vocabulary.js";
import { Icon } from "../../components/Icon.js";
import type { statusPath } from "../../kit/funding/index.js";

/** The page title with its status tag, and the status path beneath. */
export function OpportunityHeader({
  name,
  status,
  path,
  goDecision,
  personLabel,
}: {
  name: string | null | undefined;
  status: string;
  path: ReturnType<typeof statusPath>;
  /** The latest go or no-go, shown beside the gate step. */
  goDecision?: { decidedBy: string; decidedAt: string };
  personLabel: (address: string) => string;
}) {
  const statusTerm = VOCABULARY.opportunityStatus.find(
    (t) => t.value === status,
  );
  return (
    <>
      <div className="pb-page__head pb-page__head--row">
        <span className="pb-page__icon pb-page__icon--blue">
          <Icon name="funding" />
        </span>
        <h1 className="pb-page__title">
          {name || "Untitled funding opportunity"}
        </h1>
        {statusTerm ? (
          <span className={`pb-tag pb-tag--${statusTerm.tone}`}>
            {statusTerm.label}
          </span>
        ) : null}
      </div>

      <ol className="pb-path pb-mt-6 pb-mb-8">
        {path.steps.map((p) => (
          <li
            key={p.key}
            className={`pb-path__step${p.gate ? " pb-path__step--gate" : ""}${p.state === "done" ? " is-done" : p.state === "current" ? " is-current" : ""}${p.blocked ? " is-blocked" : ""}`}
          >
            <span className="pb-path__dot">
              {p.gate ? (
                <Icon name="people-only" />
              ) : p.blocked ? (
                <Icon name="flag" />
              ) : p.state === "done" ? (
                <Icon name="check" />
              ) : null}
            </span>
            {p.key === "TO_EVALUATE" && status === "WATCHING"
              ? "Watching"
              : p.label}
            {p.gate && goDecision ? (
              <span className="pb-path__note">
                {personLabel(goDecision.decidedBy)},{" "}
                {goDecision.decidedAt.slice(0, 10)}
              </span>
            ) : null}
            {p.blocked ? <span className="pb-path__note">Blocked</span> : null}
          </li>
        ))}
      </ol>
    </>
  );
}
