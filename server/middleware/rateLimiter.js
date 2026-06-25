import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import Redis from "ioredis";
import { RedisStore } from "rate-limit-redis";

// Key generator supporting IP + user-based limiting
const keyGenerator = (req) => {
  // If user is authenticated via authMiddleware
  if (req.user && req.user._id) {
    return `user:${req.user._id}`;
  }

  // Fallback: manually parse and verify JWT if authorization header is present
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id) {
          return `user:${decoded.id}`;
        }
      }
    } catch (err) {
      // Invalid/expired token, let it fall through to IP
    }
  }

  // Fallback to IP address (express-rate-limit automatically respects 'trust proxy' setting)
  return `ip:${req.ip}`;
};

// Custom response handler to set Retry-After header and return structured JSON
const handler = (req, res, next, options) => {
  const retryAfter = Math.ceil(options.windowMs / 1000);
  res.set("Retry-After", String(retryAfter));
  res.status(429).json({
    success: false,
    message: options.message || "Too many requests. Please try again later.",
    retryAfter,
  });
};

// Initialize Redis store if REDIS_URL is provided
let redisClient = null;
let store = undefined;
let isRedisConnected = false;

if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      console.warn("⚠️ Redis client connection error for rate limiter:", err.message);
      isRedisConnected = false;
    });

    redisClient.on("connect", () => {
      console.log("🚀 Connected to Redis successfully for rate limiting.");
      isRedisConnected = true;
    });

    redisClient.connect().catch((err) => {
      console.warn("⚠️ Could not connect to Redis at startup, using in-memory fallback:", err.message);
      isRedisConnected = false;
    });

    store = new RedisStore({
      // Wrap sendCommand to transparently catch errors or disconnected status
      sendCommand: async (...args) => {
        if (!isRedisConnected || redisClient.status !== "ready") {
          throw new Error("Redis client is not ready");
        }
        return redisClient.call(...args);
      },
    });
  } catch (error) {
    console.error("❌ Failed to initialize Redis store for rate limiter:", error);
  }
}

// Preset helper creator
const createLimiterPreset = (windowMs, limit, message) => {
  if (process.env.NODE_ENV === "test" && process.env.RATE_LIMIT_TESTING !== "true") {
    return (req, res, next) => next();
  }

  const limiter = rateLimit({
    windowMs,
    limit,
    message,
    keyGenerator,
    handler,
    standardHeaders: true, // Return standard RateLimit-* headers
    legacyHeaders: true, // Return legacy X-RateLimit-* headers
    store, // Will fall back to in-memory store if store is undefined
    validate: { keyGeneratorIpFallback: false },
  });

  // Wrap rate limiter middleware to gracefully handle any store/Redis errors
  // so that if Redis goes down, we log the error and proceed to the next middleware (high availability).
  return (req, res, next) => {
    limiter(req, res, (err) => {
      if (err) {
        console.warn("⚠️ Rate limiter store error, letting request pass through:", err.message);
        return next();
      }
      next();
    });
  };
};

// Tiers:
// 1. Auth (login, register) - 5 requests / 15 minutes
export const authLimiter = createLimiterPreset(
  15 * 60 * 1000,
  5,
  "Too many authentication attempts. Please try again after 15 minutes."
);

// 2. Booking operations - 20 requests / 1 minute
export const bookingLimiter = createLimiterPreset(
  1 * 60 * 1000,
  20,
  "Too many booking operations. Please try again after a minute."
);

// 3. Admin endpoints - 50 requests / 1 minute
export const adminLimiter = createLimiterPreset(
  1 * 60 * 1000,
  50,
  "Too many admin requests. Please try again after a minute."
);

// 4. General API - 100 requests / 1 minute
export const generalLimiter = createLimiterPreset(
  1 * 60 * 1000,
  100,
  "Too many requests. Please try again after a minute."
);

// 5. Password reset attempts - 3 requests / 15 minutes
export const resetLimiter = createLimiterPreset(
  15 * 60 * 1000,
  3,
  "Too many password reset attempts. Please try again after 15 minutes."
);
