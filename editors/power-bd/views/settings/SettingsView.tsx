import { EmptyPlace } from "../../components/EmptyPlace.js";
import { GuideSetting } from "./GuideSetting.js";
import { SettingsDetail } from "../../records/settings/SettingsDetail.js";
import { useBdSettingsDocumentsInSelectedDrive } from "../../components/useDriveDocuments.js";

/** The Settings place: the drive's one settings record, shown as a page. */
export function SettingsView({ driveId }: { driveId: string }) {
  const settings = useBdSettingsDocumentsInSelectedDrive()?.[0];
  if (!settings)
    return (
      <div className="pb-page">
        <EmptyPlace
          icon="settings"
          title="Settings are being set up"
          text="Team, time zone and vault settings will appear here in a moment."
        />
      </div>
    );
  return (
    <SettingsDetail documentId={settings.header.id}>
      <GuideSetting driveId={driveId} />
    </SettingsDetail>
  );
}
