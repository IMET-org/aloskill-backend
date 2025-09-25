import { Redis } from 'ioredis';
import "dotenv/config";

const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  // tls: {}, // ✅ required for Redis Cloud SSL - commented out for local Redis
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
console.log(process.env.REDIS_HOST, process.env.REDIS_PORT);
redisConnection.on('connect', () => {
  console.log('✅ Connected to Redis Cloud');
});

redisConnection.on('error', err => {
  console.error('❌ Redis connection error:', err);
});

export default redisConnection;
