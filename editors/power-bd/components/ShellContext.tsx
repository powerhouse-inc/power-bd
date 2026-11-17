import { createContext, useContext } from "react";

/** True inside the app shell, which already provides the root and the icons. */
const InShell = createContext(false);
export const ShellProvider = InShell.Provider;
export const useInShell = () => useContext(InShell);
