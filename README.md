# 🛠️ My Backend Toolkit (Node.js / TypeScript / NestJS)

Boîte à outils modulaire d'architecture backend prête pour la production. Chaque module est isolé, typé strictement en **TypeScript**, documenté (`NOTES.md`) et validé par des tests unitaires et d'intégration (**Jest / Supertest**).

## 🎯 Objectif du dépôt

Fournir des briques techniques réutilisables et éprouvées en entreprise pour démarrer rapidement une API sécurisée, observable et résiliente sans réinventer la roue :
- Validation stricte de la configuration et des entrées HTTP
- Gestion centralisée des erreurs et logs structurés RGPD-friendly
- Authentification JWT, hachage sécurisé et contrôle d'accès par rôles (RBAC)
- Transactions SQL atomiques, résilience NoSQL et cache Redis
- Architecture modulaire NestJS, files asynchrones RabbitMQ et Webhooks HMAC

---

## 📦 Catalogue des Modules

| # | Module | Stack & Outils | Rôle & Fonctionnalités clés |
| :- | :--- | :--- | :--- |
| **01** | [`01-config-env`](./01-config-env) | `Zod`, `dotenv` | Validation *Fail-Fast* des variables `.env` au démarrage et typage fort. |
| **02** | [`02-error-handling`](./02-error-handling) | `Express`, `AppError` | Classe d'erreur métier et middleware global masquant les stack traces en production. |
| **03** | [`03-request-validation`](./03-request-validation) | `Express`, `Zod` | Validation automatique de `body`, `query` et `params` avec erreurs structurées `400`. |
| **04** | [`04-logger-observability`](./04-logger-observability) | `Pino`, `pino-http` | Logs JSON haute performance et masquage automatique des secrets (`password`, `token`). |
| **05** | [`05-auth-jwt-rbac`](./05-auth-jwt-rbac) | `jsonwebtoken`, `bcryptjs` | Hachage de mots de passe, génération/vérification JWT et contrôle d'accès par rôles. |
| **06** | [`06-database-sql-nosql`](./06-database-sql-nosql) | `MySQL/PostgreSQL`, `Mongoose` | Wrapper transactionnel (`BEGIN`/`COMMIT`/`ROLLBACK`), retry MongoDB et nettoyage JSON. |
| **07** | [`07-redis-caching`](./07-redis-caching) | `Redis` | Middleware de cache automatique (`HIT`/`MISS`) sur routes `GET` et invalidation sur mutations. |
| **08** | [`08-nestjs-architecture`](./08-nestjs-architecture) | `NestJS`, `RxJS` | Décorateur `@Roles()`, `RolesGuard` et `TransformInterceptor` pour uniformiser les réponses. |
| **09** | [`09-async-rabbitmq`](./09-async-rabbitmq) | `RabbitMQ (AMQP)` | Client *Publisher/Consumer* persistant avec gestion explicite des acquittements (`ack`/`nack`). |
| **10** | [`10-devops-webhooks-deploy`](./10-devops-webhooks-deploy) | `node:crypto`, `Docker` | Vérification de signature Webhook HMAC-SHA256 (`timingSafeEqual`), `Dockerfile` multi-stage et `docker-compose.yml`. |

---

## 🚀 Installation & Exécution des Tests

```bash
# 1. Cloner le dépôt
git clone https://github.com
cd my-backend-toolkit

# 2. Installer les dépendances
npm install

# 3. Lancer l'ensemble de la suite de tests (10 modules)
npm test
```

---

## 📖 Comment réutiliser un module dans un projet

1. Copiez le dossier souhaité (ex. `05-auth-jwt-rbac/`) dans le répertoire `src/common/` de votre projet.
2. Consultez le fichier **`NOTES.md`** à l'intérieur du dossier pour installer les dépendances spécifiques et suivre les bonnes pratiques d'intégration.
