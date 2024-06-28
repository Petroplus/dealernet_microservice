import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';

import { CreateDealernetBudgetDTO } from 'src/dealernet/budget/dto/create-budget.dto';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { DealernetBudgetResponse } from 'src/dealernet/response/budget-response';
import { PetroplayService } from 'src/petroplay/petroplay.service';

@Injectable()
export class BudgetService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
  ) {}

  async find(client_id: string, integration_id: string): Promise<DealernetBudgetResponse> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.dealernet.budget.find(integration.dealernet, integration_id);
  }

  async getXMLSchema(client_id: string, dto: CreateDealernetBudgetDTO): Promise<string> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');
    return await this.dealernet.budget.createXmlSchema(integration.dealernet, dto);
  }

  async create(client_id: string, dto: CreateDealernetBudgetDTO): Promise<DealernetBudgetResponse> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.dealernet.budget.create(integration.dealernet, dto);
  }
}
