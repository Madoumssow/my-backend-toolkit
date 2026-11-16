# Module 03 : Validation des requêtes (`validate.middleware.ts`)

## Dépendances requises
- `npm install express zod`
- `npm install -D @types/express supertest @types/supertest`

## Comment l'adapter en entreprise
1. Créer un dossier `schemas/` dans chaque module métier (ex: `user.schema.ts`).
2. Définir un objet contenant `body`, `query` et/ou `params` avec Zod.
3. Placer `validateRequest(monSchema)` en middleware juste avant le contrôleur dans le fichier de routes.
4. Si l'entreprise utilise déjà `AppError` (Module 02), vous pouvez remplacer `res.status(400).json(...)` par une classe `ValidationError` héritant d'`AppError`.

## Pièges à éviter
- **Toujours activer `app.use(express.json())`** : Sans ce middleware natif d'Express, `req.body` sera `undefined` et Zod rejettera toutes les requêtes POST/PUT.
- **Attention aux `req.query`** : Dans les URL (`?page=2`), toutes les valeurs arrivent sous forme de `string`. Utilisez `z.coerce.number()` dans vos schémas de `query` pour convertir automatiquement `'2'` en `2`.
