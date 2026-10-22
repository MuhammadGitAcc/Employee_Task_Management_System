import { storage } from "./storage";

const LEGACY_KEYS = [
  "tasks",
  "taskComments",
  "taskActivity",
  "employees",
  "chatMessages",
];

export const clearLegacyData = (): void => {
  LEGACY_KEYS.forEach((key) => storage.remove(key));
};
