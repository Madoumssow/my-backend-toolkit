import { Request, Response, NextFunction } from "express";

// Interface universelle compatible avec node-redis et ioredis
export interface CacheClient {
    get(Key: string): Promise<string | null>;
    setEx(Key: string, seconds: number, value: string): Promise<any>;
    del(Keys: string | string[]): Promise<any>;
}

// 1. Middleware de lecture/écriture automatique du cache sur les routes GET
export function cacheMiddleware(client: CacheClient, ttlSeconds = 60, KeyPrefix = "api_cache") {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // On ne met en cache que les requêtes de lecture GET
        if (req.method !== "GET") {
            next();
            return;
        }

        const cacheKey = `${KeyPrefix}:${req.originalUrl}`;

        try {
            const cachedData = await client.get(cacheKey);
            if (cachedData) {
                res.setHeader("X-Cache", "HIT");
                res.status(200).json(JSON.parse(cachedData));
                return;
            }

            // Si absent du cache (MISS), on intercepte res.json pour sauvegarder la réponse
            res.setHeader("X-Cache", "MISS");
            const originalJson = res.json.bind(res);

            res.json = (body: any): Response => {
                // On ne met en cache que les réponses HTTP réussies (2xx)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    client.setEx(cacheKey, ttlSeconds, JSON.stringify(body)).catch(() => {
                        // On ignore silencieusement une erreur d'écriture Redis pour ne pas bloquer le client
                    });
                }
                return originalJson(body);
            };
            
            next();
        } catch (error) {
            // Si Redis tombe en panne, l'API continue de fonctionner normalement via la BDD (Fail-Open)
            next();
        }
    };
}

// 2. Utilitaire d'invalidation du cache lors d'un POST, PUT ou DELETE
export async function invalidateCacheKeys(
    client: CacheClient,
    routes: string[],
    KeyPrefix = "api_cache"
): Promise<void> {
    if (routes.length === 0) return;
    const fullKeys = routes.map((route) => `${KeyPrefix}:${route}`);
    await client.del(fullKeys);
}