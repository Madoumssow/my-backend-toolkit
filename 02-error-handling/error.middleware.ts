import { Request, Response, NextFunction } from "express";

// 1. Classe d'erreur personnalisée réutilisable dans vos services et contrôleurs
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Restaure la chaîne de prototypes pour que "instanceof AppError" fonctionne en TypeScript
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

// 2. Wrapper pour éliminer les blocs try/catch répétitifs dans les contrôleurs async
export const asyncHandler = 
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
    
// 3. Middleware global de gestion d'erreurs Express (doit être placé APRÈS toutes les routes)
export function globalErrorHandler(
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const isProd = process.env.NODE_ENV === "production";

    // En production, on masque les détails des bugs internes (500) pour des raisons de sécurité
    const message = 
        isProd && !isAppError
            ? "Une erreur interne est survenue sur le serveur."
            : err.message || "Erreur inconnue";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        // La stack trace n'est exposée qu'en qu'en développement
        ...(isProd ? {} : { stack: err.stack}),
    })
}