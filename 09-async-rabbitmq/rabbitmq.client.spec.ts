import { Subject } from "rxjs";
import { RabbitMQService, AmqpChannel, AmqpMessage } from "./rabbitmq.client";

describe("09-async-rabbitmq : Producteur & Consommateur asynchrone", () => {
    const createMockChannel = () => {
        let registeredCallback: ((msg: AmqpMessage | null) => void) | null = null;

        const channel: AmqpChannel = {
            assertQueue: jest.fn().mockResolvedValue({}),
            sendToQueue: jest.fn().mockReturnValue(true),
            consume: jest.fn(async (_queue, cb) => {
                registeredCallback = cb;
            }),
            ack: jest.fn(),
            nack: jest.fn(),
        };

        return {
            channel,
            simulateIncomingMessage: (payload: unknown) => {
                if (registeredCallback) {
                    registeredCallback({ content: Buffer.from(JSON.stringify(payload)) });
                }
            },
        };
    };

    it("doit déclarer une file durable et publier un message JSON presistant", async () => {
        const { channel } = createMockChannel();
        const rabbit = new RabbitMQService(channel);

        const sent = await rabbit.publishMessage("email_queue", {
            to: "Client@entreprise.com",
            subject: `Confirmation commande`,
        });

        expect(sent).toBe(true);
        expect(channel.assertQueue).toHaveBeenCalledWith("email_queue", { durable: true});
        expect(channel.sendToQueue).toHaveBeenCalledWith(
            "email_queue",
            expect.any(Buffer),
            { persistent: true }
        );
    });

    it("doit acquitter (ack) le message lorsque le traitement réussit", async () => {
        const { channel, simulateIncomingMessage } = createMockChannel();
        const rabbit = new RabbitMQService(channel);
        const receivedPayloads: any[] = [];

        await rabbit.consumeMessages("invoice_queue", async (data) => {
            receivedPayloads.push(data);
        });

        simulateIncomingMessage({ orderId: "CMD-99", amount: 15000 });
        await new Promise((resolve) => setImmediate(resolve));

        expect(receivedPayloads).toEqual([{ orderId: "CMD-99", amount: 15000 }]);
        expect(channel.ack).toHaveBeenCalledTimes(1);
        expect(channel.nack).not.toHaveBeenCalled();
    });

    it("doit rejeter (nack) le message si le traitement échoue", async () => {
        const { channel, simulateIncomingMessage } = createMockChannel();
        const rabbit = new RabbitMQService(channel);

        await rabbit.consumeMessages("invoice_queue", async () => {
            throw new Error("Erreur génération PDF");
        });

        simulateIncomingMessage({ orderId: "CMD-ERR" });
        await new Promise((resolve) => setImmediate(resolve));

        expect(channel.nack).toHaveBeenCalledTimes(1);
        expect(channel.ack).not.toHaveBeenCalled();
    });
});