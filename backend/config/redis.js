const redis = require('redis');

let isConnected = false;

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 2) {
        return new Error('Max retries reached');
      }
      return 1000;
    }
  }
});

let errorLogged = false;
client.on('error', (err) => {
  if (!errorLogged) {
    console.warn('⚠️ Could not connect to Redis. Running without cache.');
    errorLogged = true;
  }
  isConnected = false;
});

client.on('connect', () => {
  console.log('Connected to Redis');
  isConnected = true;
});

const connectRedis = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
  } catch (error) {
    console.warn('⚠️ Could not connect to Redis. Running without cache.');
  }
};

connectRedis();

const cacheMiddleware = (keyPrefix, ttlSeconds = 3600) => async (req, res, next) => {
  if (!isConnected) return next();

  const key = `${keyPrefix}:${req.originalUrl || req.url}`;
  
  try {
    const cachedData = await client.get(key);
    if (cachedData) {
      console.log(`[Cache Hit] ${key}`);
      return res.json(JSON.parse(cachedData));
    }
    
    console.log(`[Cache Miss] ${key}`);
    // Intercept res.json to cache it
    const originalJson = res.json;
    res.json = (body) => {
      // Only cache success responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        client.setEx(key, ttlSeconds, JSON.stringify(body)).catch(err => console.error('Cache set error:', err));
      }
      originalJson.call(res, body);
    };
    next();
  } catch (error) {
    console.error('Cache middleware error:', error);
    next();
  }
};

module.exports = { client, cacheMiddleware, isConnected };
