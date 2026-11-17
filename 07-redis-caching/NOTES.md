# Module 07 : Cache Redis & Invalidation (`cache.middleware.ts`)

## Dépendances requises
- `npm install redis` (ou `ioredis`)

## Comment l'adapter en entreprise
1. Connecter le client officiel Redis au démarrage de l'application (`const redisClient = createClient({ url: env.REDIS_URL }); await redisClient.connect();`).
2. Ajouter `cacheMiddleware(redisClient, 300)` sur les routes `GET` coûteuses en base de données (ex: catalogues, statistiques, listes publiques).
3. Dans vos contrôleurs `POST`, `PUT` ou `DELETE`, appeler `await invalidateCacheKeys(redisClient, ['/api/products'])` juste après la sauvegarde en base de données.

## Pièges à éviter
- **Ne jamais mettre en cache des données privées** (comme `/api/profile`) avec une clé basée uniquement sur l'URL, sinon un utilisateur pourrait recevoir les données d'un autre ! Pour du cache par utilisateur, incluez `${req.user.userId}` dans la clé.
- **Stratégie Fail-Open** : Notre middleware capture les erreurs Redis et appelle `next()`. Ainsi, même si le serveur Redis redémarre, votre API reste en ligne.
