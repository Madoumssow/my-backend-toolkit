import { ExecutionContext, ForbiddenException, CallHandler } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { of, lastValueFrom } from "rxjs";
import { RolesGuard, ROLES_KEY } from "./roles.guard";
import { TransformInterceptor } from "./transform.interceptor";

describe("08-nestjs-architecture : Guards & Interceptors NestJS", () => {
    const createMockContext = (user?: { role: string}): ExecutionContext => 
    ({
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
        switchToHttp: () => ({
            getRequest: () => ({ user }),
        }),
    } as unknown as ExecutionContext);

    it("doit autoriser l'accès si le rôle de l'utilisateur fait partie des rôles autorisés", () => {
        const reflector = new Reflector();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin", "manager"]);
        const guard = new RolesGuard(reflector);

        const context = createMockContext({ role: "admin" });
        expect(guard.canActivate(context)).toBe(true);
    });

    it("doit lever une ForbiddenException (403) si l'utilisateur n'a pas le bon rôle ", () => {
        const reflector = new Reflector();
        jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);
        const guard = new RolesGuard(reflector);

        const context = createMockContext({ role: "user" });
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it("doit formater automatiquement la réponse du contrôleur via TransformInterceptor", async () => {
        const interceptor = new TransformInterceptor();
        const mockContext = createMockContext();
        const mockNext: CallHandler = {
            handle: () => of({ id: 1, name: "Produit A" }),
        };

        const result = await lastValueFrom(interceptor.intercept(mockContext, mockNext));

        expect(result.success).toBe(true);
        expect(result.timestamp).toBeDefined();
        expect(result.data).toEqual({ id: 1, name: "Produit A" });
    });
});