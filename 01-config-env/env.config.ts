import { z } from "zod";
import * as dotenv from "dotenv";

// Charge le fichier .env s'il existe
dotenv.config();

// 1. Définition du schéma strict des variables attendues
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z
        .string()
        .default("3000")
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, {
            message: "PORT doit être un nombre valide supérieur à 0",
        }),
    DATABASE_URL: z.string().url({ message: "DATABASE_URL doit être une URL valide" }),
    JWT_SECRET: z.string().min(16, { message: "JWT_SECRET doit contenir au moins 16 caractères" }),    
});

// Type TypeScript généré autromatiquement à partir du schéma
export type EnvConfig = z.infer<typeof envSchema>;

// 2. Fonction de validation réutilisable et testable
export function validateEnv(rawEnv: Record<string, string | undefined>): EnvConfig {
    const parsed = envSchema.safeParse(rawEnv);

    if (!parsed.success) {
        const errors = parsed.error.issues
            .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
            .join("\n");
        throw new Error(`Configuration environnement invalide :\n${errors}`);
    }

    return parsed.data;
}

// 3. Export prêt à l'emploi (désactivé en mode test automatique pour éviter le crash à l'import)
export const env = process.env.NODE_ENV === "test" ? ({} as EnvConfig) : validateEnv(process.env);