import { describe, expect, it } from "vitest";
import {
  adminUser,
  api,
  bearer,
  employeeUser,
  mockUsers,
} from "../test/helpers.js";
import { prismaMock } from "../test/prismaMock.js";

const validUserBody = {
  name: "New Hire",
  email: "new.hire@example.com",
  password: "password123",
  role: "Employee",
  jobTitle: "Analyst",
  department: "",
};

describe("users routes", () => {
  it("GET /api/users requires a token", async () => {
    const res = await api().get("/api/users");

    expect(res.status).toBe(401);
  });

  it("GET /api/users lets any signed-in user list employees", async () => {
    mockUsers(employeeUser);
    prismaMock.user.findMany.mockResolvedValue([{ id: "u1", name: "A" }]);

    const res = await api()
      .get("/api/users")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(200);
    expect(res.body.users).toEqual([{ id: "u1", name: "A" }]);
  });

  it("POST /api/users as Employee returns 403", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .post("/api/users")
      .set("Authorization", await bearer(employeeUser))
      .send(validUserBody);

    expect(res.status).toBe(403);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("POST /api/users as Admin creates the user with a hashed password", async () => {
    mockUsers(adminUser);
    prismaMock.user.create.mockResolvedValue({ id: "u2", name: "New Hire" });

    const res = await api()
      .post("/api/users")
      .set("Authorization", await bearer(adminUser))
      .send(validUserBody);

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: "u2", name: "New Hire" });

    const { data } = prismaMock.user.create.mock.calls[0][0];
    expect(data.email).toBe("new.hire@example.com");
    expect(data.passwordHash).not.toBe("password123");
    expect(data).not.toHaveProperty("password");
  });

  it("POST /api/users with invalid input returns 400 with details", async () => {
    mockUsers(adminUser);

    const res = await api()
      .post("/api/users")
      .set("Authorization", await bearer(adminUser))
      .send({ ...validUserBody, jobTitle: "", password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.error.details.jobTitle).toBe("Job title is required.");
    expect(res.body.error.details.password).toBe(
      "Password must be at least 8 characters.",
    );
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("POST /api/users with a duplicate email returns 409", async () => {
    mockUsers(adminUser);
    prismaMock.user.create.mockRejectedValue({ code: "P2002" });

    const res = await api()
      .post("/api/users")
      .set("Authorization", await bearer(adminUser))
      .send(validUserBody);

    expect(res.status).toBe(409);
    expect(res.body.error.details.email).toBe(
      "Another employee already uses this email.",
    );
  });

  it("PUT /api/users/:id for an unknown employee returns 404", async () => {
    mockUsers(adminUser);
    prismaMock.user.update.mockRejectedValue({ code: "P2025" });
    const { password: _password, ...updateBody } = validUserBody;

    const res = await api()
      .put("/api/users/missing")
      .set("Authorization", await bearer(adminUser))
      .send(updateBody);

    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe("Employee not found");
  });
});
