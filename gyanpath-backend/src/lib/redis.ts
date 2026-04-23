import Redis from 'ioredis';
import { config } from '../config';

let redisInstance: Redis | null = null;

/**
 * Get Redis client
 */
export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(config.redis.url, {
      password: config.redis.password,
      retryStrategy: (times) => {
        if (times > 10) {
          return null; // Stop retrying after 10 attempts
        }
        return Math.min(times * 100, 3000);
      },
    });

    redisInstance.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  return redisInstance;
}

export default getRedis;
