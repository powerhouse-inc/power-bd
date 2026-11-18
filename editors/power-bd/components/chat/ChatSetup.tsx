import { useSetup } from "../../views/overview/first-run/useSetup.js";
import { Icon } from "../Icon.js";
import { useGoToPlace } from "../PlaceContext.js";
import type { ChatReads } from "./ChatFrame.js";
import { KeyCard } from "./KeyCard.js";
import { OwnKeyCard } from "./OwnKeyCard.js";
import type { ChatService } from "./useChatService.js";

interface Props {
  driveId: string;
  service: ChatService;
  reads: ChatReads;
}

/**
 * Set-up, beside the conversation in the full view (a sheet where the screen
 * is narrow): the key card (the server's, or the person's own where the
 * server doesn't run the agent for them), what the agent reads, and the
 * set-up steps the space still has to do, gone once there are none.
 */
export function ChatSetup({ driveId, service, reads }: Props) {
  const { way } = service;
  const goTo = useGoToPlace();
  const { progress } = useSetup(driveId);
  const shown = progress.mode === "guide" || progress.mode === "strip";
  const left = shown
    ? progress.steps.filter((step) => step.state === "current" || step.state === "todo")
    : [];
  return (
    <div className="pb-chat-setup">
      {way.way === "server" ? <KeyCard status={way.status} gateway={service} /> : null}
      {way.way === "own-key" ? <OwnKeyCard saved={way.saved} ownKey={service.ownKey} /> : null}
      <section className="pb-chat-setup__card" aria-label="What the agent reads">
        <p className="pb-chat-setup__title">What the agent reads</p>
        <ul className="pb-chat-setup__reads">
          <li>
            <Icon name="board" />
            <span className="pb-truncate">{reads.space}</span>
            <span className="pb-faint">this space</span>
          </li>
          <li>
            <Icon name={reads.vault !== null && reads.vaultLocked ? "lock" : "note"} />
            {reads.vault === null ? (
              <span>No vault named in Settings</span>
            ) : (
              <>
                <span className="pb-truncate">{reads.vault}</span>
                <span className="pb-faint">{reads.vaultLocked ? "no access" : "the vault"}</span>
              </>
            )}
          </li>
        </ul>
        {reads.vault !== null && reads.vaultLocked ? (
          <p className="pb-reassure">
            <Icon name="info" />
            You don't have access to this vault, so the agent can't read it. An admin of the vault can give you access.
          </p>
        ) : null}
        <div className="pb-key__actions">
          <button type="button" className="pb-btn pb-btn--sm" onClick={() => goTo("settings")}>
            Open Settings
            <Icon name="chevron-right" />
          </button>
        </div>
      </section>
      {left.length > 0 ? (
        <section className="pb-chat-setup__card" aria-label="Set-up steps left">
          <p className="pb-chat-setup__title">
            Set-up steps left
            <span className="pb-faint">{progress.label}</span>
          </p>
          <ul className="pb-checks">
            {left.map((step) => (
              <li key={step.id} className="pb-checks__item">
                <Icon name="clock" />
                {step.title}
              </li>
            ))}
          </ul>
          <div className="pb-key__actions">
            <button type="button" className="pb-btn pb-btn--sm" onClick={() => goTo("overview")}>
              Continue on the Overview
              <Icon name="chevron-right" />
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
