import { describe, expect, it } from "vitest";
import {
  UNASSIGNED_LABEL,
  getAssigneeLabel,
  isAssignedTo,
  isUnassigned,
} from "./task.assignee";

describe("isUnassigned", () => {
  it("is true for an empty or blank name", () => {
    expect(isUnassigned({ assignedTo: "" })).toBe(true);
    expect(isUnassigned({ assignedTo: "   " })).toBe(true);
  });

  it("is false when there is a name", () => {
    expect(isUnassigned({ assignedTo: "Alex Admin" })).toBe(false);
  });
});

describe("getAssigneeLabel", () => {
  it("returns Unassigned for a task without an assignee", () => {
    expect(getAssigneeLabel({ assignedTo: "" })).toBe(UNASSIGNED_LABEL);
    expect(getAssigneeLabel({ assignedTo: "  " })).toBe("Unassigned");
  });

  it("returns the name when there is one", () => {
    expect(getAssigneeLabel({ assignedTo: "Alex Admin" })).toBe("Alex Admin");
  });
});

describe("isAssignedTo", () => {
  it("never matches a task without an assignee", () => {
    expect(isAssignedTo({ assignedTo: "" }, "Alex Admin")).toBe(false);
    expect(isAssignedTo({ assignedTo: "" }, "")).toBe(false);
  });
});
