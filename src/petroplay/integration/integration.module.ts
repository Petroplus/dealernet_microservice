import { Module } from '@nestjs/common';

import { PetroplayIntegrationService } from './integration.service';

@Module({
  providers: [PetroplayIntegrationService],
  exports: [PetroplayIntegrationService],
})
export class PetroplayIntegrationModule {}
