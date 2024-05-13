import { BadRequestException, Injectable } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { CustomerFilter } from './filters/customer.filter';

@Injectable()
export class CustomerService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dialernet: DealernetService
  ) {}

  async find(client_id: string, filter: CustomerFilter): Promise<any> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    if (filter.id) {
      return this.dialernet.customer.findById(integration.dealernet, filter.id);
    } else if (filter.document) {
      return this.dialernet.customer.findByDocument(integration.dealernet, filter.document);
    } else {
      throw new BadRequestException('Invalid filter');
    }
  }
}
