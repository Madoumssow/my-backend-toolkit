import { Request, Response, NextFunction } from "express";
import { AuthService, JwtUserPayload } from "./auth.service";
import { success } from "zod";

// Extension globale du type Request d'Express pour inclure req.user
declare global {
    namespace Express {
        interface Request {
            user?: JwtUserPayload;
        }
    }
}

// 1. Middleware qui vérifie la présence et la validité du token Bearer
export function createAuthMiddleware(authService: AuthService) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Accès non autorisé : token manquant ou mal formaté",
            });
            return;
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = authService.verifyAccessToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Accès non autorisé : token invalide ou expiré",
            });
        }
    };
}

// 2. Middleware RBAC qui restreint l'accès aux rôles autorisés
export function authorizeRoles(...allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Utilisateur non authentifié",
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                statusCode: 403,
                message: `Accès interdit : rôle "${req.user.role}" insuffisant`,
            });
            return;
        }

        next();
    };
}
