import crypto from "crypto";
import express from "express";
import request from "supertest";
import { verifyHmacWebhook } from "./webhook.middleware";

describe("10-devops-webhooks-deploy : Sécurisation des Webhooks HMAC", () => {
    const SECRET = "whsec_mon_secret_production_2026";

    const buildApp = () => {
        const app = express();
        app.use(express.json());
        app.post(
            "/webhooks/payment",
            verifyHmacWebhook({ secret: SECRET }),
            (req, res) => {
                res.status(200).json({ received: true, event: req.body.event });
            }
        );
        return app;
    };

    it("doit accepter un webhook dont la signature HMAC-SHA256 est valide", async () => {
        const app = buildApp();
        const payload = { event: "payment.succeeded", amount: 25000 };
        const signature = 
            "sha256=" +
            crypto
                .createHmac("sha256", SECRET)
                .update(JSON.stringify(payload))
                .digest("hex");
        
        const response = await request(app)
            .post("/webhooks/payment")
            .set("x-webhook-signature", signature)
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            received: true,
            event: "payment.succeeded",
        });
    });

    it("doit rejeter (401) un webhook avec une signature falsifiée", async () => {
        const app = buildApp();
        const payload = { event: "payment.succeeded", amount: 999999 };

        const response = await request(app)
            .post("/webhooks/payment")
            .set("x-webhook-signature", "sha256=signature_fausse_1234567890")
            .send(payload);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it("doit rejeter (401) une requête webhook sans en-tête de signature", async () => {
        const app = buildApp();

        const response = await request(app)
            .post("/webhooks/payment")
            .send({ event: "payment.succeeded" });

        expect(response.status).toBe(401);
    });
});