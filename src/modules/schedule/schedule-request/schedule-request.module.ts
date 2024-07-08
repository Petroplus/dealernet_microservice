import { Module } from '@nestjs/common';
import { ScheduleRequestService } from './schedule-request.service';
import { ScheduleRequestController } from './schedule-request.controller';

@Module({
  controllers: [ScheduleRequestController],
  providers: [ScheduleRequestService],
})
export class ScheduleRequestModule {}
