import { BadRequestException, HttpException, Injectable } from '@nestjs/common';

import { petroplay } from 'src/commons/web-client';

import { IntegrationDealernetVehicle, IntegrationResponse } from './entities/integration.entity';
import { IntegrationFilter } from './filters/integration.filter';

@Injectable()
export class PetroplayIntegrationService {
  async find(filter: IntegrationFilter): Promise<IntegrationResponse[]> {
    const client = await petroplay.v2();
    const { data } = await client.get(`/v2/integrations?dms=DEALERNET`, { params: filter }).catch((error) => {
      throw new HttpException(error.response.data, error.response.status);
    });
    return data ?? [];
  }

  async findByClientId(client_id: string, expand?: ['dealernet.vehicles']): Promise<IntegrationResponse> {
    const client = await petroplay.v2();
    const query = expand?.map((item) => `expand[]=${item}`).join('&');
    return client
      .get<IntegrationResponse>(`/v2/integrations/${client_id}?${query}`)
      .then((response) => response.data)
      .catch((error) => {
        throw new BadRequestException(error.response?.data ?? error.message);
      });
  }

  async findVehicles(client_id: string): Promise<IntegrationDealernetVehicle[]> {
    const client = await petroplay.v2();
    return client
      .get(`/v2/integrations/${client_id}/dealernet/vehicles`)
      .then((response) => response.data)
      .catch((error) => {
        throw new BadRequestException(error.response?.data ?? error.message);
      });
  }
}
