import { Module } from '@nestjs/common';

import { DealernetCustomerService } from './customer.service';

@Module({
  providers: [DealernetCustomerService],
  exports: [DealernetCustomerService],
})
export class DealernetCustomerModule {}
