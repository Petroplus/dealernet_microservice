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
      timestamp: new Date().toISOString(),
      path: this.httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    if (httpStatus < 500 && httpStatus >= 400) {
      const ex = exception as any;
      if (isString(ex.response)) {
        responseBody['error'] = ex.response;
      } else {
        responseBody = ex.response;
        httpStatus = ex.response?.statusCode || ex.response?.status || httpStatus;
        responseBody.path = this.httpAdapter.getRequestUrl(ctx.getRequest());
      }
    }

    /**
     * Report error
     */
    if (httpStatus >= 500) {
      this.logtailService.error(exception.message, 'ERROR', JSON.stringify(exception));
      Logger.error(exception, (exception as Error).stack);
    }

    this.httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
