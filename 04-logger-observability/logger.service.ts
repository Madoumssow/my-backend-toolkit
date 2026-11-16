import pino, { Logger, LoggerOptions } from "pino";

export interface CreateLoggerOptions {
    level?: string;
    isProduction?: boolean;
    serviceName?: string;
}

export function createLogger(options: CreateLoggerOptions = {}): Logger {
    const isProd = options.isProduction ?? process.env.NODE_ENV === "production";
    const level = options.level ?? process.env.LOG_LEVEL ?? (isProd ? "info" : "debug");

    const pinoConfig: LoggerOptions = {
        level, 
        base: {
            service: options.serviceName ?? "backend-api",
            env: process.env.NODE_ENV ?? "development",
        },
        // Masque automatiquement les champs sensibles dans tous les logs
        redact: {
            paths: ["password", "*.password", "token", "*.token", "authorization", "req.headers.authorization"],
            censor: "[REDACTED]",
        },
        // En lacal/dev, on utilise pino-pretty pour une lecture confortable; en prod, du JSON brut 
        ...(isProd ? 
            {}
            : {
                transport: {
                    target: "pino-pretty",
                    options: {
                        colorize: true, 
                        translateTime: "SYS:standard",
                        ignore: "pid,hostname",
                    },
                },
            }),
    };

    return pino(pinoConfig);
};

// Instance prête à l'emploi pour l'application
export const logger = createLogger();