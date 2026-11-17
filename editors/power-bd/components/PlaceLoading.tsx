import type { Place } from "../kit/places.js";

/**
 * A place while the drive's records first load, inside the frame: its title
 * at once, and quiet lines where its content will be. The sidebar and top bar
 * are already there. Later visits find the records loaded and never show it.
 */
export function PlaceLoading({ place }: { place: Place }) {
  return (
    <div className="pb-page pb-page--wide">
      <div className="pb-page__head">
        <h1 className="pb-page__title">{place.label}</h1>
      </div>
      <div className="pb-stack pb-gap-12" role="status" aria-label={`Loading ${place.label}`}>
        <span className="pb-skeleton" style={{ width: "38%" }} />
        <span className="pb-skeleton" style={{ width: "72%" }} />
        <span className="pb-skeleton" style={{ width: "64%" }} />
        <span className="pb-skeleton" style={{ width: "48%" }} />
      </div>
    </div>
  );
}
