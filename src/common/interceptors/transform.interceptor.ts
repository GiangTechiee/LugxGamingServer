import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../interfaces/response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'statusCode' in data && 'data' in data && 'message' in data) {
          return data; 
        }
        return {
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
        message: 'Success',
        };
      }),
    );
  }
}