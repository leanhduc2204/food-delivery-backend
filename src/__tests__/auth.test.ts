import request from "supertest";
import app from "../app";

describe("Auth", () => {
  const unique = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  it("POST /api/auth/register creates user and returns accessToken + refreshToken", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send({
        email: unique,
        password: "password123",
        name: "Test User",
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", unique);
    expect(res.body.user).not.toHaveProperty("passwordHash");
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body).toHaveProperty("expiresIn");
  });

  it("POST /api/auth/login returns 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nonexistent@example.com", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("POST /api/auth/login returns accessToken + refreshToken for valid user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send({ email: unique, password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body).toHaveProperty("user");
  });
});
