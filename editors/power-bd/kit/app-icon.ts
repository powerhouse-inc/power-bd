/**
 * The app's icon for its drive tile. Connect draws a drive's tile from the
 * drive's own `icon` (an image URL); an app cannot declare one, so the app
 * gives its drive this icon on open. The SVG is the design system's
 * `app-icon.svg`; a test keeps the two identical.
 */
const APP_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" id="power-bd-app-icon">\n<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#32373b"/><stop offset="1" stop-color="#181b1d"/></linearGradient></defs>\n<rect width="512" height="512" rx="68" fill="url(#g)"/>\n<g transform="translate(96 96) scale(13.333)" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">\n<circle cx="14.5" cy="9.5" r="8.5" stroke="#f3f5f7"/>\n<circle cx="14.5" cy="9.5" r="5" stroke="#f3f5f7"/>\n<path d="M2.5 21.5L14.5 9.5M11.5 9.5h3v3" stroke="#329dff" stroke-width="1"/>\n<path d="M4.1 19.9H2.5M4.1 19.9v1.6M6.3 17.7H4.7M6.3 17.7v1.6" stroke="#329dff" stroke-width="1"/>\n</g>\n</svg>';

/** The icon as a self-contained image URL, so it works on any host. */
export const APP_ICON_URL = `data:image/svg+xml,${encodeURIComponent(APP_ICON_SVG)}`;

/** Every version of the app's icon carries this id, so a newer one can replace it. */
const MARK = encodeURIComponent('id="power-bd-app-icon"');

/**
 * The icon to give a drive: the app's when it has none or has an earlier
 * version of the app's own; nothing when it has an icon someone chose.
 */
export function driveIconToSet(
  current: string | null | undefined,
): string | null {
  if (!current?.trim()) return APP_ICON_URL;
  const ours =
    current.startsWith("data:image/svg+xml,") && current.includes(MARK);
  return ours && current !== APP_ICON_URL ? APP_ICON_URL : null;
}
