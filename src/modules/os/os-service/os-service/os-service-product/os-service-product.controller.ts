import { Body, Controller, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ParseOrderPipe } from 'src/commons/pipes/parse-order.pipe';

import { AttachOsServiceProdutoDto } from './dto/attach-os-service-produto';
import { OsServiceProductService } from './os-service-product.service';

@ApiBearerAuth()
@ApiTags('OS - Services - Products')
@Controller('os/:order_id/:order_budget_id/services/:order_budget_service_id/products')
export class OsServiceProductController {
  constructor(private readonly service: OsServiceProductService) {}

  @Post()
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Adiciona um produto a um serviço' })
  async attach(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('order_budget_id', ParseUUIDPipe) order_budget_id: string,
    @Param('order_budget_service_id', ParseUUIDPipe) order_budget_service_id: string,
    @Body() dto: AttachOsServiceProdutoDto,
  ): Promise<unknown> {
    return this.service.attach(order_id, order_budget_id, order_budget_service_id, dto);
  }

  @Post('/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Adiciona um produto a um serviço' })
  async attachSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('order_budget_id', ParseUUIDPipe) order_budget_id: string,
    @Param('order_budget_service_id', ParseUUIDPipe) order_budget_service_id: string,
    @Body() dto: AttachOsServiceProdutoDto,
  ): Promise<unknown> {
    return this.service.attachSchema(order_id, order_budget_id, order_budget_service_id, [dto]);
  }

  @Put('/:id/cancel')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Cancela um produto já atrelado a um serviço' })
  async cancel(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('order_budget_id', ParseUUIDPipe) order_budget_id: string,
    @Param('order_budget_service_id', ParseUUIDPipe) order_budget_service_id: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown> {
    return this.service.cancel(order_id, order_budget_id, order_budget_service_id, id);
  }

  @Put('/:id/cancel/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML para cancelar um produto já atrelado a um serviço' })
  async cancelXmlSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('order_budget_id', ParseUUIDPipe) order_budget_id: string,
    @Param('order_budget_service_id', ParseUUIDPipe) order_budget_service_id: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.service.cancelXmlSchema(order_id, order_budget_id, order_budget_service_id, id);
  }
}
