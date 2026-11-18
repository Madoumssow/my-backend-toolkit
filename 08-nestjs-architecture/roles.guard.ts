import "reflect-metadata";
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    SetMetadata,
    ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

export const ROLES_KEY =    "roles";

// 1. Décorateur personnalisé : @Roles('admin', 'manager')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// 2. Guard NestJS qui vérifie si le rôle de req.user correspond aux rôles requis
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass
        ]);

        // Si aucune restriction @Roles() n'est posée sur la route, on laisse passer
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                `Accès refusé : rôle "${user?.role ?? "invité"}" insuffisant`
            );
        }

        return true;
    }
}