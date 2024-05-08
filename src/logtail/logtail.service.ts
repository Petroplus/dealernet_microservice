import { Logtail } from '@logtail/node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LogtailService {
  private logtail: Logtail = process.env.LOGTAIL_API_KEY && new Logtail(process.env.LOGTAIL_API_KEY);

  log(message: string, context?: string, data?: any) {
    if (this.logtail) this.logtail.log(message, context?.toLowerCase() ?? 'APP', data);
  }

  error(message: string, context?: string, data?: any) {
    this.log(message, context, data);
  }

  warn(message: string, context?: string, data?: any) {
    this.log(message, context, data);
  }

  info(message: string, context?: string, data?: any) {
    this.log(message, context, data);
  }

  debug(message: string, context?: string, data?: any) {
    this.log(message, context, data);
  }
}
