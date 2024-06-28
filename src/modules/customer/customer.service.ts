import { BadRequestException, Injectable } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { CreateCustomerDTO } from 'src/dealernet/dto/create-customer.dto';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { CustomerFilter } from './filters/customer.filter';

@Injectable()
export class CustomerService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly Dealernet: DealernetService,
  ) {}

  async find(client_id: string, filter: CustomerFilter): Promise<any> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    const customers = [];
    if (filter.id || filter.name || filter.document) {
      await this.Dealernet.customer.find(integration.dealernet, filter).then((customer) => customers.push(...customer));
    } else {
      throw new BadRequestException('Invalid filter');
    }

    return customers;
  }

  async create(client_id: string, dto: CreateCustomerDTO): Promise<void> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return this.Dealernet.customer.createCustomer(integration.dealernet, dto);
  }

  async update(client_id: string, dto: CreateCustomerDTO): Promise<void> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    return this.Dealernet.customer.updateCustomer(integration.dealernet, dto);
  }
}
