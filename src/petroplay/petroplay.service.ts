import { HttpException, Injectable } from '@nestjs/common';

import { petroplay } from 'src/commons/web-client';

import { PetroplayClientService } from './client/client.service';
import { PetroplayCustomerService } from './customer/customer.service';
import { PetroplayIntegrationService } from './integration/integration.service';
import { PetroplayOrderService } from './order/order.service';
import { UserResponse } from './responses/user.response';

@Injectable()
export class PetroplayService {
  constructor(
    public readonly integration: PetroplayIntegrationService,
    public readonly client: PetroplayClientService,
    public readonly order: PetroplayOrderService,
    public readonly customer: PetroplayCustomerService,
  ) {}

  async findMeByBearer(token: string): Promise<UserResponse> {
    const client = await petroplay.v2();
    const { data } = await client.get(`/v2/me`, { headers: { Authorization: `Bearer ${token}` } }).catch((error) => {
      throw new HttpException(error.response.data, error.response.status);
    });
    return data ?? [];
  }

  async findMeBySecretKey(secretKey: string): Promise<UserResponse> {
    const client = await petroplay.v2({ 'x-secret-key': secretKey });
    const { data } = await client.get(`/v2/me`).catch((error) => {
      throw new HttpException(error.response.data, error.response.status);
    });
    return data ?? [];
  }
}
