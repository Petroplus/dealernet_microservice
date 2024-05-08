import { Module, DynamicModule } from '@nestjs/common';

import { DealernetService } from './dealernet.service';
import { DealernetScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [DealernetScheduleModule.forRoot()],
  providers: [DealernetService],
  exports: [DealernetService],
})
export class DealernetModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: DealernetModule,
    };
  }
}
