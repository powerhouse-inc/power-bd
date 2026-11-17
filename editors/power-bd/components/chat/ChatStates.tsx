import type { AiGatewayStatus, UseAiGatewayResult } from "@powerhousedao/reactor-browser/ai";
import type { IconName } from "../../../../design-system/icons.js";
import { Icon } from "../Icon.js";
import { KeyCard } from "./KeyCard.js";
import { OwnKeyCard } from "./OwnKeyCard.js";
import type { OwnKey } from "./useChatService.js";

type Met = "ok" | "bad" | "open";
const ICON: Record<Met, IconName> = { ok: "check-circle", bad: "alert-circle", open: "clock" };
const TONE: Record<Met, string> = { ok: " is-ok", bad: " is-bad", open: "" };

/** One prerequisite of the agent, met or not, with who can meet it. */
function Need({ met, label, detail }: { met: Met; label: string; detail?: string }) {
  return (
    <li className={`pb-checks__item${TONE[met]}`}>
      <Icon name={ICON[met]} />
      {label}
      {detail ? <span className="pb-checks__detail">{detail}</span> : null}
    </li>
  );
}

/**
 * Where the server doesn't run the agent for the person (no service, or not
 * theirs to use): their own key stands in, which they add where `where` says.
 */
function OwnKeyChecks({ where }: { where: string }) {
  return (
    <ul className="pb-checks">
      <Need met="open" label="On for you on this server" detail="Not here" />
      <Need met="bad" label="Your own key" detail={where} />
    </ul>
  );
}

/**
 * The full view before the person's own key: why, what is met, and the way
 * to Set-up, a sheet on a narrow screen.
 */
export function NoOwnKeyYet({ onAddKey }: { onAddKey: () => void }) {
  return (
    <div className="pb-empty pb-chat-view__empty">
      <Icon name="lock" />
      <p className="pb-empty__title">Use your own key in this browser</p>
      <p>
        This server doesn't run the agent for you. With your own key from OpenRouter, it runs here
        in this browser, for you only.
      </p>
      <OwnKeyChecks where="Add it in Set-up" />
      <button type="button" className="pb-btn pb-btn--primary pb-chat-view__add-key" onClick={onAddKey}>
        Add your key
      </button>
    </div>
  );
}

/** The side panel before the person's own key: what is met, then the key card. */
export function OwnKeyNeeded({ ownKey }: { ownKey: OwnKey }) {
  return (
    <div className="pb-chat__state">
      <OwnKeyChecks where="Add it below" />
      <OwnKeyCard saved={undefined} ownKey={ownKey} />
    </div>
  );
}

/** The server answered with a fault; asking again happens by itself. */
export function ChatUnreachable({ message }: { message: string }) {
  return (
    <div className="pb-chat__state">
      <p className="pb-chat__state-title">The agent cannot be reached</p>
      <p className="pb-chat__state-text">{message}</p>
      <p className="pb-chat__waiting" role="status">
        <Icon name="refresh" />
        Trying again by itself…
      </p>
    </div>
  );
}

/**
 * The full view before the key: what is met, and where the key goes. On a
 * narrow screen Set-up is a sheet, so the action opens it.
 */
export function NoKeyYet({ onAddKey }: { onAddKey: () => void }) {
  return (
    <div className="pb-empty pb-chat-view__empty">
      <Icon name="shield" />
      <p className="pb-empty__title">No key yet</p>
      <p>The agent needs an OpenRouter key before it can start. An admin adds it once, in Set-up.</p>
      <ul className="pb-checks">
        <Need met="ok" label="On for you on this server" />
        <Need met="bad" label="A key" detail="Add it in Set-up" />
      </ul>
      <button type="button" className="pb-btn pb-btn--primary pb-chat-view__add-key" onClick={onAddKey}>
        Add the key
      </button>
    </div>
  );
}

/** An admin, before the key: what is met, then the key card. */
export function KeyNeeded({
  status,
  gateway,
}: {
  status: AiGatewayStatus;
  gateway: UseAiGatewayResult;
}) {
  return (
    <div className="pb-chat__state">
      <ul className="pb-checks">
        <Need met="ok" label="On for you on this server" />
        <Need met="bad" label="A key" detail="Add it below" />
      </ul>
      <KeyCard status={status} gateway={gateway} />
    </div>
  );
}
