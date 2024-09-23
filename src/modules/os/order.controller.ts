import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ParseOrderPipe } from 'src/commons/pipes/parse-order.pipe';
import { ParseUUIDOptionalPipe } from 'src/commons/pipes/parse-uuid-optional.pipe';
import { DealernetOrderResponse } from 'src/dealernet/response/os-response';

import { AttachServiceToOrderDTO } from './dto/attach-service-to-order.dto';
import { EditDealernetServiceDTO } from './dto/edit-dealernet-service.dto';
import { UpdateOsDto } from './dto/update-os.dtp';
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
  @ApiOperation({ summary: 'Utiliza o body da rota para inserir uma nova ordem de serviço' })
  @ApiQuery({ name: 'budget_id', required: false })
  async create(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Query('budget_id', ParseUUIDOptionalPipe) budget_id: string,
  ): Promise<DealernetOrderResponse[]> {
    return this.service.createOs(order_id, budget_id);
  }

  @Get('/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML baseado em informações extraídas da ordem de serviço informada' })
  @ApiQuery({ name: 'budget_id', required: false })
  async findSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Query('budget_id', ParseUUIDOptionalPipe) budget_id: string,
  ): Promise<string> {
    return this.service.createSchema(order_id, budget_id);
  }

  @Put('/:budget_id/')
  @ApiResponse({ status: 200, type: DealernetOrderResponse, isArray: true })
  @ApiOperation({ summary: 'Utiliza o body da rota para atualizar uma ordem de serviço' })
  @ApiQuery({ name: 'budget_id', required: false })
  async update(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDOptionalPipe) budget_id: string,
    @Body() dto: UpdateOsDto,
  ): Promise<void> {
    return this.service.updateOs(order_id, budget_id, dto);
  }

  @Put('/:budget_id/schema')
  @ApiResponse({ status: 200, type: DealernetOrderResponse, isArray: true })
  @ApiOperation({ summary: 'Utiliza o body da rota para atualizar uma ordem de serviço' })
  @ApiQuery({ name: 'budget_id', required: false })
  async updateSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDOptionalPipe) budget_id: string,
    @Body() dto: UpdateOsDto,
  ): Promise<string> {
    return this.service.updateOsXmlSchema(order_id, budget_id, dto);
  }

  @Get(`:budget_id/request-parts/schema`)
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML baseado em informações extraídas da ordem de serviço informada' })
  async requestPartsSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
  ): Promise<string> {
    return this.service.requestPartsSchema(order_id, budget_id);
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

  @Post(':budget_id/appointments/:appointment_id')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Atualiza os apontamentos da ordem de serviço baseado em informações extraídas da ordem informada' })
  async appointment(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Param('appointment_id', ParseUUIDPipe) appointment_id: string,
  ): Promise<DealernetOrderResponse> {
    return this.service.appointment(order_id, budget_id, appointment_id);
  }

  @Post(`:budget_id/attach-service/schema`)
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Retorna um corpo XML para adicionar um serviço a uma ordem já existente',
  })
  async attachServiceXmlSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Body() dto: AttachServiceToOrderDTO,
  ): Promise<string> {
    return this.service.attachServiceToOrderSchema(order_id, budget_id, dto);
  }

  @Post(`:budget_id/attach-service`)
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Utiliza o corpo xml da rota :budget_id/attach-service/schema e adiciona um serviço em uma ordem já existente',
  })
  async attachServiceXml(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Body() dto: AttachServiceToOrderDTO,
  ): Promise<DealernetOrderResponse> {
    return this.service.attachServiceToOrder(order_id, budget_id, dto);
  }
}
