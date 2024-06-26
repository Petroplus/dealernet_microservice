import { Controller, Get, Post, Query } from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { ScheduleFilter } from './filters/schedule.filter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post()
  @ApiOperation({ summary: 'Busca os agendamentos e enviar para Petroplay. Por padrão executa a cada 60 minutos' })
  async sync(@Query() filter: ScheduleFilter): Promise<void> {
    return this.service.sync(filter);
  }

  @Get()
  @ApiOperation({ summary: 'Busca o schema dos agendamentos' })
  async schema(@Query() filter: ScheduleFilter): Promise<unknown> {
    return this.service.schema(filter);
  }
}
