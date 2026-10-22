import { describe, expect, it } from "vitest";
import { clearLegacyData } from "./legacyStorage";

describe("clearLegacyData", () => {
  it("removes the task, employee and chat data saved before the API", () => {
    const keys = [
      "tasks",
      "taskComments",
      "taskActivity",
      "employees",
      "chatMessages",
    ];
    keys.forEach((key) => localStorage.setItem(key, "[]"));

    clearLegacyData();

    keys.forEach((key) => expect(localStorage.getItem(key)).toBeNull());
  });

  it("keeps the other saved data", () => {
    localStorage.setItem("theme", "dark");
    localStorage.setItem("token", "abc");

    clearLegacyData();

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(localStorage.getItem("token")).toBe("abc");
  });
});
