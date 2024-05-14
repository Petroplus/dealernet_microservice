import { Module } from '@nestjs/common';
import { DealernetOrderService } from './order.service';

@Module({
  providers: [DealernetOrderService],
  exports: [DealernetOrderService],
})
export class DealernetOrderModule {}
