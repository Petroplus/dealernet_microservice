import { Injectable } from '@nestjs/common';

import { petroplay } from 'src/commons/web-client';
import { ContextService } from 'src/context/context.service';

@Injectable()
export class HttpClientService {
  constructor(private readonly context: ContextService) {}

  async v1(headers?: any) {
    return petroplay.v1({ ...headers, ...this.context.getHeaders() });
  }

  async v2(headers?: any) {
    return petroplay.v2({ ...headers, ...this.context.getHeaders() });
  }
}
