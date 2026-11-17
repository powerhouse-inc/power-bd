import { ClaimForm } from "./ClaimForm.js";
import type { NeverClaim } from "./types.js";
import { ErrorLine } from "../../components/shared/ErrorLine.js";
import { actions } from "document-models/playbook";
import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import type { Dispatch } from "./run.js";
import { dispatchWith, useRun } from "../../components/shared/useRun.js";

export function ClaimCard({
  item,
  dispatch,
}: {
  item: NeverClaim;
  dispatch: Dispatch;
}) {
  const [editing, setEditing] = useState(false);
  const errRun = useRun();
  return (
    <div className="pb-card pb-grid pb-gap-10 pb-p-16">
      {editing ? (
        <ClaimForm
          initial={item}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={(v, done) => {
            errRun.run(
              (e) =>
                dispatchWith(
                  dispatch,
                  actions.updateNeverClaim({ id: item.id, ...v }),
                  e,
                ),
              () => {
                done();
                setEditing(false);
              },
            );
          }}
        />
      ) : (
        <>
          <div className="pb-row">
            <span className="pb-tag pb-tag--red">
              <Icon name="alert" />
              Never claim
            </span>
            <strong className="pb-flex-1">{item.claim}</strong>
          </div>
          {item.reason && (
            <p className="pb-m-0 pb-prewrap">
              <span className="pb-muted">Why: </span>
              {item.reason}
            </p>
          )}
          {item.phrases.length > 0 && (
            <div className="pb-row">
              {item.phrases.map((p) => (
                <span className="pb-tag pb-tag--gray" key={p}>
                  {p}
                </span>
              ))}
            </div>
          )}
          <div className="pb-row">
            <button
              type="button"
              className="pb-btn pb-btn--sm"
              onClick={() => setEditing(true)}
            >
              <Icon name="edit" />
              Edit
            </button>
            <button
              type="button"
              className="pb-btn pb-btn--ghost pb-btn--sm pb-btn--danger"
              onClick={() =>
                errRun.run((e) =>
                  dispatchWith(
                    dispatch,
                    actions.removeNeverClaim({ id: item.id }),
                    e,
                  ),
                )
              }
            >
              Remove
            </button>
          </div>
        </>
      )}
      <ErrorLine message={errRun.error} />
    </div>
  );
}
