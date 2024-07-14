import { Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ParseOrderPipe } from 'src/commons/pipes/parse-order.pipe';
import { ParseUUIDOptionalPipe } from 'src/commons/pipes/parse-uuid-optional.pipe';
import { DealernetOrderResponse } from 'src/dealernet/response/os-response';

import { OsService } from './order.service';

@ApiBearerAuth()
@ApiTags('OS')
@Controller('os/:order_id')
export class OsController {
  constructor(private readonly service: OsService) {}

  @Get()
  @ApiResponse({ status: 200, type: DealernetOrderResponse, isArray: true })
  @ApiOperation({ summary: 'Busca uma lista ordem de serviço baseado no integration_id dentro da order informada' })
  @ApiQuery({ name: 'budget_id', required: false })
  async findByOrderId(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Query('budget_id', ParseUUIDOptionalPipe) budget_id: string,
  ): Promise<DealernetOrderResponse[]> {
    return this.service.findByPPsOrderId(order_id, budget_id);
  }

  @Post()
  @ApiResponse({ status: 200, type: DealernetOrderResponse, isArray: true })
  @ApiOperation({ summary: 'Utiliza o body da rota para inserir uma nova ordem' })
  @ApiQuery({ name: 'budget_id', required: false })
  async create(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Query('budget_id', ParseUUIDOptionalPipe) budget_id: string,
  ): Promise<DealernetOrderResponse[]> {
    return this.service.createOs(order_id, budget_id);
  }

  @Get('/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML baseado em informações extraídas da ordem informada' })
  @ApiQuery({ name: 'budget_id', required: false })
  async findSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Query('budget_id', ParseUUIDOptionalPipe) budget_id: string,
  ): Promise<string> {
    return this.service.createSchema(order_id, budget_id);
  }

  @Get(`:budget_id/request-parts/schema`)
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML baseado em informações extraídas da ordem informada' })
  async requestPartsSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
  ): Promise<string> {
    return this.service.requestPartsSchema(order_id, budget_id);
  }

  @Put(':budget_id/appointments')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Atualiza os apontamentos da ordem de serviço baseado em informações extraídas da ordem informada' })
  async appointment(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
  ): Promise<DealernetOrderResponse> {
    return this.service.appointment(order_id, budget_id);
  }

  @Get(`:budget_id/appointments/schema`)
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary:
      'Retorna um corpo XML para atualizar os apontamentos da ordem de serviço baseado em informações extraídas da ordem informada',
  })
  async appointmentXmlSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
  ): Promise<string> {
    return this.service.appointmentXmlSchema(order_id, budget_id);
  }
}
