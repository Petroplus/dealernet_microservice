import { Module } from '@nestjs/common';

import { PetroplayCustomerService } from './customer.service';

@Module({
  providers: [PetroplayCustomerService],
  exports: [PetroplayCustomerService],
})
export class PetroplayCustomerModule {}
