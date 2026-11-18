/**
 * A request for the agent made from a page: "Refine with the agent" on a
 * brief. The Shell hears it and opens the chat; the conversation, once it
 * may go on, takes it and sends it. One request waits at a time: a newer one
 * replaces an unsent older one. Plain state, no React, so it can be tested.
 */
export function createAgentRequests() {
  let pending: string | null = null;
  const listeners = new Set<() => void>();
  return {
    /** Asks the agent; whoever listens opens the chat and sends it. */
    request(text: string) {
      pending = text;
      for (const listener of [...listeners]) listener();
    },
    /** The waiting request, left waiting. */
    peek: (): string | null => pending,
    /** The waiting request, taken: nobody else sends it. */
    take(): string | null {
      const text = pending;
      pending = null;
      return text;
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** The app's one channel for requests to the agent. */
export const agentRequests = createAgentRequests();
