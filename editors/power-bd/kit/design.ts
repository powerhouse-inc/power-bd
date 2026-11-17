/**
 * Loads the design system once. Every part of the app that renders imports
 * this module, so the styles are present whichever of them Connect opens
 * first, including a record opened on its own. The files stay in
 * `design-system/`; nothing is copied here.
 */
import "../../../design-system/tokens.css";
import "../../../design-system/components.css";
