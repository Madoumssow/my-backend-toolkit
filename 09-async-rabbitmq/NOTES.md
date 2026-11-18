# Module 09 : Messagerie Asynchrone RabbitMQ (`rabbitmq.client.ts`)

## Dépendances requises
- `npm install amqplib`
- `npm install -D @types/amqplib`

## Comment l'adapter en entreprise
1. Établir la connexion au démarrage :
   ```ts
   const connection = await amqplib.connect(env.RABBITMQ_URL);
   const channel = await connection.createChannel();
   const rabbitService = new RabbitMQService(channel);
   ```
2. **Côté API (Producteur)** : Appeler `await rabbitService.publishMessage('send_email', { userId, template })` après une action utilisateur.
3. **Côté Worker (Consommateur)** : Appeler `await rabbitService.consumeMessages('send_email', async (data) => { ... })`.

## Pièges à éviter
- **Toujours activer `durable: true` et `persistent: true`** : Sans ces deux options, si le serveur RabbitMQ redémarre, tous les messages en attente dans la file sont perdus.
- **Attention à `requeue: true`** : Si un message contient une donnée invalide et que vous le remettez en file (`requeue: true`), le worker va le retraiter en boucle infinie. Préférez `requeueOnError = false` couplé à une *Dead Letter Queue* (DLQ).
