# Module 05 : Authentification JWT & RBAC (`auth.service.ts` / `auth.middleware.ts`)

## Dépendances requises
- `npm install jsonwebtoken bcryptjs`
- `npm install -D @types/jsonwebtoken @types/bcryptjs`

## Comment l'adapter en entreprise
1. Instancier `AuthService` une seule fois dans un fichier d'initialisation en lui passant les secrets validés via `env.config.ts` (Module 01).
2. Créer le middleware `const authenticate = createAuthMiddleware(authService);`.
3. Protéger les routes privées avec `authenticate`, et ajouter `authorizeRoles('admin', 'manager')` sur les routes sensibles.
4. En production, stocker idéalement le `refreshToken` dans un cookie **HttpOnly + Secure** plutôt que dans le `localStorage` du navigateur.

## Pièges à éviter
- **Ne jamais utiliser le même secret** pour `accessSecret` et `refreshSecret`.
- **Ne jamais mettre de données sensibles** (comme le mot de passe) dans le payload du JWT : un JWT est signé, pas chiffré (n'importe qui peut décoder son contenu en Base64).
