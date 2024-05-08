import { DynamicModule, Module } from '@nestjs/common';

import { PetroplayIntegrationModule } from './integration/integration.module';
import { PetroplayService } from './petroplay.service';

@Module({
  imports: [PetroplayIntegrationModule],
  providers: [PetroplayService],
  exports: [PetroplayService],
})
export class PetroplayModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: this,
    };
  }
}
