import { Body, Controller, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ParseArrayPipe } from 'src/commons/pipes/parse-array.pipe';
import { ParseOrderPipe } from 'src/commons/pipes/parse-order.pipe';

import { UpdateOsServiceDto } from './dto/update-os-service.dto';
import { OsServiceService } from './os-service.service';

@ApiBearerAuth()
@ApiTags('OS - Services')
@Controller('os/:order_id/:budget_id/services')
export class OsServiceController {
  constructor(private readonly service: OsServiceService) {}

  @Put()
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Atualiza um serviço já atrelado a uma ordem' })
  @ApiBody({ type: UpdateOsServiceDto, isArray: true })
  async update(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Body(new ParseArrayPipe({ items: UpdateOsServiceDto })) dtos: UpdateOsServiceDto[],
  ): Promise<unknown> {
    return this.service.update(order_id, budget_id, dtos);
  }

  @Put(`/schema`)
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML para alterar um serviço já atrelado a uma ordem' })
  @ApiBody({ type: UpdateOsServiceDto, isArray: true })
  async updateXmlSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Body(new ParseArrayPipe({ items: UpdateOsServiceDto })) dtos: UpdateOsServiceDto[],
  ): Promise<string> {
    return this.service.updateXmlSchema(order_id, budget_id, dtos);
  }

  @Put('/:id/cancel')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Cancela um serviço já atrelado a uma ordem' })
  async cancel(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<unknown> {
    return this.service.cancel(order_id, budget_id, id);
  }

  @Put('/:id/cancel/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML para cancelar um serviço já atrelado a uma ordem' })
  async cancelXmlSchema(
    @Param('order_id', ParseOrderPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return this.service.cancelXmlSchema(order_id, budget_id, id);
  }
}
