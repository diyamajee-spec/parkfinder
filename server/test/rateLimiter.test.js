import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";

// Set up environment flags for rate limit testing
process.env.RATE_LIMIT_TESTING = "true";
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret-key-123456";
}

let authLimiter;
let bookingLimiter;
let generalLimiter;

beforeAll(async () => {
  const limiters = await import("../middleware/rateLimiter.js");
  authLimiter = limiters.authLimiter;
  bookingLimiter = limiters.bookingLimiter;
  generalLimiter = limiters.generalLimiter;
});

describe("Rate Limiting Middleware Integration Tests", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.set("trust proxy", 1);
    app.use(express.json());
  });

  it("should export correct rate limiting middleware functions", () => {
    expect(generalLimiter).toBeTypeOf("function");
    expect(authLimiter).toBeTypeOf("function");
    expect(bookingLimiter).toBeTypeOf("function");
  });

  it("should return rate limit headers on a successful request under the general limiter", async () => {
    app.get("/test", generalLimiter, (req, res) => {
      res.json({ success: true });
    });

    const response = await request(app).get("/test");
    expect(response.status).toBe(200);
    expect(response.headers).toHaveProperty("x-ratelimit-limit");
    expect(response.headers).toHaveProperty("x-ratelimit-remaining");
  });

  it("should return 429 and Retry-After header when rate limit is exceeded on auth route", async () => {
    // authLimiter has a limit of 5 requests / 15 minutes
    app.post("/auth/login", authLimiter, (req, res) => {
      res.json({ success: true });
    });

    // Send 5 successful requests
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/auth/login");
      expect(res.status).toBe(200);
    }

    // The 6th request must exceed the limit and receive 429
    const resBlocked = await request(app).post("/auth/login");
    expect(resBlocked.status).toBe(429);
    expect(resBlocked.body.success).toBe(false);
    expect(resBlocked.body.message).toContain("Too many authentication attempts");
    expect(resBlocked.headers).toHaveProperty("retry-after");
  });

  it("should isolate rate limits by user using their JWT user ID", async () => {
    // bookingLimiter has a limit of 20 requests / 1 minute
    app.post("/booking", bookingLimiter, (req, res) => {
      res.json({ success: true });
    });

    const user1Token = jwt.sign({ id: "user-123" }, process.env.JWT_SECRET);
    const user2Token = jwt.sign({ id: "user-456" }, process.env.JWT_SECRET);

    // Exceed limit for user 1 (20 requests)
    for (let i = 0; i < 20; i++) {
      const res = await request(app)
        .post("/booking")
        .set("Authorization", `Bearer ${user1Token}`);
      expect(res.status).toBe(200);
    }

    // 21st request for user 1 should be blocked
    const resBlockedUser1 = await request(app)
      .post("/booking")
      .set("Authorization", `Bearer ${user1Token}`);
    expect(resBlockedUser1.status).toBe(429);

    // Request from user 2 should still succeed since limits are isolated
    const resSucceedUser2 = await request(app)
      .post("/booking")
      .set("Authorization", `Bearer ${user2Token}`);
    expect(resSucceedUser2.status).toBe(200);
  });
});
