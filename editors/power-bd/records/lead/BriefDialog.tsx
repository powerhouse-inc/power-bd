import { useState } from "react";
import { Icon } from "../../components/Icon.js";
import { useInShell } from "../../components/ShellContext.js";
import { agentPrompt, briefMarkdown, type Brief } from "../../kit/brief/index.js";
import { agentRequests } from "../../kit/chat/index.js";
import { copyText } from "../../kit/clipboard/index.js";

/**
 * The brief for a meeting, in a wide dialog: read it, copy it as markdown,
 * or hand it to the agent to write up with questions to ask. Copies for
 * others and the agent never get the internal items; a copy for the team can
 * carry them, said so beside the button. Escape or Close returns to the lead.
 */
export function BriefDialog({ brief, onClose }: { brief: Brief; onClose: () => void }) {
  const inShell = useInShell();
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const copy = (internal: boolean) =>
    void copyText(briefMarkdown(brief, { internal }), navigator.clipboard).then((done) =>
      setSaid(
        done.ok
          ? { ok: true, text: internal ? "Copied with the internal items: for the team only." : "Copied, without the internal items." }
          : { ok: false, text: done.message },
      ),
    );
  return (
    <div className="pb-backdrop" onClick={onClose}>
      <div
        className="pb-dialog pb-dialog--doc"
        role="dialog"
        aria-modal="true"
        aria-label={brief.title}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="pb-dialog__head">
          <Icon name="note" />
          {brief.title}
        </div>
        <div className="pb-dialog__body">
          <p className="pb-brief__summary">{brief.summary}</p>
          {brief.sections.map((s) => {
            const body =
              s.lines.length === 0 ? (
                <p className="pb-brief__empty">{s.empty}</p>
              ) : (
                <ul className="pb-brief__list">
                  {s.lines.map((l, i) => (
                    <li key={i} className={l.late ? "pb-brief__late" : undefined}>
                      {l.late ? "Late: " : ""}
                      {l.text}
                      {l.detail ? <span className="pb-brief__detail">{l.detail}</span> : null}
                    </li>
                  ))}
                </ul>
              );
            return s.internal ? (
              <div key={s.id} className="pb-callout pb-callout--purple">
                <Icon name="lock" />
                <div className="pb-callout__body">
                  <div className="pb-callout__title">{s.heading}: never copied for others or sent to the agent</div>
                  {body}
                </div>
              </div>
            ) : (
              <section key={s.id} className="pb-brief__section">
                <h3 className="pb-brief__heading">{s.heading}</h3>
                {body}
              </section>
            );
          })}
        </div>
        <div className="pb-dialog__foot">
          {said ? (
            <p className={said.ok ? "pb-reassure" : "pb-field__error"} role="status">
              <Icon name={said.ok ? "check" : "info"} />
              {said.text}
            </p>
          ) : (
            <p className="pb-reassure">
              <Icon name="shield" />
              Nothing is sent from Power BD. Copies and the agent leave out the internal items.
            </p>
          )}
          <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={() => copy(true)}>
            Copy for the team
          </button>
          <button type="button" className="pb-btn pb-btn--sm" onClick={() => copy(false)}>
            <Icon name="copy" />
            Copy markdown
          </button>
          {inShell ? (
            <button
              type="button"
              className="pb-btn pb-btn--primary pb-btn--sm"
              onClick={() => {
                agentRequests.request(agentPrompt(brief));
                onClose();
              }}
            >
              <Icon name="sparkles" />
              Refine with the agent
            </button>
          ) : null}
          <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" autoFocus onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
