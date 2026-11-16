# Module 02 : Gestion globale des erreurs (`error.middleware.ts`)

## Dépendances requises
- `npm install express`
- `npm install -D @types/express supertest @types/supertest`

## Comment l'adapter en entreprise
1. **Dans les services / contrôleurs** : Remplacer `res.status(404).json(...)` par `throw new AppError('Message clair', 404)`.
2. **Sur les routes asynchrones** : Entourer le contrôleur avec `asyncHandler(monControleur)`.
3. **Dans `app.ts` / `server.ts`** : Enregistrer `app.use(globalErrorHandler)` **tout à la fin**, après la déclaration de toutes les routes.
4. **Enrichissement possible** : Ajouter dans `globalErrorHandler` la détection des erreurs spécifiques de l'ORM de l'entreprise (ex: erreur Prisma `P2002` pour un doublon -> statut `409 Conflict`).

## Pièges à éviter
- **Ordre des middlewares Express** : Si `globalErrorHandler` est placé avant vos routes, il ne capturera aucune erreur.
- **Ne jamais retirer le 4e paramètre `_next`** : Express reconnaît un middleware d'erreur uniquement parce que sa signature possède exactement **4 arguments** `(err, req, res, next)`.
