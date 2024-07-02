import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateOsDTO } from 'src/dealernet/dto/create-os.dto';
import { DealernetOrder } from 'src/dealernet/response/os-response';

import { OrderFilter } from './filters/order.filters';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get(':client_id')
  @ApiResponse({ status: 200, type: DealernetOrder, isArray: true })
  @ApiOperation({
    summary: 'Busca uma lista ordem de serviço baseado nos filtros informados',
  })
  async find(@Param('client_id', ParseUUIDPipe) client_id: string, @Query() filter: OrderFilter): Promise<DealernetOrder[]> {
    return this.service.find(client_id, filter);
  }

  @Get('order_id/:order_id')
  @ApiResponse({ status: 200, type: DealernetOrder, isArray: true })
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
  @ApiResponse({ status: 200, type: DealernetOrder })
  @ApiOperation({
    summary: 'Utiliza o body da rota /orders/xml_schema/{client_id} para inserir uma nova ordem',
  })
  async createByCompleteBody(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Body() dto: CreateOsDTO,
  ): Promise<DealernetOrder> {
    return this.service.create(client_id, dto);
  }

  @Post('/order_id/:order_id')
  @ApiResponse({ status: 200, type: DealernetOrder })
  @ApiOperation({
    summary: 'Utiliza o body da rota /orders/xml_schema/order_id/{order_id} para inserir uma nova ordem',
  })
  async create(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<DealernetOrder> {
    return this.service.createOsByOrderId(order_id);
  }

  @Get(`xml_schema/update/order_id/:order_id`)
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Retorna um corpo XML para atualizar uma ordem de serviço baseado em informações extraídas da ordem informada',
  })
  async getUpdateXmlSchemaByOrderId(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<string> {
    return this.service.updateXmlSchemaOsByOrderId(order_id)
  }

  @Put(`xml_schema/update/order_id/:order_id`)
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Utiliza o body da rota /orders/xml_schema/update/order_id/{order_id} para atualizar uma ordem existente',
  })
  async updateByOrderId(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<DealernetOrder> {
    return this.service.updateOsByOrderId(order_id)
  }
}
