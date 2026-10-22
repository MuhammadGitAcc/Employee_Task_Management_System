import { describe, expect, it } from "vitest";
import { api, bearer, employeeUser, mockUsers } from "../test/helpers.js";
import { prismaMock } from "../test/prismaMock.js";

const commentRow = {
  id: "comment-1",
  taskId: "task-1",
  authorId: employeeUser.id,
  text: "Looks good",
  createdAt: new Date("2026-10-20T08:00:00.000Z"),
};

describe("comments and activity routes", () => {
  it("POST /api/tasks/:id/comments requires a token", async () => {
    const res = await api()
      .post("/api/tasks/task-1/comments")
      .send({ text: "Hello" });

    expect(res.status).toBe(401);
  });

  it("POST /api/tasks/:id/comments adds a trimmed comment", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findUnique.mockResolvedValue({ id: "task-1" });
    prismaMock.taskComment.create.mockResolvedValue(commentRow);

    const res = await api()
      .post("/api/tasks/task-1/comments")
      .set("Authorization", await bearer(employeeUser))
      .send({ text: "  Looks good  " });

    expect(res.status).toBe(201);
    expect(res.body.comment).toEqual({
      id: "comment-1",
      taskId: "task-1",
      authorId: employeeUser.id,
      author: employeeUser.name,
      text: "Looks good",
      createdAt: "2026-10-20T08:00:00.000Z",
    });
    expect(prismaMock.taskComment.create).toHaveBeenCalledWith({
      data: {
        taskId: "task-1",
        authorId: employeeUser.id,
        text: "Looks good",
      },
    });
  });

  it("POST /api/tasks/:id/comments with empty text returns 400", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .post("/api/tasks/task-1/comments")
      .set("Authorization", await bearer(employeeUser))
      .send({ text: "   " });

    expect(res.status).toBe(400);
    expect(res.body.error.details.text).toBe("Comment cannot be empty.");
    expect(prismaMock.taskComment.create).not.toHaveBeenCalled();
  });

  it("POST /api/tasks/:id/comments with text over 500 characters returns 400", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .post("/api/tasks/task-1/comments")
      .set("Authorization", await bearer(employeeUser))
      .send({ text: "a".repeat(501) });

    expect(res.status).toBe(400);
    expect(res.body.error.details.text).toBe(
      "Comment must be 500 characters or fewer.",
    );
  });

  it("POST /api/tasks/:id/comments for an unknown task returns 404", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findUnique.mockResolvedValue(null);

    const res = await api()
      .post("/api/tasks/missing/comments")
      .set("Authorization", await bearer(employeeUser))
      .send({ text: "Hello" });

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Task not found");
  });

  it("GET /api/tasks/:id/comments lists comments with author names", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findUnique.mockResolvedValue({ id: "task-1" });
    prismaMock.taskComment.findMany.mockResolvedValue([
      { ...commentRow, author: { name: employeeUser.name } },
    ]);

    const res = await api()
      .get("/api/tasks/task-1/comments")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].author).toBe(employeeUser.name);
  });

  it("GET /api/tasks/:id/activity lists activity with actor names", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findUnique.mockResolvedValue({ id: "task-1" });
    prismaMock.taskActivity.findMany.mockResolvedValue([
      {
        id: "activity-1",
        taskId: "task-1",
        actorId: employeeUser.id,
        message: "created this task",
        createdAt: new Date("2026-10-18T05:00:00.000Z"),
        actor: { name: employeeUser.name },
      },
    ]);

    const res = await api()
      .get("/api/tasks/task-1/activity")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(200);
    expect(res.body.activity).toEqual([
      {
        id: "activity-1",
        taskId: "task-1",
        actorId: employeeUser.id,
        actor: employeeUser.name,
        message: "created this task",
        createdAt: "2026-10-18T05:00:00.000Z",
      },
    ]);
  });

  it("GET /api/tasks/:id/activity for an unknown task returns 404", async () => {
    mockUsers(employeeUser);
    prismaMock.task.findUnique.mockResolvedValue(null);

    const res = await api()
      .get("/api/tasks/missing/activity")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(404);
  });
});
