import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

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
}
