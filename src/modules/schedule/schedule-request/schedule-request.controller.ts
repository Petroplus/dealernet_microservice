import { Controller, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ScheduleRequestService } from './schedule-request.service';

@ApiBearerAuth()
@ApiTags('Schedules - Requests')
@Controller('schedules/:order_id/requests')
export class ScheduleRequestController {
  constructor(private readonly service: ScheduleRequestService) {}

  @Post()
  async create(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<unknown> {
    return this.service.upsert(order_id);
  }

  @Put()
  async upsert(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<unknown> {
    return this.service.upsert(order_id);
  }
}
