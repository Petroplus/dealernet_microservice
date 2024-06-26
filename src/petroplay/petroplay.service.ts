import { HttpException, Injectable } from '@nestjs/common';

import { PetroplayIntegrationService } from './integration/integration.service';
import { PetroplayOrderService } from './order/order.service';
import { PetroplayCustomerService } from './customer/customer.service';
import { UserResponse } from './responses/user.response';
import { petroplay } from 'src/commons/web-client';
import { ContextService } from 'src/context/context.service';

@Injectable()
export class PetroplayService {
  constructor(
    public readonly integration: PetroplayIntegrationService,
    public readonly order: PetroplayOrderService,
    public readonly customer: PetroplayCustomerService
  ) {}

  async findMeByBearer(token: string): Promise<UserResponse> {
    const client = await petroplay.v2();
    const { data } = await client.get(`/v2/me`, { headers: { Authorization: `Bearer ${token}` } }).catch((error) => {
      throw new HttpException(error.response.data, error.response.status);
    });
    return data ?? [];
  }

  async findMeBySecretKey(secretKey: string): Promise<UserResponse> {
    const client = await petroplay.v2();
    const { data } = await client.get(`/v2/me`, { headers: { 'x-secret-key': secretKey } }).catch((error) => {
      throw new HttpException(error.response.data, error.response.status);
    });
    return data ?? [];
  }
}
