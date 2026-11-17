import { Icon } from "../../components/Icon.js";
import { useTeam } from "../../components/shared/useTeam.js";
import { initials } from "../../components/shared/relationship/common.js";
import { ownerTone } from "../../kit/overview-view/index.js";

/** The owner's initials in their own colour, or an empty mark when nobody owns the item. */
export function OwnerAvatar({ owner }: { owner: string | null }) {
  const team = useTeam();
  if (owner === null)
    return (
      <span className="pb-avatar pb-avatar--empty" title="No owner">
        <Icon name="user" className="pb-icon pb-icon--xs" />
      </span>
    );
  const name = team.ownerName(owner);
  const tone = ownerTone(owner, team.members);
  return (
    <span
      className={`pb-avatar${tone ? ` pb-avatar--${tone}` : ""}`}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
