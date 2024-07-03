import { Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DealernetOrder } from 'src/dealernet/response/os-response';

import { OsService } from './order.service';

@ApiBearerAuth()
@ApiTags('OS')
@Controller('os/:order_id')
export class OsController {
  constructor(private readonly service: OsService) {}

  @Get()
  @ApiResponse({ status: 200, type: DealernetOrder, isArray: true })
  @ApiOperation({ summary: 'Busca uma lista ordem de serviço baseado no integration_id dentro da order informada' })
  async findByOrderId(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<DealernetOrder[]> {
    return this.service.findByPPsOrderId(order_id);
  }

  @Post()
  @ApiResponse({ status: 200, type: DealernetOrder, isArray: true })
  @ApiOperation({ summary: 'Utiliza o body da rota para inserir uma nova ordem' })
  @ApiQuery({ name: 'budget_id', required: false })
  async create(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Query('budget_id', ParseUUIDPipe) budget_id: string,
  ): Promise<DealernetOrder[]> {
    return this.service.createOs(order_id, budget_id);
  }

  @Get('/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML baseado em informações extraídas da ordem informada' })
  @ApiQuery({ name: 'budget_id', required: false })
  async findSchema(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Query('budget_id', ParseUUIDPipe) budget_id: string,
  ): Promise<string> {
    return this.service.createSchema(order_id, budget_id);
  }
}
