import { useUser } from "@powerhousedao/reactor-browser";
import { getHostAiTools } from "@powerhousedao/reactor-browser/ai";
import { useCallback, useMemo } from "react";
import { bdChatTools, chatInstructions } from "../../kit/chat/index.js";
import { settingsOrDefaults } from "../../kit/settings/index.js";
import { useTeam } from "../shared/useTeam.js";
import { useToday } from "../shared/useToday.js";
import { useBdSettingsDocumentsInSelectedDrive } from "../useDriveDocuments.js";

/**
 * The chat's tools and instructions. The tools are the host's, narrowed and
 * wrapped by the kit (confidential items withheld, the vault's tools reading
 * the vault in Settings); they are resolved when a message is sent, so the
 * latest Settings apply. The instructions say whether auto-approve is on.
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
  const userName = useTeam().nameFor(useUser()?.address);

  const tools = useCallback(
    async () => bdChatTools(await getHostAiTools(), { vaultDriveId, bdDriveId: driveId }),
    [vaultDriveId, driveId],
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
      }),
    [today, timeZone, driveId, spaceName, vaultDriveId, userName, autoApprove],
  );
  return { tools, instructions, userName };
}
