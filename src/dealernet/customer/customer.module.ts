import { DynamicModule, Module } from '@nestjs/common';

import { DealernetCustomerService } from './customer.service';

@Module({
  providers: [DealernetCustomerService],
  exports: [DealernetCustomerService],
})
export class DealernetCustomerModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: this,
    };
  }
}
