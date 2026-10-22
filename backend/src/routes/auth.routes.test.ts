import { hashSync } from "bcryptjs";
import { describe, expect, it } from "vitest";
import { api, bearer, employeeUser, mockUsers } from "../test/helpers.js";
import { prismaMock } from "../test/prismaMock.js";

const PASSWORD = "secret123";

describe("auth routes", () => {
  it("login without a body returns 400", async () => {
    const res = await api().post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe("Email and password are required");
  });

  it("login with an unknown email returns 401", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await api()
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Invalid email or password");
  });

  it("login with a wrong password returns 401", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...employeeUser,
      passwordHash: hashSync(PASSWORD, 4),
    });

    const res = await api()
      .post("/api/auth/login")
      .send({ email: employeeUser.email, password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("login with valid credentials returns a token and the user", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...employeeUser,
      passwordHash: hashSync(PASSWORD, 4),
    });

    const res = await api()
      .post("/api/auth/login")
      .send({ email: employeeUser.email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user).toEqual(employeeUser);
  });

  it("GET /api/auth/me returns the signed-in user", async () => {
    mockUsers(employeeUser);

    const res = await api()
      .get("/api/auth/me")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual(employeeUser);
  });

  it("GET /api/auth/me without a token returns 401", async () => {
    const res = await api().get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me with a fake token returns 401", async () => {
    const res = await api()
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe("Invalid or expired token");
  });

  it("GET /api/auth/me for a user deleted from the database returns 401", async () => {
    mockUsers();

    const res = await api()
      .get("/api/auth/me")
      .set("Authorization", await bearer(employeeUser));

    expect(res.status).toBe(401);
  });
});
