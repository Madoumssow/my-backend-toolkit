import express from "express";
import request from "supertest";
import {  AuthService } from "./auth.service";
import { createAuthMiddleware, authorizeRoles } from "./auth.middleware";
import { success } from "zod";

describe("05-auth-jwt-rbac : Authentification JWT & Gestion des rôles", () => {
    const authService = new AuthService({
        accessSecret: "test_access_secret_key_123456",
        refreshSecret: "test_refresh_secret_key_123456",
        accessExpiresIn: "15m",
        refreshExpiresIn: "7d",
    });

    const authenticate = createAuthMiddleware(authService);

    const app = express();
    app.get("/profile", authenticate, (req, res) => {
        res.status(200).json({ success: true, user: req.user });
    });

    app.delete("/admin/users/:id", authenticate, authorizeRoles("admin"), (_req, res) => {
        res.status(200).json({ success: true, message: "Utilisateur supprimé" });
    });

    it("doit hacher et vérifier correctement un mot de passe", async () => {
        const plain = "MotDePasseSecurise2026!";
        const hashed = await authService.hashPassword(plain);

        expect(hashed).not.toBe(plain);
        expect(await authService.comparePassword(plain, hashed)).toBe(true);
        expect(await authService.comparePassword("MauvaisMotDePasse", hashed)).toBe(false);
    });

    it("doit rejeter une requête sans token avec un statut 401", async () => {
        const res = await request(app).get('/profile');
        expect(res.status).toBe(401);
    });

    it("doit autoriser l'accés au profil avec un Access Token valide", async () => {
        const token = authService.generateAccessToken({
            userId: "user-123",
            email: "thierno@entreprise.com",
            role: "user",
        });

        const res = await request(app)
            .get("/profile")
            .set("Authorization", `Bearer ${token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe("thierno@entreprise.com");
    });

    it("doit bloquer un utilisateur standard sur une route admin avec un statut 403", async () => {
        const userToken = authService.generateAccessToken({
            userId: "user-123",
            email: "user@entreprise.com",
            role: "user",
        });

        const res = await request(app)
            .delete("/admin/users/99")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    it("doit autoriser un administrateur sur une route protégée par rôle", async () => {
        const adminToken = authService.generateAccessToken({
            userId: "admin-01",
            email: "admin@entreprise.com",
            role: "admin",
        });

        const res = await request(app)
            .delete("/admin/users/99")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
    });
});