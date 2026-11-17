import { useEffect, useId, useRef, useState } from "react";
import type { IconName } from "../../../../design-system/icons.js";
import { menuKey, type MenuState } from "../../kit/overview-view/index.js";
import { Icon } from "../Icon.js";

export type MenuOption = { value: string; label: string; icon?: IconName };

/**
 * A button that drops a list of choices (`.pb-menu`). The first option is the
 * one that narrows nothing ("All", "Anyone"): the trigger reads as a filter
 * that is on once another is chosen. Keys: arrows, Home, End, Enter, Space,
 * Escape and a letter to jump; a click outside closes it.
 */
export function Menu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: MenuOption[];
  onChange: (value: string) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<MenuState>({ open: false, active: 0 });
  const selected = options.findIndex((o) => o.value === value);
  const current = options.at(Math.max(selected, 0));
  const close = () => setState((s) => ({ ...s, open: false }));

  useEffect(() => {
    if (!state.open) return;
    const outside = (e: MouseEvent) => {
      if (e.target instanceof Node && !root.current?.contains(e.target))
        close();
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [state.open]);

  useEffect(() => {
    if (state.open)
      list.current?.children
        .item(state.active)
        ?.scrollIntoView({ block: "nearest" });
  }, [state.open, state.active]);

  const choose = (index: number) => {
    const option = options.at(index);
    if (option) onChange(option.value);
    setState({ open: false, active: index });
  };

  return (
    <div className="pb-menu" ref={root}>
      <button
        type="button"
        className={`pb-filter pb-menu__trigger${selected > 0 ? "" : " pb-filter--off"}`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={state.open}
        aria-controls={`${id}-list`}
        aria-activedescendant={state.open ? `${id}-${state.active}` : undefined}
        aria-label={`${label}: ${current?.label ?? ""}`}
        onClick={() =>
          setState((s) => ({ open: !s.open, active: Math.max(selected, 0) }))
        }
        onBlur={close}
        onKeyDown={(e) => {
          const step = menuKey(
            state,
            e.key,
            options.map((o) => o.label),
            selected,
          );
          if (!step) return;
          e.preventDefault();
          if (step.select === undefined) setState(step);
          else choose(step.select);
        }}
      >
        {label}:<span className="pb-menu__value">{current?.label}</span>
        <Icon name="chevron-down" className="pb-icon pb-icon--sm" />
      </button>
      {state.open ? (
        <div
          className="pb-popover pb-menu__list"
          role="listbox"
          id={`${id}-list`}
          aria-label={label}
          ref={list}
        >
          {options.map((o, i) => (
            <div
              key={o.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === selected}
              className={`pb-menu__item${i === state.active ? " is-active" : ""}`}
              // Keeps the focus on the trigger, so the keys go on working.
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setState({ open: true, active: i })}
              onClick={() => choose(i)}
            >
              {o.icon ? <Icon name={o.icon} /> : null}
              {o.label}
              {i === selected ? (
                <span className="pb-menu__check">
                  <Icon name="check" className="pb-icon pb-icon--sm" />
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
