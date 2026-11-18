import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface StandardApiResponse<T> {
    success: boolean;
    timestamp: string;
    data: T;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, StandardApiResponse<T>>
    {
        intercept(
            _context: ExecutionContext, 
            next: CallHandler
        ): Observable<StandardApiResponse<T>> {
            return next.handle().pipe(
                map((data) => ({
                    success: true,
                    timestamp: new Date().toISOString(),
                    data,
                }))
            );
        }
    }