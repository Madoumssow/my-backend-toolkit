# Module 04 : Logs structurés & Observabilité (`logger.service.ts`)

## Dépendances requises
- `npm install pino`
- `npm install -D pino-pretty`

## Comment l'adapter en entreprise
1. Importer `logger` à la place de `console.log` et `console.error`.
2. Toujours passer l'objet de contexte en **premier argument** et le message texte en **second argument** :
   `logger.info({ userId: 42, orderId: 'CMD-01' }, 'Commande validée');`
3. Pour tracer chaque requête HTTP automatiquement, ajouter `npm install pino-http` et enregistrer `app.use(pinoHttp({ logger }))` avant vos routes.

## Pièges à éviter
- **Ne jamais utiliser `pino-pretty` en production** : Le formatage visuel ralentit fortement le serveur. Notre condition `isProd` le désactive automatiquement.
- **Compléter la liste `redact`** : Si l'entreprise manipule des données spécifiques (numéro de carte, clé API), ajoutez leurs chemins dans `redact.paths`.
