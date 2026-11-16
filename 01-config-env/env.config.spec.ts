import { validateEnv } from "./env.config";

describe("01-config-env : Validation des variables d'environnement", () => {
    const validRawEnv = {
        NODE_ENV: "production",
        PORT: "8080",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/mydb",
        JWT_SECRET: "super_secret_key_minimum_16_chars",
    };

    it("doit valider et transformer correctement des variables valides", () => {
        const config = validateEnv(validRawEnv);

        expect(config.NODE_ENV).toBe("production");
        expect(config.PORT).toBe(8080);
        expect(config.DATABASE_URL).toBe(validRawEnv.DATABASE_URL);
    });

    it("doit appliquer les valeurs par défaut si NODE_ENV et PORT sont absents", () => {
        const config = validateEnv({
            DATABASE_URL: "mongodb://localhost:27017/app",
            JWT_SECRET: "another_very_long_secret_key",
        });

        expect(config.NODE_ENV).toBe("development");
        expect(config.PORT).toBe(3000);
    });

    it("doit lever une erreur explicite si une variable obligatoire manque ou est invalide", () => {
        const invalidEnv = {
            PORT: "not-a-number",
            DATABASE_URL: "invalid-url",
            JWT_SECRET: "trop-court",
        };

        expect(() => validateEnv(invalidEnv)).toThrow(/Configuration environnement invalide/) 
    });
});