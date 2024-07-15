import { Injectable } from '@nestjs/common';

import { HttpClientService } from 'src/http-client/http-client.service';

import { PetroplayClientOsTypeResponse } from './response/client-os-type.response';

@Injectable()
export class PetroplayClientService {
  constructor(private httpClient: HttpClientService) {}

  async findOsTypes(client_id: string): Promise<PetroplayClientOsTypeResponse[]> {
    const client = await this.httpClient.v2();

    return client.get(`/v2/clients/${client_id}/os-types`).then(({ data }) => data);
  }
}
