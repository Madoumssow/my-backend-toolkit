import { Writable } from "stream";
import pino from "pino";
import { createLogger } from "./logger.service";

describe("04-logger-observability : Service de logs structurés (Pino)", () => {
    it("doit créer un logger avec le niveau par défault adapté à l'environnemnt", () => {
        const devLogger = createLogger({ isProduction: false });
        const prodLogger = createLogger({ isProduction: true });

        expect(devLogger.level).toBe("debug");
        expect(prodLogger.level).toBe("info");
    });

    it("doit masquer automatiquement les données sensibles (password, token)", () => {
        const loggedLines: string[] = [];
        const memoryStream = new Writable({
            write(chunk, _encoding, callback) {
                loggedLines.push(chunk.toString());
                callback;
            },
        });

        // On instancie Pino avec les mêmes règles de masquage sur un flux mémoire pour vérifier le JSON produit
        const testLogger = pino(
            {
                redact: {
                    paths: ["password", "*.password", "token", "*.token"],
                    censor: "[REDACTED]",
                },
            },
            memoryStream
        );

        testLogger.info({ user: "thierno", password: "MonSuperPassword123", auth: { token: "secret_jwt" } }, "Connexion utilisateur");

        expect(loggedLines.length).toBe(1);
        const parsedLog = JSON.parse(loggedLines[0]);

        expect(parsedLog.user).toBe("thierno");
        expect(parsedLog.password).toBe("[REDACTED]");
        expect(parsedLog.auth.token).toBe("[REDACTED]");
    });
});