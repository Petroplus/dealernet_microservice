import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { DealernetOrder } from 'src/dealernet/response/os-response';
import { OrderFilter } from './filters/order.filters';
import { CreateOsDTO } from 'src/dealernet/dto/create-os.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get(':client_id')
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Busca uma lista ordem de serviço baseado nos filtros informados',
  })
  async find(@Param('client_id', ParseUUIDPipe) client_id: string, @Query() filter: OrderFilter): Promise<DealernetOrder[]> {
    return this.service.find(client_id, filter);
  }

  @Get('order_id/:order_id')
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Busca uma lista ordem de serviço baseado no integration_id dentro da order informada',
  })
  async findByOrderId(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<DealernetOrder[]> {
    return this.service.findByPPsOrderId(order_id);
  }

  @Get(`xml_schema/:client_id`)
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Retorna um corpo XML baseado no body informado',
  })
  async getXmlSchema(@Param('client_id', ParseUUIDPipe) client_id: string, @Body() dto: CreateOsDTO): Promise<string> {
    return this.service.getXmlSchema(client_id, dto);
  }

  @Get(`xml_schema/order_id/:order_id`)
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Retorna um corpo XML baseado em informações extraídas da ordem informada',
  })
  async getXmlSchemaByOrderId(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<string> {
    return this.service.createXmlSchemaOsByOrderId(order_id);
  }

  @Post(':client_id')
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Utiliza o body da rota /orders/xml_schema/{client_id} para inserir uma nova ordem',
  })
  async createByCompleteBody(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Body() dto: CreateOsDTO
  ): Promise<DealernetOrder> {
    return this.service.create(client_id, dto);
  }

  @Post('/order_id/:order_id')
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Utiliza o body da rota /orders/xml_schema/order_id/{order_id} para inserir uma nova ordem',
  })
  async update(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<DealernetOrder> {
    return this.service.createOsByOrderId(order_id);
  }
}
