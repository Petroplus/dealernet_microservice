import { Injectable } from '@nestjs/common';

import { PetroplayIntegrationService } from './integration/integration.service';

@Injectable()
export class PetroplayService {
  constructor(public readonly integration: PetroplayIntegrationService) {}
}
