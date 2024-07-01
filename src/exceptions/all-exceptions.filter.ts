import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AbstractHttpAdapter, HttpAdapterHost } from '@nestjs/core';
import { isString } from 'class-validator';

import { LogtailService } from 'src/logtail/logtail.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private httpAdapter: AbstractHttpAdapter;
  private logtailService = new LogtailService();

  constructor(adapterHost: HttpAdapterHost) {
    this.httpAdapter = adapterHost.httpAdapter;
  }

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    let httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseBody = {
      statusCode: httpStatus,
      description: 'Ocorreu um erro inesperado',
      timestamp: new Date().toISOString(),
      path: this.httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    if (httpStatus < 500 && httpStatus >= 400) {
      const ex = exception as any;
      if (isString(ex.response)) {
        responseBody['error'] = ex.response;
      } else {
        httpStatus = ex.response?.statusCode || ex.response?.status || httpStatus;

        responseBody = ex.response;
        responseBody.description = responseBody.description || ex.response.error;
        responseBody.path = this.httpAdapter.getRequestUrl(ctx.getRequest());
      }
    }

    /**
     * Report error
     */
    if (httpStatus >= 500) {
      const ex = exception as any;
      this.logtailService.error(ex.message, 'ERROR', JSON.stringify(ex));
      if (ex.code == 'ECONNREFUSED') {
        responseBody.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
        responseBody['error'] = ex.message;
        responseBody['description'] = 'Não foi possível estabelecer uma conexão com o DMS';
      }
      Logger.error(exception, (exception as Error).stack);
    }

    this.httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
