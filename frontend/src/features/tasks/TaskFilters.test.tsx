import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UNASSIGNED_FILTER } from "./task.assignee";
import { DEFAULT_FILTERS } from "./task.filters";
import type { TaskFilterState } from "./task.filters";
import TaskFilters from "./TaskFilters";

const assignees = ["Alex Admin", "Morgan Manager"];

const renderFilters = (
  filters: TaskFilterState = DEFAULT_FILTERS,
  hasUnassigned = false
) => {
  const onChange = vi.fn();
  render(
    <TaskFilters
      filters={filters}
      assignees={assignees}
      hasUnassigned={hasUnassigned}
      onChange={onChange}
    />
  );
  return { onChange };
};

describe("TaskFilters", () => {
  it("reports the search text", async () => {
    const { onChange } = renderFilters();
    await userEvent.type(screen.getByLabelText("Search"), "r");
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTERS, search: "r" });
  });

  it("reports the chosen status", async () => {
    const { onChange } = renderFilters();
    await userEvent.selectOptions(screen.getByLabelText("Status"), "Done");
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      status: "Done",
    });
  });

  it("reports the chosen priority", async () => {
    const { onChange } = renderFilters();
    await userEvent.selectOptions(screen.getByLabelText("Priority"), "High");
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      priority: "High",
    });
  });

  it("reports the chosen assignee", async () => {
    const { onChange } = renderFilters();
    await userEvent.selectOptions(
      screen.getByLabelText("Assigned To"),
      "Morgan Manager"
    );
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      assignee: "Morgan Manager",
    });
  });

  it("reports the chosen sort order", async () => {
    const { onChange } = renderFilters();
    await userEvent.selectOptions(
      screen.getByLabelText("Sort by due date"),
      "desc"
    );
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTERS, sort: "desc" });
  });

  it("resets every filter to the defaults", async () => {
    const { onChange } = renderFilters({
      search: "report",
      status: "Done",
      priority: "High",
      assignee: "Alex Admin",
      sort: "desc",
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Reset filters" })
    );
    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTERS);
  });

  it("keeps the selected assignee in the list even if it is not an employee any more", () => {
    renderFilters({ ...DEFAULT_FILTERS, assignee: "Former Employee" });
    expect(
      screen.getByRole("option", { name: "Former Employee" })
    ).toBeInTheDocument();
  });

  it("offers Unassigned when a task has no assignee", () => {
    renderFilters(DEFAULT_FILTERS, true);
    expect(
      screen.getByRole("option", { name: "Unassigned" })
    ).toBeInTheDocument();
  });

  it("does not offer Unassigned when every task has an assignee", () => {
    renderFilters();
    expect(
      screen.queryByRole("option", { name: "Unassigned" })
    ).not.toBeInTheDocument();
  });

  it("reports the Unassigned choice", async () => {
    const { onChange } = renderFilters(DEFAULT_FILTERS, true);
    await userEvent.selectOptions(
      screen.getByLabelText("Assigned To"),
      "Unassigned"
    );
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_FILTERS,
      assignee: UNASSIGNED_FILTER,
    });
  });

  it("keeps Unassigned selected without adding a raw option", () => {
    renderFilters({ ...DEFAULT_FILTERS, assignee: UNASSIGNED_FILTER });
    expect(screen.getByLabelText("Assigned To")).toHaveValue(UNASSIGNED_FILTER);
    expect(
      screen.queryByRole("option", { name: UNASSIGNED_FILTER })
    ).not.toBeInTheDocument();
  });
});
