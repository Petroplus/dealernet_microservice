import { Module } from '@nestjs/common';
import { DealernetServiceService } from './service.service';

@Module({
  providers: [DealernetServiceService],
  exports: [DealernetServiceService],
})
export class DealernetServiceModule {}
