# Module 10 : DevOps, Webhooks Sécurisés & Déploiement

## Dépendances requises
- Aucune dépendance externe pour le webhook (utilise le module natif `node:crypto`).

## Comment l'adapter en entreprise
1. **Sécuriser une route Webhook (Stripe, PayTech, Wave, Orange Money, GitHub)** :
   ```ts
   app.post(
     '/api/webhooks/provider',
     express.raw({ type: 'application/json' }),
     verifyHmacWebhook({ secret: env.WEBHOOK_SECRET, signatureHeader: 'x-hub-signature-256' }),
     webhookController
   );
   ```
2. **Démarrer toute la stack backend en local avec Docker** :
   `docker compose -f 10-devops-webhooks-deploy/docker-compose.yml up -d --build`

## Pièges à éviter
- **Capturer le `rawBody` en production** : Certains fournisseurs (comme Stripe) signent les octets bruts exacts de la requête avant tout re-formatage JSON. Utilisez `express.json({ verify: (req, _res, buf) => { (req as any).rawBody = buf; } })` dans votre serveur principal.
- **Ne jamais exécuter Docker en tant que `root`** : L'instruction `USER appuser` du `Dockerfile` protège le serveur hôte en cas de faille applicative.
