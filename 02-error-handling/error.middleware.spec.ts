import express from "express";
import request from "supertest";
import { AppError, asyncHandler, globalErrorHandler } from "./error.middleware";
import { afterEach } from "node:test";

describe("02-error-handling : Gestionnaire global des erreurs HTTP", () => {
    // Création d'une mini application Express isolée pour les tests
    const createTestApp = () => {
        const app = express();

        app.get(
            "/not-found",
            asyncHandler(async () => {
                throw new AppError("Utilisateur introuvable", 404);
            })
        );

        app.get(
            "/crash",
            asyncHandler(async () => {
                throw new Error("Connexion base de données perdue");
            })
        );

        app.use(globalErrorHandler);
        return app;
    };

    afterEach(() => {
        process.env.NODE_ENV = "test";
    });

    it("doit formater proprement une AppError opérationnelle (ex: 404", async () => {
        const app = createTestApp();
        const res = await request(app).get("/not-found");

        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
            success: false,
            statusCode: 404,
            message: "Utilisateur introuvable",
        });
        expect(res.body.stack).toBeDefined();
    });

    it("doit masquer les détails techniques et la stack trace en production sur une erreur 500", async () => {
        process.env.NODE_ENV = "production";
        const app = createTestApp();
        const res = await request(app).get('/crash');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            success: false,
            statusCode: 500,
            message: "Une erreur interne est survenue sur le serveur.",
        });
        expect(res.body.stack).toBeUndefined();
    });
});