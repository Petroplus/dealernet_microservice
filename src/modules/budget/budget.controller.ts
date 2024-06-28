import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateDealernetBudgetDTO } from 'src/dealernet/budget/dto/create-budget.dto';
import { DealernetBudgetResponse } from 'src/dealernet/response/budget-response';

import { BudgetService } from './budget.service';

@ApiTags('Budget')
@Controller('budgets')
export class BudgetController {
  constructor(private readonly service: BudgetService) {}

  @Get(':client_id/integration/:integration_id')
  @ApiResponse({ status: 200, type: DealernetBudgetResponse })
  @ApiOperation({
    summary: 'Busca um orçamento baseado nos id de integração informado',
  })
  async find(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Param('integration_id') integration_id: string,
  ): Promise<DealernetBudgetResponse> {
    return this.service.find(client_id, integration_id);
  }

  @Get(`xml_schema/:client_id`)
  @ApiResponse({ status: 200 })
  @ApiOperation({
    summary: 'Retorna um corpo XML baseado no body informado',
  })
  async getXmlSchema(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Body() dto: CreateDealernetBudgetDTO,
  ): Promise<string> {
    return this.service.getXMLSchema(client_id, dto);
  }

  @Post(':client_id')
  @ApiResponse({ status: 200, type: DealernetBudgetResponse })
  @ApiOperation({
    summary: 'Utiliza o body da rota budgets/xml_schema/{client_id} para gerar um novo orçamento',
  })
  async create(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Body() dto: CreateDealernetBudgetDTO,
  ): Promise<DealernetBudgetResponse> {
    return this.service.create(client_id, dto);
  }
}
