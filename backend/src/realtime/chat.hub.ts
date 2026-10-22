import type { BroadcastEvent } from "../types/chat.types.js";

type Listener = (event: BroadcastEvent) => void;

const listeners = new Set<Listener>();

export const subscribe = (listener: Listener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const publish = (event: BroadcastEvent): void => {
  listeners.forEach((listener) => listener(event));
};
