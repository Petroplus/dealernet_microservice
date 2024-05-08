import { Module, DynamicModule } from '@nestjs/common';

import { DealernetScheduleService } from './schedule.service';

@Module({
  providers: [DealernetScheduleService],
  exports: [DealernetScheduleService],
})
export class DealernetScheduleModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: DealernetScheduleModule,
    };
  }
}
