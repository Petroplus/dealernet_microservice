import { DynamicModule, Module } from '@nestjs/common';

import { PetroplayClientService } from './client.service';

@Module({
  providers: [PetroplayClientService],
  exports: [PetroplayClientService],
})
export class PetroplayClientModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: this,
    };
  }
}
