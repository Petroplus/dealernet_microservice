import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateScheduleDto } from './dto/create-schedule';
import { ScheduleFilter } from './filters/schedule.filter';
import { ScheduleService } from './schedule.service';

@ApiBearerAuth()
@ApiTags('Schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post('/:client_id')
  @ApiOperation({ summary: 'Criar um agendamento' })
  async create(@Param('client_id') client_id: string, @Body() data: CreateScheduleDto): Promise<unknown> {
    return this.service.create(client_id, data);
  }

  @Get('/sync')
  @ApiOperation({ summary: 'Busca os agendamentos e enviar para Petroplay. Por padrão executa a cada 60 minutos' })
  async sync(@Query() filter: ScheduleFilter): Promise<void> {
    return this.service.sync(filter);
  }

  @Get('/schema')
  @ApiOperation({ summary: 'Busca o schema dos agendamentos' })
  async schema(@Query() filter: ScheduleFilter): Promise<unknown> {
    return this.service.schema(filter);
  }
}
