import type { HubEvent } from "../types/chat.types.js";

type Listener = (event: HubEvent) => void;

const listeners = new Set<Listener>();

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const publish = (event: HubEvent): void => {
  listeners.forEach((listener) => listener(event));
};
