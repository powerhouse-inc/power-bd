import { useSelectedDriveId, useUser } from "@powerhousedao/reactor-browser";
import { useEffect, useState } from "react";
import {
  LEVELS,
  LEVEL_WORDS,
  isLastManager,
  readAddress,
  rosterRows,
  standingOf,
  type Grant,
  type Level,
  type RosterRow,
  type Standing,
} from "../../kit/access/access.js";
import { copyText } from "../../kit/clipboard/clipboard.js";
import { initials } from "../../kit/settings/settings.js";
import { Icon } from "../Icon.js";
import { askGrants, grantAccess, revokeAccess } from "./accessApi.js";
import { useDriveSwitchboard } from "./useDriveSwitchboard.js";

interface Person {
  name: string;
  address: string;
}

type Pending =
  | { address: string; kind: "remove" }
  | { address: string; kind: "change"; level: Level };

const when = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

/**
 * Settings → Access: who can open the space and what they can do. Admins
 * manage the drive's grants here instead of from a terminal; everyone else
 * sees their own address, ready to send an admin.
 */
export function AccessSection({ team }: { team: readonly Person[] }) {
  const driveId = useSelectedDriveId();
  const base = useDriveSwitchboard(driveId);
  const me = useUser()?.address;
  const [standing, setStanding] = useState<Standing>();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [pending, setPending] = useState<Pending>();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [typed, setTyped] = useState("");
  const [level, setLevel] = useState<Level>("WRITE");
  const [copied, setCopied] = useState(false);
  // Bumped after each change, so the list is read again from the server.
  const [reads, setReads] = useState(0);

  useEffect(() => {
    if (base === undefined || !driveId) return;
    let live = true;
    void askGrants(base, driveId).then((answer) => {
      if (!live) return;
      setStanding(standingOf(answer));
      if (answer.data) setGrants(answer.data.documentAccess.permissions);
    });
    return () => {
      live = false;
    };
  }, [base, driveId, reads]);

  const run = async (change: () => Promise<{ error?: string }>, after?: () => void) => {
    setBusy(true);
    setProblem(undefined);
    const answer = await change();
    setBusy(false);
    if (answer.error) {
      setProblem(answer.error);
      return;
    }
    setPending(undefined);
    after?.();
    setReads((n) => n + 1);
  };

  const nameOf = (address: string) =>
    team.find((p) => p.address.toLowerCase() === address)?.name;
  const rows = rosterRows(grants, me);

  const copyMine = async () => {
    if (!me) return;
    const done = await copyText(me, navigator.clipboard);
    setCopied(done.ok);
    if (!done.ok) setProblem(done.message);
  };

  const add = () => {
    const read = readAddress(typed);
    if ("problem" in read) {
      setProblem(read.problem);
      return;
    }
    if (base === undefined || !driveId) return;
    void run(() => grantAccess(base, driveId, read.address, level), () => setTyped(""));
  };

  return (
    <div className="pb-section pb-access">
      <div className="pb-section__head">
        <h2 className="pb-section__title">
          <Icon name="lock" /> Access
          {standing === "admin" && <span className="pb-count">{rows.length}</span>}
        </h2>
      </div>
      <p className="pb-muted">
        Who can open this space and what they can do. Access covers every record in it.
      </p>

      {standing === undefined && <p className="pb-muted">Checking who can open this space…</p>}

      {standing === "off" && (
        <p className="pb-access__note">
          <Icon name="info" />
          This server doesn't control access, so anyone who can reach it can open the space.
        </p>
      )}

      {standing === "member" && (
        <>
          {me ? (
            <div className="pb-list">
              <div className="pb-list__item">
                <span className="pb-list__lead">
                  <span className="pb-avatar pb-avatar--blue">
                    <Icon name="user" />
                  </span>
                </span>
                <div className="pb-list__main">
                  <span className="pb-list__title">You</span>
                  <span className="pb-list__sub pb-mono">{me.toLowerCase()}</span>
                </div>
                <div className="pb-list__end">
                  <button type="button" className="pb-btn pb-btn--sm" onClick={() => void copyMine()}>
                    <Icon name={copied ? "check" : "copy"} />
                    {copied ? "Copied" : "Copy address"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="pb-muted">Sign in to see your access.</p>
          )}
          <p className="pb-reassure">
            <Icon name="shield" />
            An admin of this space manages who has access. Send them your address to change what you can do.
          </p>
        </>
      )}

      {standing === "admin" && (
        <>
          <div className="pb-list">
            {rows.map((row) => (
              <AccessRow
                key={row.address}
                row={row}
                name={nameOf(row.address)}
                guarded={isLastManager(rows, row.address)}
                pending={pending?.address === row.address ? pending : undefined}
                busy={busy}
                onPick={(next) => setPending({ address: row.address, kind: "change", level: next })}
                onRemove={() => setPending({ address: row.address, kind: "remove" })}
                onCancel={() => setPending(undefined)}
                onConfirm={() => {
                  if (!pending || base === undefined || !driveId) return;
                  void run(() =>
                    pending.kind === "remove"
                      ? revokeAccess(base, driveId, row.address)
                      : grantAccess(base, driveId, row.address, pending.level),
                  );
                }}
              />
            ))}
          </div>

          <form
            className="pb-access__add"
            onSubmit={(event) => {
              event.preventDefault();
              add();
            }}
          >
            <input
              className="pb-input pb-mono"
              aria-label="Wallet address"
              placeholder="0x… wallet address"
              spellCheck={false}
              autoComplete="off"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
            <select
              className="pb-select"
              aria-label="Access level"
              value={level}
              onChange={(event) => setLevel(event.target.value as Level)}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {LEVEL_WORDS[l].label}
                </option>
              ))}
            </select>
            <button type="submit" className="pb-btn pb-btn--primary" disabled={busy}>
              <Icon name="plus" /> Give access
            </button>
          </form>
          <p className="pb-reassure">
            <Icon name="shield" />
            {LEVEL_WORDS[level].label}: {LEVEL_WORDS[level].meaning} They open the space by signing in with that wallet.
          </p>
        </>
      )}

      {problem && (
        <p className="pb-field__error" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}

function AccessRow({
  row,
  name,
  guarded,
  pending,
  busy,
  onPick,
  onRemove,
  onCancel,
  onConfirm,
}: {
  row: RosterRow;
  name: string | undefined;
  guarded: boolean;
  pending: Pending | undefined;
  busy: boolean;
  onPick: (level: Level) => void;
  onRemove: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const who = name ?? row.short;
  return (
    <div className="pb-list__item">
      <span className="pb-list__lead">
        <span className="pb-avatar pb-avatar--blue">{name ? initials(name) : <Icon name="user" />}</span>
      </span>
      <div className="pb-list__main">
        <span className="pb-list__title">
          {who}
          {row.isYou && <span className="pb-tag pb-tag--blue">You</span>}
        </span>
        <span className="pb-list__sub pb-mono">{row.address}</span>
        <span className="pb-list__sub">
          Added by {row.grantedBy}
          {when(row.grantedAt) && ` · ${when(row.grantedAt)}`}
        </span>
        {guarded && (
          <span className="pb-list__sub">
            The only person who can manage access. Add another manager before changing this.
          </span>
        )}
        {pending && (
          <div className="pb-access__confirm" role="group" aria-label="Confirm the change">
            <span>
              {pending.kind === "remove"
                ? row.isYou
                  ? "Remove your own access? You will no longer open this space."
                  : `Remove ${who}? They will no longer open this space.`
                : `Change ${who} to ${LEVEL_WORDS[pending.level].label}? ${LEVEL_WORDS[pending.level].meaning}`}
            </span>
            <button type="button" className="pb-btn pb-btn--sm pb-btn--primary" disabled={busy} onClick={onConfirm}>
              {pending.kind === "remove" ? "Remove" : "Change"}
            </button>
            <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={onCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="pb-list__end">
        <select
          className="pb-select"
          aria-label={`Access level for ${who}`}
          value={pending?.kind === "change" ? pending.level : row.level}
          disabled={guarded || busy}
          onChange={(event) => onPick(event.target.value as Level)}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {LEVEL_WORDS[l].label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="pb-btn pb-btn--ghost pb-btn--sm"
          aria-label={`Remove ${who}`}
          disabled={guarded || busy}
          onClick={onRemove}
        >
          <Icon name="trash" />
        </button>
      </div>
    </div>
  );
}
