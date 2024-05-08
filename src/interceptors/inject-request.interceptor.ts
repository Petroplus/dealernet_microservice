import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { LogtailService } from 'src/logtail/logtail.service';

export const REQUEST_CONTEXT = '_requestContext';

@Injectable()
export class InjectRequestInterceptor implements NestInterceptor {
  private logtailService = new LogtailService();

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    Logger.log(`${request.method} ${request.url}`, 'Router');

    this.logtailService.error(`${request.method} ${request.url}`, 'Router', {
      body: request.body,
      query: request.query,
      params: request.params,
    });

    request.body[REQUEST_CONTEXT] = { user: request.user };

    return next.handle();
  }
}
