import { DynamicModule, Module } from '@nestjs/common';

import { PetroplayIntegrationModule } from './integration/integration.module';
import { PetroplayService } from './petroplay.service';
import { PetroplayOrderModule } from './order/order.module';
import { PetroplayCustomerModule } from './customer/customer.module';

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
