import { Module } from '@nestjs/common';

import { DealernetOsService } from './order.service';

@Module({
  providers: [DealernetOsService],
  exports: [DealernetOsService],
})
export class DealernetOrderModule {}
