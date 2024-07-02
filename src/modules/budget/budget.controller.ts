import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateDealernetBudgetDTO } from 'src/dealernet/budget/dto/create-budget.dto';
import { DealernetBudgetResponse } from 'src/dealernet/response/budget-response';

import { BudgetService } from './budget.service';

@ApiTags('Budget')
@Controller('budgets/:order_id')
export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  @Post()
  @ApiResponse({ status: 200, type: DealernetBudgetResponse })
  @ApiOperation({ summary: 'Utiliza para gerar um novo orçamento' })
  async create(
    @Param('order_id', ParseUUIDPipe) order_id: string,
    @Body() dto: CreateDealernetBudgetDTO,
  ): Promise<DealernetBudgetResponse> {
    return this.service.create(order_id, dto);
  }

  @Get('/schema')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Retorna um corpo XML baseado em informações extraídas da ordem informada' })
  async findSchema(@Param('order_id', ParseUUIDPipe) order_id: string): Promise<string> {
    return this.service.createSchema(order_id);
  }
}
