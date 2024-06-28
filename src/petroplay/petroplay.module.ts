import { DynamicModule, Module } from '@nestjs/common';

import { PetroplayCustomerModule } from './customer/customer.module';
import { PetroplayIntegrationModule } from './integration/integration.module';
import { PetroplayOrderModule } from './order/order.module';
import { PetroplayService } from './petroplay.service';

@Module({
  imports: [PetroplayIntegrationModule, PetroplayOrderModule, PetroplayCustomerModule],
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
