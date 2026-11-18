import { dispatchActions } from "@powerhousedao/reactor-browser";
import { useState, type DragEvent, type RefObject } from "react";
import {
  moveHint,
  type ColumnTarget,
  type MoveOption,
  type MoveOutcome,
} from "../../../kit/overview-view/index.js";
import { Icon } from "../../Icon.js";
import { moveAction } from "./moveAction.js";

/** A move that waits for an answer, in the column the card was put on. */
export type BoardAsk<K extends string> = {
  key: string;
  column: K;
  outcome: Extract<
    MoveOutcome,
    { kind: "choose" | "reason" | "confirm" | "decision" }
  >;
};

type Drag<K extends string> = {
  key: string;
  targets: ColumnTarget<K>[];
  away: boolean;
};

/**
 * Picking a card up, putting it on a column, and answering what the move asks,
 * on a board whose cards are records. What each column does comes from the
 * kit's rules; the action sent is the one the record page sends; a refusal
 * shows beside the card, which stays where its record says. A card's key is
 * its document's id.
 */
export function useBoardMove<K extends string>({
  root,
  targetsOf,
}: {
  /** The board, to give the focus back to a card. */
  root: RefObject<HTMLElement | null>;
  /** What each column would do to the card with this key. */
  targetsOf: (key: string) => ColumnTarget<K>[];
}) {
  const [drag, setDrag] = useState<Drag<K> | null>(null);
  const [over, setOver] = useState<K | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [ask, setAsk] = useState<BoardAsk<K> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ key: string; message: string } | null>(
    null,
  );

  /** Sends the move to the card's record. */
  const apply = (key: string, option: MoveOption, reason?: string) => {
    setBusy(true);
    setError(null);
    const refuse = (errors: Error[]) =>
      setError({
        key,
        message: errors.at(0)?.message ?? "That was not accepted.",
      });
    dispatchActions(moveAction(option, reason), key, refuse)
      .catch((e: unknown) => refuse(e instanceof Error ? [e] : []))
      .finally(() => {
        setBusy(false);
        setAsk(null);
      });
  };

  /** Puts a card on a column: sets the one status at once, or asks first. */
  const move = (key: string, column: K) => {
    const outcome = targetsOf(key).find((t) => t.stage === column)?.outcome;
    setMenu(null);
    setError(null);
    if (!outcome) return;
    if (outcome.kind === "set") apply(key, outcome.option);
    else if (outcome.kind !== "stay" && outcome.kind !== "refused")
      setAsk({ key, column, outcome });
  };

  /** Closes the question and gives the focus back to the card, which never left. */
  const cancel = () => {
    const key = ask?.key ?? "";
    setAsk(null);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLElement>(`[data-card="${CSS.escape(key)}"]`)
        ?.focus(),
    );
  };

  /** What a column shows and does while a card is in the hand. */
  const dropZone = (column: K) => {
    const target = drag?.targets.find((t) => t.stage === column);
    const state = !target
      ? ""
      : target.accepts
        ? " is-target"
        : target.outcome.kind === "refused"
          ? " is-refused"
          : "";
    const hint = target ? moveHint(target.outcome) : "";
    return {
      className: `${state}${over === column && state ? " is-over" : ""}`,
      hint: hint ? (
        <div className="pb-board__hint">
          <Icon name={target?.accepts ? "arrow-right" : "info"} />
          {hint}
        </div>
      ) : null,
      handlers: {
        onDragOver: (e: DragEvent) => {
          if (!target) return;
          if (target.accepts) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }
          if (over !== column) setOver(column);
        },
        onDragLeave: (e: DragEvent) => {
          const to = e.relatedTarget;
          if (!(to instanceof Node && e.currentTarget.contains(to)))
            setOver((o) => (o === column ? null : o));
        },
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          const key = drag?.key;
          setDrag(null);
          setOver(null);
          if (key && target?.accepts) move(key, column);
        },
      },
    };
  };

  /** What a card needs to be picked up, and how it looks while in the hand. */
  const cardDrag = (key: string, name: string) => {
    const targets = targetsOf(key);
    const movable = targets.some((t) => t.accepts);
    const held = drag?.key === key ? drag : null;
    return {
      targets,
      className: held ? (held.away ? " is-away" : " is-lifted") : "",
      props: {
        "data-card": key,
        draggable: movable,
        onDragStart: (e: DragEvent) => {
          e.dataTransfer.setData("text/plain", name);
          e.dataTransfer.effectAllowed = "move";
          setDrag({ key, targets, away: false });
          setAsk(null);
          setMenu(null);
          // The picture that follows the pointer is taken lifted; the place it left then fades.
          requestAnimationFrame(() =>
            setDrag((d) => (d?.key === key ? { ...d, away: true } : d)),
          );
        },
        onDragEnd: () => {
          setDrag(null);
          setOver(null);
        },
      },
    };
  };

  return {
    ask,
    busy,
    error,
    menu,
    setMenu,
    move,
    apply,
    cancel,
    dropZone,
    cardDrag,
  };
}
