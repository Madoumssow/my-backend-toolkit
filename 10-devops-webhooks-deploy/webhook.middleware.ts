import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { success } from "zod";

export interface WebhookVerifyOptions {
    secret: string;
    signatureHeader?: string;
    prefix?: string;
}

export const verifyHmacWebhook = (options: WebhookVerifyOptions) => {
    const headerName = (options.signatureHeader || "x-webhook-signature").toLowerCase();
    const prefix = options.prefix ?? "sha256=";

    return (req: Request, res: Response, next: NextFunction) => {
        const receivedSignature = req.headers[headerName];

        if (!receivedSignature || typeof receivedSignature != "string") {
            return res.status(401).json({
                success: false, 
                message: `En-tête de signature "${headerName}" manquant`,
            });
        }

        // Récupère le corps brut (rawBody) ou sérialise le body JSON
        const rawPayload = 
            (req as any).rawBody ||
            (typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {}));

            const expectedHash = crypto
                .createHmac("sha256", options.secret)
                .update(rawPayload)
                .digest("hex");

            const expectedSignature = `${prefix}${expectedHash}`;

            const receivedBuffer = Buffer.from(receivedSignature);
            const expectedBuffer = Buffer.from(expectedSignature);

            // Vérification en temps constant pour bloquer les timing attacks
            if (
                receivedBuffer.length !== expectedBuffer.length ||
                !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
            ) {
                return res.status(401).json({
                    success: false,
                    message: "Signature Webhook invalide ou corrompue",
                });
            }

            return next();
    };
};