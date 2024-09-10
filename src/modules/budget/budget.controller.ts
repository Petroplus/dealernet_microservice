<<<<<<< HEAD
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
=======

import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

>>>>>>> 4ee8f24f88f14ce4853486f7055941a74f557bdc

import { ParseUUIDOptionalPipe } from 'src/commons/pipes/parse-uuid-optional.pipe';
import { DealernetBudgetResponse } from 'src/dealernet/response/budget-response';
import { DealernetOrderResponse } from 'src/dealernet/response/os-response';

import { BudgetService } from './budget.service';
import { CancelServiceDTO } from './dto/cancel-service.dto';

@ApiTags('Budget')
@Controller('budgets/:order_id')
export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  @Post()
  @ApiResponse({ status: 200, type: DealernetBudgetResponse })
  @ApiOperation({ summary: 'Utiliza para gerar um novo orçamento' })
  @ApiQuery({ name: 'budget_id', required: false })
  async create(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Query('budget_id', ParseUUIDOptionalPipe) budget_id: string,
  ): Promise<DealernetBudgetResponse[]> {
    return this.service.create(order_id, budget_id);
  }

  @Get()
  @ApiResponse({ status: 200, type: DealernetBudgetResponse })
  @ApiOperation({ summary: 'Retorna um orçamento' })
  async find(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Query('budget_id', ParseUUIDPipe) budget_id: string,
  ): Promise<DealernetBudgetResponse> {
    return this.service.find(order_id, budget_id);
  }

  @Get('/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML baseado em informações extraídas da ordem informada' })
  @ApiQuery({ name: 'budget_id', required: false })
  async findSchema(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Query('budget_id', ParseUUIDOptionalPipe) budget_id: string,
  ): Promise<string> {
    return this.service.createSchema(order_id);
  }

  @Post('/budget/:budget_id')
  @ApiResponse({ status: 200, type: DealernetOrderResponse })
  @ApiOperation({ summary: 'Roata para cancelar serviços de um orçamento' })
  @ApiBody({ type: CancelServiceDTO, isArray: true })
  async cancelServices(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Body() dto: CancelServiceDTO[],
  ): Promise<DealernetOrderResponse> {
    return this.service.cancelServices(order_id, budget_id, dto);
  }

  @Post('/budget/:budget_id/schema')
  @ApiResponse({ status: 200, type: DealernetBudgetResponse })
  @ApiOperation({ summary: 'Retorna um corpo XML utilizado para cancelar serviços de um orçamento' })
  @ApiBody({ type: CancelServiceDTO, isArray: true })
  async cancelServicesSchema(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Param('budget_id', ParseUUIDPipe) budget_id: string,
    @Body() dto: CancelServiceDTO[],
  ): Promise<string> {
    return this.service.cancelServicesSchema(order_id, budget_id, dto);
  }
}
