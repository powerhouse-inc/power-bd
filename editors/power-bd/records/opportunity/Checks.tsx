import { Icon } from "../../components/Icon.js";
import type { Check } from "../../kit/funding/index.js";

/** What must be known before a choice: each check is ok or a warning. */
export function Checks({ checks }: { checks: readonly Check[] }) {
  return (
    <div>
      <div className="pb-overline pb-mb-4">Before you decide</div>
      <ul className="pb-checks">
        {checks.map((c) => (
          <li
            key={c.text}
            className={`pb-checks__item ${c.tone === "ok" ? "is-ok" : "is-warn"}`}
          >
            <Icon name={c.tone === "ok" ? "check-circle" : "alert"} />
            {c.text}
            {c.detail ? (
              <span className="pb-checks__detail">{c.detail}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
