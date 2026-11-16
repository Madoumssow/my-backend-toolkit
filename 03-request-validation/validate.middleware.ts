import { Request, Response, NextFunction } from "express";
import { success, z, ZodError } from "zod";

// Interface définissant les parties de la requête que l'on peut valider
export interface RequestValidationSchemas {
    body?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    params?: z.ZodTypeAny;
}

export function validateRequest(schemas: RequestValidationSchemas) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                req.query = (await schemas.query.parseAsync(req.query)) as any;
            }
            if (schemas.params) {
                req.params = (await schemas.params.parseAsync(req.params)) as any;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));

                res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Données de la requête invalides",
                    errors: formattedErrors,
                });
                return;
            }

            next(error);
        }
    };
}