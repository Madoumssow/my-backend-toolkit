export interface AmqpMessage {
    content: Buffer;
}

export interface AmqpChannel {
    assertQueue(queue: string, options?: { durable?: boolean }): Promise<any>;
    sendToQueue(queue: string, content: Buffer, options?: { persistent?: boolean }): boolean;
    consume(queue: string, onMessage: (msg: AmqpMessage | null) => void): Promise<any>;
    ack(message: AmqpMessage): void;
    nack(message: AmqpMessage, allUpTo?: boolean, requeue?: boolean): void;
}

export class RabbitMQService {
    constructor(private readonly channel: AmqpChannel) {}

    // 1. Producteur (Publisher) : publie un événement JSON persistant dans une file
    async publishMessage<T>(queueName: string, payload: T): Promise<boolean> {
        await this.channel.assertQueue(queueName, { durable: true });
        const buffer = Buffer.from(JSON.stringify(payload));
        return this.channel.sendToQueue(queueName, buffer, { persistent: true });
    }

     // 2. Consommateur (Consumer) : écoute la file, exécute le traitement et acquitte (ack/nack)
    async consumeMessages<T>(queueName: string,
        handler: (data: T) => Promise<void>,
        requeueOnError = false
    ): Promise<void> {
        await this.channel.assertQueue(queueName, { durable: true });

        await this.channel.consume(queueName, async (msg) => {
            if (!msg) return;

            try {
                const parsedData = JSON.parse(msg.content.toString()) as T;
                await handler(parsedData);
                // Confirme à RabbitMQ que le message a bien été traité et peut être supprimé
                this.channel.ack(msg);
            } catch {
                // Signale l'échec (requeueOnError = false évite les boucles infinies si le message est corrompu)
                this.channel.nack(msg, false, requeueOnError);
            }
        });
    }
}