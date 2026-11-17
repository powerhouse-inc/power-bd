import { useState } from "react";

export function NotesField({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (v: string) => void;
}) {
  const [edited, setEdited] = useState<string>();
  return (
    <textarea
      className="pb-input"
      rows={4}
      aria-label="Notes"
      value={edited ?? value}
      onChange={(e) => setEdited(e.target.value)}
      onBlur={() => {
        if (edited !== undefined && edited !== value) onCommit(edited);
        setEdited(undefined);
      }}
    />
  );
}
