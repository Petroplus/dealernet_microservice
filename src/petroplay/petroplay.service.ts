import { Injectable } from '@nestjs/common';

import { PetroplayIntegrationService } from './integration/integration.service';
import { PetroplayOrderService } from './order/order.service';

@Injectable()
export class PetroplayService {
  constructor(
    public readonly integration: PetroplayIntegrationService,
    public readonly order: PetroplayOrderService
  ) {}
}
