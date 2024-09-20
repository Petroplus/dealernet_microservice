import { Controller, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ParseOrderPipe } from 'src/commons/pipes/parse-order.pipe';

import { OsServiceProductService } from './os-service-product.service';

@ApiBearerAuth()
@ApiTags('OS - Services - Products')
@Controller('os/:order_id/:budget_id/services/:budget_service_id/products')
export class OsServiceProductController {
  constructor(private readonly service: OsServiceProductService) {}

  @Put('/:id/cancel')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Cancela um produto já atrelado a um serviço' })
  async cancel(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Param('budget_service_id', ParseUUIDPipe) budget_service_id: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown> {
    return this.service.cancel(order_id, budget_id, budget_service_id, id);
  }

  @Put('/:id/cancel/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML para cancelar um produto já atrelado a um serviço' })
  async cancelXmlSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Param('budget_service_id', ParseUUIDPipe) budget_service_id: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.service.cancelXmlSchema(order_id, budget_id, budget_service_id, id);
  }
}
