import { Injectable } from '@nestjs/common';

import { PetroplayIntegrationService } from './integration/integration.service';
import { PetroplayOrderService } from './order/order.service';
import { PetroplayCustomerService } from './customer/customer.service';

@Injectable()
export class PetroplayService {
  constructor(
    public readonly integration: PetroplayIntegrationService,
    public readonly order: PetroplayOrderService,
    public readonly customer: PetroplayCustomerService
  ) {}
}
