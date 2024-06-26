import { Injectable } from '@nestjs/common';
import { RequestContext } from 'nestjs-easy-context';

import { LoggedRequest } from 'src';
import {
  UserResponse,
  UserClientResponse,
  UserClientPoolResponse,
  UserClientCompanyResponse,
} from 'src/petroplay/responses/user.response';

@Injectable()
export class ContextService {
  currentUser(): UserResponse {
    return RequestContext.currentContext.req['user'];
  }

  getClients(): UserClientResponse[] {
    return this.currentUser().clients;
  }

  getClientIds(): string[] {
    return this.getClients().map((c) => c.id);
  }

  getPools(): UserClientPoolResponse[] {
    return this.getClients()
      .filter((c) => c.pool)
      .groupBy((c) => c.pool.id)
      .select((c) => c.values.first().pool);
  }

  getPoolIds(): string[] {
    return this.getPools().map((p) => p.id);
  }

  getCompanies(): UserClientCompanyResponse[] {
    return this.getClients()
      .filter((c) => c.company)
      .groupBy((c) => c.company.id)
      .select((c) => c.values.first().company);
  }

  getCompanyIds(): string[] {
    return this.getCompanies().map((c) => c.id);
  }

  getHeaders(): Record<string, string> {
    const headers = RequestContext.currentContext.req.headers;
    return {
      Authorization: headers.authorization,
      'api-secret-key': headers['api-secret-key'],
    };
  }

  request(): LoggedRequest {
    return RequestContext.currentContext.req as LoggedRequest;
  }

  response(): Response {
    return RequestContext.currentContext.res as unknown as Response;
  }
}
