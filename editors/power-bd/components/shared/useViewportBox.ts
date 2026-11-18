import { useLayoutEffect, useState, type RefObject } from "react";

/** Where the part of an element that is in view starts, and how tall it is, inside its scrolling container. */
export type ViewportBox = { top: number; height: number };

/**
 * The visible part of an element whose page scrolls inside a container, kept
 * current while the container scrolls or the window resizes: a panel placed
 * with it stays over what the person is looking at instead of at the top of
 * the page. Measures only while `on`.
 */
export function useViewportBox(
  host: RefObject<HTMLElement | null>,
  on: boolean,
): ViewportBox | null {
  const [box, setBox] = useState<ViewportBox | null>(null);
  useLayoutEffect(() => {
    const el = host.current;
    if (!on || !el) return;
    let scroller = el.parentElement;
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY))
      scroller = scroller.parentElement;
    const update = () => {
      const hostTop = el.getBoundingClientRect().top;
      const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
      setBox({
        top: Math.max(0, viewTop - hostTop),
        height: viewHeight - Math.max(0, hostTop - viewTop),
      });
    };
    update();
    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [host, on]);
  return on ? box : null;
}
