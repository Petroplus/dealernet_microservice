import { Controller, Get, Query } from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { ScheduleFilter } from './filters/schedule.filters';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Busca os agemdamentos e enviar para Petroplay. Por padrão executa a cada 60 minutos' })
  async find(@Query() filter: ScheduleFilter): Promise<void> {
    return this.service.sync(filter);
  }
}
