import { describe, expect, it } from "vitest";
import { UNASSIGNED_FILTER } from "./task.assignee";
import { DEFAULT_FILTERS, filterTasks } from "./task.filters";
import type { Task } from "./task.types";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "1",
  title: "Task",
  description: "",
  status: "To Do",
  priority: "Medium",
  dueDate: "2026-11-01",
  assigneeId: "user-alex",
  assignedTo: "Alex Admin",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  ...overrides,
});

const tasks: Task[] = [
  makeTask({
    id: "a",
    title: "Write report",
    description: "Quarterly numbers",
    status: "To Do",
    priority: "High",
    dueDate: "2026-11-20",
    assignedTo: "Alex Admin",
  }),
  makeTask({
    id: "b",
    title: "Fix login bug",
    description: "Users cannot sign in",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2026-11-05",
    assignedTo: "Morgan Manager",
  }),
  makeTask({
    id: "c",
    title: "Plan offsite",
    description: "Book a venue",
    status: "Done",
    priority: "Low",
    dueDate: "2026-12-01",
    assignedTo: "Alex Admin",
  }),
];

const ids = (list: Task[]) => list.map((task) => task.id);

describe("filterTasks", () => {
  it("returns every task, earliest due date first, by default", () => {
    expect(ids(filterTasks(tasks, DEFAULT_FILTERS))).toEqual(["b", "a", "c"]);
  });

  it("can sort with the latest due date first", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, sort: "desc" });
    expect(ids(result)).toEqual(["c", "a", "b"]);
  });

  it("filters by status", () => {
    const result = filterTasks(tasks, {
      ...DEFAULT_FILTERS,
      status: "In Progress",
    });
    expect(ids(result)).toEqual(["b"]);
  });

  it("filters by priority", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, priority: "High" });
    expect(ids(result)).toEqual(["a"]);
  });

  it("filters by assignee", () => {
    const result = filterTasks(tasks, {
      ...DEFAULT_FILTERS,
      assignee: "Alex Admin",
    });
    expect(ids(result)).toEqual(["a", "c"]);
  });

  it("filters the tasks without an assignee", () => {
    const withUnassigned = [
      ...tasks,
      makeTask({ id: "d", assigneeId: null, assignedTo: "" }),
    ];
    const result = filterTasks(withUnassigned, {
      ...DEFAULT_FILTERS,
      assignee: UNASSIGNED_FILTER,
    });
    expect(ids(result)).toEqual(["d"]);
  });

  it("leaves the tasks without an assignee out when an employee is chosen", () => {
    const withUnassigned = [
      ...tasks,
      makeTask({ id: "d", assigneeId: null, assignedTo: "" }),
    ];
    const result = filterTasks(withUnassigned, {
      ...DEFAULT_FILTERS,
      assignee: "Alex Admin",
    });
    expect(ids(result)).toEqual(["a", "c"]);
  });

  it("keeps the tasks without an assignee in the full list", () => {
    const withUnassigned = [
      ...tasks,
      makeTask({
        id: "d",
        dueDate: "2026-11-02",
        assigneeId: null,
        assignedTo: "",
      }),
    ];
    expect(ids(filterTasks(withUnassigned, DEFAULT_FILTERS))).toEqual([
      "d",
      "b",
      "a",
      "c",
    ]);
  });

  it("searches the title without caring about letter case", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, search: "LOGIN" });
    expect(ids(result)).toEqual(["b"]);
  });

  it("searches the description", () => {
    const result = filterTasks(tasks, { ...DEFAULT_FILTERS, search: "venue" });
    expect(ids(result)).toEqual(["c"]);
  });

  it("ignores spaces around the search text", () => {
    const result = filterTasks(tasks, {
      ...DEFAULT_FILTERS,
      search: "  report  ",
    });
    expect(ids(result)).toEqual(["a"]);
  });

  it("combines several filters", () => {
    const result = filterTasks(tasks, {
      ...DEFAULT_FILTERS,
      assignee: "Alex Admin",
      status: "Done",
    });
    expect(ids(result)).toEqual(["c"]);
  });

  it("returns an empty list when nothing matches", () => {
    const result = filterTasks(tasks, {
      ...DEFAULT_FILTERS,
      search: "nothing like this",
    });
    expect(result).toEqual([]);
  });

  it("does not change the order of the original list", () => {
    filterTasks(tasks, DEFAULT_FILTERS);
    expect(ids(tasks)).toEqual(["a", "b", "c"]);
  });
});
