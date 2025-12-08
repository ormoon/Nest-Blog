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
import Stream from 'node:stream';
import { instanceToPlain } from 'class-transformer';
import { UserRole } from '../../user/user.entity';
import { RequestWithUser } from '../../auth/interfaces/RequestWitUser.interface';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((controllerRes: ControllerResponse) => {
        // if response has been sent directly from controller like res.send(), res.json(), res.end() then skip formatting
        if (res.headersSent) {
          return controllerRes;
        }

        // if controller response is of type Buffer, Stream, or string then skip formatting like for file download or plain text response
        if (
          controllerRes instanceof Buffer ||
          controllerRes instanceof Stream ||
          typeof controllerRes === 'string'
        ) {
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
