import { describe, expect, it } from "vitest";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  validateTask,
} from "./task.validation";

const valid = {
  title: "Write report",
  description: "Quarterly summary",
  dueDate: "2026-12-01",
  assigneeId: "user-alex",
};

describe("validateTask", () => {
  it("returns no errors for valid values", () => {
    expect(validateTask(valid)).toEqual({});
  });

  it("requires a title", () => {
    expect(validateTask({ ...valid, title: "   " }).title).toBe(
      "Title is required."
    );
  });

  it("rejects a title shorter than 3 characters", () => {
    expect(validateTask({ ...valid, title: "ab" }).title).toBe(
      "Title must be at least 3 characters."
    );
  });

  it("rejects a title longer than the maximum", () => {
    const title = "a".repeat(TITLE_MAX_LENGTH + 1);
    expect(validateTask({ ...valid, title }).title).toBe(
      `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`
    );
  });

  it("rejects a description longer than the maximum", () => {
    const description = "a".repeat(DESCRIPTION_MAX_LENGTH + 1);
    expect(validateTask({ ...valid, description }).description).toBe(
      `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`
    );
  });

  it("requires a due date", () => {
    expect(validateTask({ ...valid, dueDate: "" }).dueDate).toBe(
      "Due date is required."
    );
  });

  it("rejects a due date that is not a real date", () => {
    expect(validateTask({ ...valid, dueDate: "not-a-date" }).dueDate).toBe(
      "Enter a valid due date."
    );
    expect(validateTask({ ...valid, dueDate: "2026-13-45" }).dueDate).toBe(
      "Enter a valid due date."
    );
  });

  it("requires an assignee", () => {
    expect(validateTask({ ...valid, assigneeId: "" }).assigneeId).toBe(
      "Assigned to is required."
    );
  });

  it("reports several errors at once", () => {
    const errors = validateTask({
      title: "",
      description: "",
      dueDate: "",
      assigneeId: "",
    });
    expect(Object.keys(errors).sort()).toEqual([
      "assigneeId",
      "dueDate",
      "title",
    ]);
  });
});
