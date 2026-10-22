import { describe, expect, it, vi } from "vitest";
import { subscribe } from "../realtime/chat.hub.js";
import {
  adminUser,
  api,
  bearer,
  employeeUser,
  managerUser,
  mockUsers,
  taskRow,
  validTaskBody,
} from "../test/helpers.js";
import { prismaMock } from "../test/prismaMock.js";

describe("tasks routes", () => {
  it("GET /api/tasks requires a token", async () => {
    const res = await api().get("/api/tasks");

    expect(res.status).toBe(401);
  });

  it("GET /api/tasks returns tasks in the API shape", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findMany.mockResolvedValue([taskRow()]);

    const res = await api()
      .get("/api/tasks")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([
      {
        id: "task-1",
        title: "Prepare report",
        description: "",
        status: "To Do",
        priority: "Medium",
        dueDate: "2026-12-01",
        assigneeId: employeeUser.id,
        assignedTo: employeeUser.name,
        createdAt: "2026-10-18T05:00:00.000Z",
        updatedAt: "2026-10-18T05:00:00.000Z",
      },
    ]);
  });

  it("POST /api/tasks as Employee returns 403", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .post("/api/tasks")
      .set("Authorization", await bearer(employeeUser))
      .send(validTaskBody);

    expect(res.status).toBe(403);
    expect(prismaMock.task.create).not.toHaveBeenCalled();
  });

  it("POST /api/tasks as Manager creates the task and its activity", async () => {
    mockUsers(managerUser, employeeUser);
    prismaMock.task.create.mockResolvedValue(taskRow());

    const res = await api()
      .post("/api/tasks")
      .set("Authorization", await bearer(managerUser))
      .send(validTaskBody);

    expect(res.status).toBe(201);
    expect(res.body.task.status).toBe("To Do");

    const { data } = prismaMock.task.create.mock.calls[0][0];
    expect(data.status).toBe("ToDo");
    expect(data.activity.create).toEqual({
      actorId: managerUser.id,
      message: "created this task",
    });
  });

  it("POST /api/tasks with invalid input returns 400 with details", async () => {
    mockUsers(managerUser);

    const res = await api()
      .post("/api/tasks")
      .set("Authorization", await bearer(managerUser))
      .send({ ...validTaskBody, title: "ab", dueDate: "2026-02-31" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.title).toBe(
      "Title must be at least 3 characters.",
    );
    expect(res.body.error.details.dueDate).toBe("Enter a valid due date.");
  });

  it("POST /api/tasks with an unknown assignee returns 400", async () => {
    mockUsers(managerUser);

    const res = await api()
      .post("/api/tasks")
      .set("Authorization", await bearer(managerUser))
      .send({ ...validTaskBody, assigneeId: "ghost" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.assigneeId).toBe(
      "Selected employee does not exist.",
    );
  });

  it("PUT /api/tasks/:id as Manager records one activity entry per change", async () => {
    mockUsers(managerUser, employeeUser);
    prismaMock.task.findUnique.mockResolvedValue(taskRow());
    prismaMock.task.update.mockResolvedValue(
      taskRow({ title: "Prepare final report" }),
    );

    const res = await api()
      .put("/api/tasks/task-1")
      .set("Authorization", await bearer(managerUser))
      .send({ ...validTaskBody, title: "Prepare final report" });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe("Prepare final report");
    expect(prismaMock.taskActivity.createMany).toHaveBeenCalledWith({
      data: [
        {
          taskId: "task-1",
          actorId: managerUser.id,
          message:
            'changed title from "Prepare report" to "Prepare final report"',
        },
      ],
    });
  });

  it("PUT /api/tasks/:id for an unknown task returns 404", async () => {
    mockUsers(managerUser, employeeUser);
    prismaMock.task.findUnique.mockResolvedValue(null);

    const res = await api()
      .put("/api/tasks/missing")
      .set("Authorization", await bearer(managerUser))
      .send(validTaskBody);

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Task not found");
  });

  it("PATCH /api/tasks/:id/status lets an Employee change the status", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findUnique.mockResolvedValue(taskRow());
    prismaMock.task.update.mockResolvedValue(taskRow({ status: "InProgress" }));

    const res = await api()
      .patch("/api/tasks/task-1/status")
      .set("Authorization", await bearer(employeeUser))
      .send({ status: "In Progress" });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe("In Progress");
    expect(prismaMock.taskActivity.create).toHaveBeenCalledWith({
      data: {
        taskId: "task-1",
        actorId: employeeUser.id,
        message: 'changed status from "To Do" to "In Progress"',
      },
    });
  });

  it("PATCH /api/tasks/:id/status with the same status changes nothing", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findUnique.mockResolvedValue(taskRow());

    const res = await api()
      .patch("/api/tasks/task-1/status")
      .set("Authorization", await bearer(employeeUser))
      .send({ status: "To Do" });

    expect(res.status).toBe(200);
    expect(prismaMock.task.update).not.toHaveBeenCalled();
  });

  it("PATCH /api/tasks/:id/status with an invalid status returns 400", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .patch("/api/tasks/task-1/status")
      .set("Authorization", await bearer(employeeUser))
      .send({ status: "Finished" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.status).toBe(
      "Status must be To Do, In Progress or Done.",
    );
  });

  it("DELETE /api/tasks/:id as Manager returns 403", async () => {
    mockUsers(managerUser);

    const res = await api()
      .delete("/api/tasks/task-1")
      .set("Authorization", await bearer(managerUser));

    expect(res.status).toBe(403);
    expect(prismaMock.task.delete).not.toHaveBeenCalled();
  });

  it("DELETE /api/tasks/:id as Admin returns 204", async () => {
    mockUsers(adminUser);
    prismaMock.task.delete.mockResolvedValue(taskRow());

    const res = await api()
      .delete("/api/tasks/task-1")
      .set("Authorization", await bearer(adminUser));

    expect(res.status).toBe(204);
  });

  it("DELETE /api/tasks/:id for an unknown task returns 404", async () => {
    mockUsers(adminUser);
    prismaMock.task.delete.mockRejectedValue({ code: "P2025" });

    const res = await api()
      .delete("/api/tasks/missing")
      .set("Authorization", await bearer(adminUser));

    expect(res.status).toBe(404);
  });

  it("publishes tasks-changed after a task is created", async () => {
    mockUsers(managerUser, employeeUser);
    prismaMock.task.create.mockResolvedValue(taskRow());
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    const res = await api()
      .post("/api/tasks")
      .set("Authorization", await bearer(managerUser))
      .send(validTaskBody);
    unsubscribe();

    expect(res.status).toBe(201);
    expect(listener).toHaveBeenCalledWith({ type: "tasks-changed" });
  });

  it("publishes tasks-changed after a task is updated", async () => {
    mockUsers(managerUser, employeeUser);
    prismaMock.task.findUnique.mockResolvedValue(taskRow());
    prismaMock.task.update.mockResolvedValue(
      taskRow({ title: "Prepare final report" }),
    );
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    const res = await api()
      .put("/api/tasks/task-1")
      .set("Authorization", await bearer(managerUser))
      .send({ ...validTaskBody, title: "Prepare final report" });
    unsubscribe();

    expect(res.status).toBe(200);
    expect(listener).toHaveBeenCalledWith({ type: "tasks-changed" });
  });

  it("publishes tasks-changed after a task status changes", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findUnique.mockResolvedValue(taskRow());
    prismaMock.task.update.mockResolvedValue(taskRow({ status: "InProgress" }));
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    const res = await api()
      .patch("/api/tasks/task-1/status")
      .set("Authorization", await bearer(employeeUser))
      .send({ status: "In Progress" });
    unsubscribe();

    expect(res.status).toBe(200);
    expect(listener).toHaveBeenCalledWith({ type: "tasks-changed" });
  });

  it("publishes tasks-changed after a task is deleted", async () => {
    mockUsers(adminUser);
    prismaMock.task.delete.mockResolvedValue(taskRow());
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    const res = await api()
      .delete("/api/tasks/task-1")
      .set("Authorization", await bearer(adminUser));
    unsubscribe();

    expect(res.status).toBe(204);
    expect(listener).toHaveBeenCalledWith({ type: "tasks-changed" });
  });

  it("publishes nothing when a request is rejected", async () => {
    mockUsers(employeeUser);
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    const res = await api()
      .post("/api/tasks")
      .set("Authorization", await bearer(employeeUser))
      .send(validTaskBody);
    unsubscribe();

    expect(res.status).toBe(403);
    expect(listener).not.toHaveBeenCalled();
  });
});
