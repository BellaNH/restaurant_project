import request from "supertest";
import app from "../app.js";

describe("Health check", () => {
  it("should return API Working", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("API Working");
  });
});







