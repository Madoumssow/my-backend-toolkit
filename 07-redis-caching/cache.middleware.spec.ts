import express from "express";
import request from "supertest";
import { CacheClient, cacheMiddleware, invalidateCacheKeys } from "./cache.middleware";

describe("07-redis-caching : Middleware de mise en cache & invalidation", () => {
    // Simulation d'un client Redis en mémoire pour des tests rapides et isolés
    const createMockRedis = (): CacheClient & { store: Map<string, string> } => {
        const store = new Map<string, string>();
        return {
            store,
            get: jest.fn(async (Key: string) => store.get(Key) ?? null),
            setEx: jest.fn(async (Key: string, _ttl: number, value: string) => {
                store.set(Key, value);
            }),
            del: jest.fn(async (Keys: string | string[]) => {
                const list = Array.isArray(Keys) ? Keys : [Keys];
                list.forEach((K) => store.delete(K));
            }),
        };
    };

    it("doit renvoyer MISS au premier appel puis HIT depuis Redis au second appel", async () => {
        const mockRedis = createMockRedis();
        let dbCallsCount = 0;

        const app = express();
        app.get("/products", cacheMiddleware(mockRedis, 120), (_req, res) => {
            dbCallsCount++;
            res.status(200).json({ items: ["Laptop", "Clavier"] });
        });

        // 1er appel : interroge le contrôleur (MISS)
        const res1 = await request(app).get("/products");
        expect(res1.status).toBe(200);
        expect(res1.headers["x-cache"]).toBe("MISS");
        expect(dbCallsCount).toBe(1);

        // 2e appel : servi directement par Redis sans toucher au contrôleur (HIT)
        const res2 = await request(app).get("/products");
        expect(res2.status).toBe(200);
        expect(res2.headers["x-cache"]).toBe("HIT");
        expect(res2.body).toEqual({ items: ["Laptop", "Clavier"] });
        expect(dbCallsCount).toBe(1); // Le contrôleur n'a pas été rappelé !
    });
    
    it("doit invalider les clés en cache aprés une mise à jour", async () => {
        const mockRedis = createMockRedis();
        mockRedis.store.set("api_cache:/products", JSON.stringify({ items: ["Ancien"] }));

        await invalidateCacheKeys(mockRedis, ["/products"]);

        expect(mockRedis.store.has("api_cache:/products")).toBe(false);
    });

});