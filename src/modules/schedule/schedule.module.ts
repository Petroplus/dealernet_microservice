import { Module } from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {
  static forRoot() {
    return {
      global: true,
      module: this,
    };
  }
}
