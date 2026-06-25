import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { cacheMiddleware, clearCache, connectRedis } from '../utils/cache.js';

// Mock Redis Client methods
const { mockGet, mockSetEx, mockKeys, mockDel, mockConnect, mockOn } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockSetEx: vi.fn(),
  mockKeys: vi.fn(),
  mockDel: vi.fn(),
  mockConnect: vi.fn(),
  mockOn: vi.fn(),
}));

vi.mock('redis', () => ({
  createClient: () => ({
    get: mockGet,
    setEx: mockSetEx,
    keys: mockKeys,
    del: mockDel,
    connect: mockConnect,
    on: mockOn,
  }),
}));

describe('Redis Cache Middleware', () => {
  let app;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    
    // Simulate active connection
    mockConnect.mockResolvedValue();
    await connectRedis();

    app.get('/api/test', cacheMiddleware({ ttl: 60 }), (req, res) => {
      res.status(200).json({ data: 'fresh data' });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return fresh data and cache it on cache miss', async () => {
    mockGet.mockResolvedValue(null);
    mockSetEx.mockResolvedValue('OK');

    const response = await request(app).get('/api/test?query=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: 'fresh data' });
    expect(mockGet).toHaveBeenCalledWith('cache:/api/test?query=1');
    expect(mockSetEx).toHaveBeenCalledWith('cache:/api/test?query=1', 60, JSON.stringify({ data: 'fresh data' }));
  });

  it('should return cached data on cache hit', async () => {
    const cachedData = { data: 'cached data' };
    mockGet.mockResolvedValue(JSON.stringify(cachedData));

    const response = await request(app).get('/api/test?query=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(cachedData);
    expect(mockGet).toHaveBeenCalledWith('cache:/api/test?query=1');
    expect(mockSetEx).not.toHaveBeenCalled();
  });

  it('should bypass cache and fallback to DB on Redis error', async () => {
    mockGet.mockRejectedValue(new Error('Redis Down'));

    const response = await request(app).get('/api/test?query=1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: 'fresh data' });
    expect(mockGet).toHaveBeenCalled();
  });

  it('should generate deterministic cache keys', async () => {
    mockGet.mockResolvedValue(null);

    await request(app).get('/api/test?filter=location&sort=asc');

    expect(mockGet).toHaveBeenCalledWith('cache:/api/test?filter=location&sort=asc');
  });

  it('should clear cache on clearCache call', async () => {
    mockKeys.mockResolvedValue(['cache:1', 'cache:2']);
    mockDel.mockResolvedValue(2);

    await clearCache('cache:*');

    expect(mockKeys).toHaveBeenCalledWith('cache:*');
    expect(mockDel).toHaveBeenCalledWith(['cache:1', 'cache:2']);
  });
});
