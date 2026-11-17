import { ClaimCard } from "./ClaimCard.js";
import { ClaimForm } from "./ClaimForm.js";
import { generateId } from "document-model";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { actions } from "document-models/playbook";
import type { PlaybookState } from "document-models/playbook";
import type { Dispatch } from "./run.js";
import { dispatchWith, useRun } from "../../components/shared/useRun.js";

export function NeverClaimsSection({
  state,
  dispatch,
}: {
  state: PlaybookState;
  dispatch: Dispatch;
}) {
  const errRun = useRun();
  return (
    <div className="pb-section">
      <div className="pb-section__head">
        <h2 className="pb-section__title">
          Never claim
          <span className="pb-count">{state.neverClaims.length}</span>
        </h2>
      </div>
      <p className="pb-muted pb-m-0">
        Things no message may say, with the phrases that would say them.
      </p>
      {state.neverClaims.map((c) => (
        <ClaimCard key={c.id} item={c} dispatch={dispatch} />
      ))}
      <ClaimForm
        submitLabel="Add to never-claim list"
        onSubmit={(v, done) =>
          errRun.run(
            (e) =>
              dispatchWith(
                dispatch,
                actions.addNeverClaim({ id: generateId(), ...v }),
                e,
              ),
            done,
          )
        }
      />
      <ErrorLine message={errRun.error} />
    </div>
  );
}
