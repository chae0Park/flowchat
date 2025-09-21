import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('⚠️ Redis disconnected');
      this.isConnected = false;
    });
  }

  async connect() {
    try {
      if (!this.isConnected) {
        await this.client.connect();
      }
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
      }
    } catch (error) {
      console.error('❌ Redis disconnection failed:', error);
    }
  }

  getClient() {
    return this.client;
  }

  // Cache methods
  async set(key: string, value: string, expireInSeconds?: number) {
    try {
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      throw error;
    }
  }

  async del(key: string) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      throw error;
    }
  }

  // Session management
  async setSession(sessionId: string, data: any, expireInSeconds: number = 86400) {
    await this.set(`session:${sessionId}`, JSON.stringify(data), expireInSeconds);
  }

  async getSession(sessionId: string) {
    const data = await this.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string) {
    await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async incrementRateLimit(key: string, windowInSeconds: number): Promise<number> {
    try {
      const current = await this.client.incr(`rate_limit:${key}`);
      if (current === 1) {
        await this.client.expire(`rate_limit:${key}`, windowInSeconds);
      }
      return current;
    } catch (error) {
      console.error('Redis rate limit error:', error);
      throw error;
    }
  }

  // Pub/Sub for real-time features
  async publish(channel: string, message: string) {
    try {
      await this.client.publish(channel, message);
    } catch (error) {
      console.error('Redis PUBLISH error:', error);
      throw error;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(channel, callback);
      return subscriber;
    } catch (error) {
      console.error('Redis SUBSCRIBE error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.client.ping();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: (error as Error).message, timestamp: new Date().toISOString() };
    }
  }
}

// Export singleton instance
export const redis = new RedisService();