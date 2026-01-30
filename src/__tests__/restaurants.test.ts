import request from "supertest";
import app from "../app";

describe("Restaurants", () => {
  it("GET /api/restaurants returns 200 and paginated shape", async () => {
    const res = await request(app).get("/api/restaurants");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({
      page: expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
      totalPages: expect.any(Number),
      hasMore: expect.any(Boolean),
    });
  });

  it("GET /api/restaurants?page=1&limit=2 respects pagination", async () => {
    const res = await request(app).get("/api/restaurants?page=1&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(2);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });
});
