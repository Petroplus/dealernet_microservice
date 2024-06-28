import { BadRequestException, Injectable } from '@nestjs/common';

import { petroplay } from 'src/commons/web-client';

import { PetroplayCustomerEntity } from './entity/customer.entity';
import { PetroplayCustomerFilter } from './filters/customer.filter';

export class PetroplayCustomerService {
  async find(filter: PetroplayCustomerFilter): Promise<PetroplayCustomerEntity[]> {
    const client = await petroplay.v2();
    const { data } = await client.get(`/v2/customers`, { params: filter });
    return data?.items ?? [];
  }

  async findByDocument(client_id: string, document: string): Promise<PetroplayCustomerEntity> {
    const customers = await this.find({ client_ids: [client_id], documents: [document] });

    return customers.find((x) => x.document == document);
  }
}
