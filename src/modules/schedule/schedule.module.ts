import { Module } from '@nestjs/common';

import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleRequestModule } from './schedule-request/schedule-request.module';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [ScheduleRequestModule],
})
export class ScheduleModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
