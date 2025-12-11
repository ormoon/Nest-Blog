import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ControllerResponse, CustomResponse } from '../types/response.types';
import { Response } from 'express';
import { instanceToPlain } from 'class-transformer';
import { UserRole } from '../../user/user.entity';
import { RequestWithUser } from '../../auth/interfaces/RequestWitUser.interface';
import { RESPONSE_KEY } from '../decorators/skipFormat.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((controllerRes: ControllerResponse) => {
        const skipFormat = this.reflector.get<boolean>(
          RESPONSE_KEY,
          context.getHandler(),
        );

        // if response has been sent directly from controller like res.send(), res.json(), res.end() then skip formatting
        if (res.headersSent || skipFormat) {
          return controllerRes;
        }

        const { message, meta } = controllerRes;
        let data = controllerRes.data;

        // We need to exclude the password field defined in the User entity when returning data, so we convert the entity to a plain object.
        if (data && typeof data === 'object') {
          const groups =
            req.user?.role === UserRole.ADMIN ? [UserRole.ADMIN] : [];

          data = instanceToPlain(data, { groups });
        }

        const payload: CustomResponse = {
          statusCode: res.statusCode,
          message,
          data,
          ...(meta && { meta }),
        };
        return payload;
      }),
    );
  }
}
