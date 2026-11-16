import express from "express";
import request from "supertest";
import { success, z } from "zod";
import { validateRequest } from "./validate.middleware";

describe("03-request-validation : validation des requêtes HTTP avec Zod", () => {
    const createUserSchema = {
        body: z.object({
            email: z.string().email("Format email invalide"),
            age: z.number().min(18, "L'utilisateur doit être majeur"),
        }),
        params: z.object({
            orgId: z.string().uuid("L'identifiant organisation doit être un UUID valide"),
        }),
    };

    const app = express();
    app.use(express.json());

    app.post('/orgs/:orgId/users', validateRequest(createUserSchema), (req, res) => {
        res.status(201).json({ success: true, data: req.body });
    });

    it("doit laisser passer la requête si body et params sont valides", async () => {
        const validUuid = "123e4567-e89b-12d3-a456-426614174000";
        const res = await request(app)
            .post(`/orgs/${validUuid}/users`)
            .send({ email: "dev@entreprise.com", age: 25 });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true); 
    });

    it("doit bloquer la requête avec un status 400 et lister les champs invalides", async () => {
        const res = await request(app)
            .post("/orgs/id-invalide/users")
            .send({ email: "pas-un-email", age: 15 });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ field: "email", message: "Format email invalide" }),
                expect.objectContaining({ field: "age", message: "L'utilisateur doit être majeur" }),
            ])
        );
    });

});