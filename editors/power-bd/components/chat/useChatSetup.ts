import { useUser } from "@powerhousedao/reactor-browser";
import { getHostAiTools } from "@powerhousedao/reactor-browser/ai";
import { useCallback, useMemo } from "react";
import { bdChatTools, chatInstructions } from "../../kit/chat/index.js";
import { settingsOrDefaults } from "../../kit/settings/index.js";
import { useDriveBackend, useDriveWritable } from "../data/driveData.js";
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

  const tools = useCallback(
    async () =>
      bdChatTools(
        await getHostAiTools(),
        { vaultDriveId, bdDriveId: driveId },
        ownTools(backend, driveId, (address) => team.nameFor(address)),
      ),
    [vaultDriveId, driveId, backend, team],
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
      }),
    [today, timeZone, driveId, spaceName, vaultDriveId, userName, autoApprove, mayChange],
  );
  return { tools, instructions, userName };
}
