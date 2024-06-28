import { BadRequestException, Injectable } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { DealernetServiceTMOResponse } from 'src/dealernet/service/response/service.response';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { ServiceFilter } from './filters/service.filter';

@Injectable()
export class ServiceService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
  ) {}
  async find(client_id: string, filter: ServiceFilter): Promise<DealernetServiceTMOResponse[]> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    const services = await this.dealernet.service.find(integration.dealernet, filter);

    return services;
  }
}
