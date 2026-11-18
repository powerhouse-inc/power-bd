import { useUser } from "@powerhousedao/reactor-browser";
import { getHostAiTools } from "@powerhousedao/reactor-browser/ai";
import { useCallback, useMemo } from "react";
import { bdChatTools, chatInstructions } from "../../kit/chat/index.js";
import { agentDeleteRefusal } from "../../kit/record-delete/index.js";
import { settingsOrDefaults } from "../../kit/settings/index.js";
import { useDriveBackend, useDriveRecordsReader, useDriveWritable } from "../data/driveData.js";
import { useTeam } from "../shared/useTeam.js";
import { useToday } from "../shared/useToday.js";
import { useBdSettingsDocumentsInSelectedDrive } from "../useDriveDocuments.js";
import { ownTools } from "./ownTools.js";

/**
 * The chat's tools and instructions. The tools are the host's, narrowed and
 * wrapped by the kit (confidential items withheld, the vault's tools reading
 * the vault in Settings), with Power BD's own: the reactor's tools on the
 * space's Switchboard when it is shared, and the space's history. They are
 * resolved when a message is sent, so the latest Settings apply. The
 * instructions say whether auto-approve is on.
 */
export function useChatSetup(
  driveId: string,
  spaceName: string,
  vaultDriveId: string | null,
  autoApprove: boolean,
  /** The vault refused this person: its tools are left out, and the agent says why. */
  vaultLocked = false,
) {
  const { timeZone } = settingsOrDefaults(
    useBdSettingsDocumentsInSelectedDrive()?.[0]?.state.global,
  );
  const today = useToday();
  const team = useTeam();
  const userName = team.nameFor(useUser()?.address);
  const backend = useDriveBackend();
  // A view-only member's agent answers and never offers a change the server refuses.
  const mayChange = useDriveWritable();
  // A delete the agent asks for is checked against the record page's rule first.
  const readRecords = useDriveRecordsReader();

  const tools = useCallback(
    async () =>
      bdChatTools(
        await getHostAiTools(),
        { vaultDriveId, bdDriveId: driveId },
        {
          ...ownTools(backend, driveId, (address) => team.nameFor(address)),
          withoutVault: vaultLocked,
          deleteCheck: async (documentId) => agentDeleteRefusal(documentId, await readRecords()),
        },
      ),
    [vaultDriveId, driveId, backend, team, vaultLocked, readRecords],
  );
  const instructions = useMemo(
    () =>
      chatInstructions({
        today,
        timeZone,
        bdDrive: { id: driveId, name: spaceName },
        vaultDriveId,
        userName,
        autoApprove,
        mayChange,
        vaultReadable: !vaultLocked,
      }),
    [today, timeZone, driveId, spaceName, vaultDriveId, userName, autoApprove, mayChange, vaultLocked],
  );
  return { tools, instructions, userName };
}
