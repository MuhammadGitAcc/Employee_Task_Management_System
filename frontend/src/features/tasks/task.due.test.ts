import { describe, expect, it } from "vitest";
import { getDaysFromTodayISO } from "~/utils/helpers";
import { DUE_SOON_DAYS, getDueState } from "./task.due";

describe("getDueState", () => {
  it("marks an open task due yesterday as overdue", () => {
    expect(
      getDueState({ dueDate: getDaysFromTodayISO(-1), status: "To Do" })
    ).toBe("overdue");
  });

  it("marks a task due today as due soon", () => {
    expect(
      getDueState({ dueDate: getDaysFromTodayISO(0), status: "In Progress" })
    ).toBe("due-soon");
  });

  it("marks a task due on the last due-soon day as due soon", () => {
    expect(
      getDueState({
        dueDate: getDaysFromTodayISO(DUE_SOON_DAYS),
        status: "To Do",
      })
    ).toBe("due-soon");
  });

  it("does not highlight a task due after the due-soon window", () => {
    expect(
      getDueState({
        dueDate: getDaysFromTodayISO(DUE_SOON_DAYS + 1),
        status: "To Do",
      })
    ).toBe("none");
  });

  it("never highlights a finished task", () => {
    expect(
      getDueState({ dueDate: getDaysFromTodayISO(-5), status: "Done" })
    ).toBe("none");
  });

  it("does not highlight a task without a due date", () => {
    expect(getDueState({ dueDate: "", status: "To Do" })).toBe("none");
  });
});
