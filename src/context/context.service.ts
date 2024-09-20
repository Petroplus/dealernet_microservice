import { RequestContext } from 'nestjs-easy-context';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { LoggedRequest } from 'src';

import {
  UserClientCompanyResponse,
  UserClientPoolResponse,
  UserClientResponse,
  UserResponse,
} from 'src/petroplay/responses/user.response';

@Injectable()
export class ContextService {
  currentUser(): UserResponse {
    return RequestContext.currentContext.req['user'] ?? {};
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
    const headers = RequestContext.currentContext?.req.headers ?? {};
    return {
      Authorization: headers.authorization,
      'api-secret-key': headers['api-secret-key'],
    };
  }

  setWarning(message: string): void {
    this.response().setHeader('Warning', message);
    this.response().setHeader('X-Warning', message);
  }

  request(): LoggedRequest {
    return RequestContext.currentContext.req as LoggedRequest;
  }

  response(): Response {
    return RequestContext.currentContext.res as unknown as Response;
  }
}
