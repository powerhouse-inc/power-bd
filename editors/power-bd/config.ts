import type { PHAppConfig } from "@powerhousedao/reactor-browser";

export const editorConfig: PHAppConfig = {
  isDragAndDropEnabled: true,
  allowedDocumentTypes: [
    "powerbd/contact",
    "powerbd/settings",
    "powerbd/lead",
    "powerbd/opportunity",
    "powerbd/investor-list",
    "powerbd/decision",
    "powerbd/playbook",
    "powerbd/proposal",
    "powerbd/market",
  ],
};
