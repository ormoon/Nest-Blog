import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch()
export class CatchExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;

    const httpStatus = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseData = {
      statusCode: httpStatus,
      method: request.method,
      path: httpAdapter.getRequestUrl(request) as string,
      error: isHttpException ? exception.getResponse() : String(exception),
    };

    this.logger.error(JSON.stringify(responseData));

    const responseBody = {
      ...responseData,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
