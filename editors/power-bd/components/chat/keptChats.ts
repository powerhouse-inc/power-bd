import { keptConversations } from "../../kit/chat/index.js";
import { browserStorage } from "./useChatChoices.js";

/**
 * The page's conversations with the agent: each person's in each space,
 * outside React, so leaving the app and coming back finds them as they were,
 * and kept in the browser's storage for a reload (kept-conversation.ts).
 */
export const keptChats = keptConversations({ storage: browserStorage });
