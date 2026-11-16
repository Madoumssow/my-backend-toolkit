# Module 01 : Validation de l'environnement (`env.config.ts`)

## Dépendances requises
- `npm install zod dotenv`

## Comment l'adapter en entreprise
1. Ouvrir le fichier `.env.example` de l'entreprise.
2. Ajouter ou retirer les clés dans `envSchema` pour correspondre exactement aux besoins du projet (ex: `REDIS_URL`, `AWS_BUCKET_NAME`).
3. Importer `env` tout en haut du fichier d'entrée (`main.ts` ou `server.ts`) avant la connexion aux bases de données.

## Pièges à éviter
- **Toujours convertir les nombres** : `process.env` renvoie uniquement des chaînes de caractères (`string`). Utiliser `.transform()` de Zod pour convertir `PORT` ou les durées d'expiration.
- **Ne jamais logguer `env` en production** : Contient des secrets critiques (`JWT_SECRET`, mots de passe BDD).
