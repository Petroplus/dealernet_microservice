import { DynamicModule, Module } from '@nestjs/common';

import { PetroplayCustomerModule } from './customer/customer.module';
import { PetroplayIntegrationModule } from './integration/integration.module';
import { PetroplayOrderModule } from './order/order.module';
import { PetroplayService } from './petroplay.service';
import { PetroplayClientModule } from './client/client.module';

@Module({
  imports: [PetroplayIntegrationModule, PetroplayOrderModule, PetroplayCustomerModule, PetroplayClientModule],
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
