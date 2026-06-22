import { createClient } from 'redis';

// Create Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

let isConnected = false;

// Connect to Redis
export const connectRedis = async () => {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Redis connection failed, falling back to database:', error.message);
    }
  }
};

// Middleware to check cache
export const cacheMiddleware = (options = { ttl: 3600 }) => {
  return async (req, res, next) => {
    if (!isConnected) {
      return next(); // Fallback to DB if Redis is unavailable
    }

    try {
      // Generate a deterministic cache key based on URL and query params
      const key = `cache:${req.baseUrl || ''}${req.path}?${new URLSearchParams(req.query).toString()}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        // Return cached response immediately
        const parsed = JSON.parse(cachedData);
        return res.status(200).json(parsed);
      }

      // If not in cache, patch res.json to intercept and cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, options.ttl, JSON.stringify(body)).catch(err => {
            console.error('Redis setEx error:', err.message);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      next(); // Graceful fallback
    }
  };
};

// Utility to clear cache keys matching a pattern
export const clearCache = async (pattern = 'cache:*') => {
  if (!isConnected) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Error clearing cache:', error.message);
  }
};

export default redisClient;
