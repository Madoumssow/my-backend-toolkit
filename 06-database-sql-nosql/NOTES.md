# Module 06 : Bases de données SQL & NoSQL (`sql.transaction.ts` / `mongo.connection.ts`)

## Dépendances requises
- Pour MongoDB : `npm install mongoose`
- Pour MySQL : `npm install mysql2`
- Pour PostgreSQL : `npm install pg` et `npm install -D @types/pg`

## Comment l'adapter en entreprise
1. **Pour MySQL (`mysql2/promise`)** : Créez votre pool avec `const pool = mysql.createPool(...)` et passez-le directement à `withSqlTransaction(pool, async (conn) => { ... })`.
2. **Pour PostgreSQL (`pg`)** : Créez votre pool avec `const pool = new Pool(...)` et passez-le à la même fonction `withSqlTransaction`.
3. **Pour Prisma ORM** : Prisma possède déjà son propre `prisma.$transaction(async (tx) => { ... })` qui suit exactement la même logique.
4. **Pour MongoDB** : Appliquez `mongoose.plugin(cleanJsonPlugin)` globalement avant de déclarer vos modèles pour ne jamais exposer de mots de passe hashés par erreur dans vos API.

## Pièges à éviter
- **Toujours utiliser le client passé en paramètre (`client.query`)** à l'intérieur du callback de `withSqlTransaction`, et jamais `pool.query`, sinon la requête s'exécutera en dehors de la transaction.
