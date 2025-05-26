import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';

// Redis-Client für das Caching
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Standard-Cache-Zeit in Sekunden
const DEFAULT_CACHE_TIME = 300; // 5 Minuten

// Cache-Middleware
export const cache = (duration: number = DEFAULT_CACHE_TIME) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Nur GET-Anfragen cachen
    if (req.method !== 'GET') {
      return next();
    }

    // Cache-Key aus URL und Query-Parametern erstellen
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Versuche, Daten aus dem Cache zu lesen
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        // Wenn Daten im Cache gefunden wurden, sende sie zurück
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      // Wenn keine Daten im Cache gefunden wurden, speichere die Antwort
      const originalJson = res.json;
      res.json = function(body: any) {
        redis.setex(key, duration, JSON.stringify(body));
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache-Fehler:', error);
      next();
    }
  };
};

// Cache für spezifische Routen
export const routeCache = (route: string, duration: number = DEFAULT_CACHE_TIME) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.path !== route) {
      return next();
    }

    const key = `cache:${route}`;

    try {
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      const originalJson = res.json;
      res.json = function(body: any) {
        redis.setex(key, duration, JSON.stringify(body));
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Route-Cache-Fehler:', error);
      next();
    }
  };
};

// Cache für Datenbankabfragen
export const queryCache = (duration: number = DEFAULT_CACHE_TIME) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:query:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      const originalJson = res.json;
      res.json = function(body: any) {
        redis.setex(key, duration, JSON.stringify(body));
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Query-Cache-Fehler:', error);
      next();
    }
  };
};

// Cache invalidieren
export const invalidateCache = async (pattern: string) => {
  try {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache-Invalidierungsfehler:', error);
  }
};

// Cache für spezifische Daten
export const dataCache = {
  set: async (key: string, data: any, duration: number = DEFAULT_CACHE_TIME) => {
    try {
      await redis.setex(`cache:data:${key}`, duration, JSON.stringify(data));
    } catch (error) {
      console.error('Data-Cache-Set-Fehler:', error);
    }
  },

  get: async (key: string) => {
    try {
      const data = await redis.get(`cache:data:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Data-Cache-Get-Fehler:', error);
      return null;
    }
  },

  delete: async (key: string) => {
    try {
      await redis.del(`cache:data:${key}`);
    } catch (error) {
      console.error('Data-Cache-Delete-Fehler:', error);
    }
  }
};

// Cache-Statistiken
export const cacheStats = async () => {
  try {
    const keys = await redis.keys('cache:*');
    const stats = {
      totalKeys: keys.length,
      memoryUsage: await redis.info('memory'),
      hitRate: await redis.info('stats')
    };
    return stats;
  } catch (error) {
    console.error('Cache-Stats-Fehler:', error);
    return null;
  }
};

// Fehlerbehandlung für Redis-Verbindung
redis.on('error', (error) => {
  console.error('Redis-Verbindungsfehler:', error);
  // Fallback auf In-Memory-Speicher wenn Redis nicht verfügbar
  process.env.USE_MEMORY_STORE = 'true';
});

export default {
  cache,
  routeCache,
  queryCache,
  invalidateCache,
  dataCache,
  cacheStats
}; 