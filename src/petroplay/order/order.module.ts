import { Module } from '@nestjs/common';

import { PetroplayOrderService } from './order.service';

@Module({
  providers: [PetroplayOrderService],
  exports: [PetroplayOrderService],
})
export class PetroplayOrderModule {}
