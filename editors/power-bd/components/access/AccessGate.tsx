import { RenownAuthButton, useUser } from "@powerhousedao/reactor-browser";
import { useEffect, useState, type ReactNode } from "react";
import { gateVerdict, type Verdict } from "../../kit/access/access.js";
import { copyText } from "../../kit/clipboard/clipboard.js";
import { Icon } from "../Icon.js";
import { probeDrive } from "./accessApi.js";
import { useDriveSwitchboard } from "./useDriveSwitchboard.js";

/**
 * Says why the space won't open, instead of a console full of FORBIDDEN. It
 * reads the drive the way every view will. Signed out, it offers sign-in;
 * signed in without access, it shows the address an admin needs to add. The
 * app opens at once and loads alongside the question: the gate goes up only
 * when the server says no, so no one waits a round trip to see their space,
 * and a server that can't answer never blocks it.
 */
export function AccessGate({ driveId, children }: { driveId: string; children: ReactNode }) {
  const base = useDriveSwitchboard(driveId);
  const me = useUser()?.address;
  const [answer, setAnswer] = useState<{ driveId: string; verdict: Verdict }>();
  const [copied, setCopied] = useState<string>();

  useEffect(() => {
    if (base === undefined) return;
    let live = true;
    void probeDrive(base, driveId).then((probe) => {
      if (live) setAnswer({ driveId, verdict: gateVerdict(probe, me) });
    });
    return () => {
      live = false;
    };
  }, [base, driveId, me]);

  const verdict = answer?.driveId === driveId ? answer.verdict : undefined;
  if (!verdict || verdict.kind === "allowed" || verdict.kind === "unreachable")
    return <>{children}</>;

  if (verdict.kind === "anonymous") {
    return (
      <div className="pb-gate">
        <div className="pb-gate__card">
          <span className="pb-gate__icon">
            <Icon name="lock" />
          </span>
          <h1 className="pb-gate__title">Sign in to open this space</h1>
          <p className="pb-muted">
            This space is protected, so it needs to know who you are. Signing in uses your Renown
            identity: no password, and only your wallet address is shared.
          </p>
          <div className="pb-gate__action">
            <RenownAuthButton />
          </div>
        </div>
      </div>
    );
  }

  const address = verdict.address.toLowerCase();
  return (
    <div className="pb-gate">
      <div className="pb-gate__card">
        <span className="pb-gate__icon">
          <Icon name="lock" />
        </span>
        <h1 className="pb-gate__title">You don't have access to this space yet</h1>
        <p className="pb-muted">
          Send this address to an admin of the space. Once they add you in Settings, under Access,
          reload this page.
        </p>
        <div className="pb-gate__address">
          <code className="pb-mono">{address}</code>
          <button
            type="button"
            className="pb-btn pb-btn--sm"
            onClick={() =>
              void copyText(address, navigator.clipboard).then((done) =>
                setCopied(done.ok ? "Copied" : done.message),
              )
            }
          >
            <Icon name={copied === "Copied" ? "check" : "copy"} />
            {copied ?? "Copy address"}
          </button>
        </div>
        <p className="pb-reassure">
          <Icon name="shield" />
          Signing in again won't change this: an admin has to add your address.
        </p>
      </div>
    </div>
  );
}
