import { BadRequestException, Injectable } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { CustomerFilter } from './filters/customer.filter';
import { CreateCustomerDTO } from 'src/dealernet/dto/create-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly Dealernet: DealernetService
  ) {}

  async find(client_id: string, filter: CustomerFilter): Promise<any> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    if (filter.id) {
      return this.Dealernet.customer.findById(integration.dealernet, filter.id);
    } else if (filter.document) {
      return this.Dealernet.customer.findByDocument(integration.dealernet, filter.document);
    } else {
      throw new BadRequestException('Invalid filter');
    }
  }

  async create(client_id: string, dto: CreateCustomerDTO): Promise<void> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.Dealernet.customer.createCustomer(integration.dealernet, dto);
  }

  async update(client_id: string, dto: CreateCustomerDTO): Promise<void> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return await this.Dealernet.customer.updateCustomer(integration.dealernet, dto);
  }
}
