import { BadRequestException, Injectable } from '@nestjs/common';

import { DealernetService } from 'src/dealernet/dealernet.service';
import { ProdutoDealernetResponse } from 'src/dealernet/response/produto-response';
import { PetroplayService } from 'src/petroplay/petroplay.service';

import { ProductFilter } from './filters/product.filter';

@Injectable()
export class ProductService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService,
  ) {}

  async find(client_id: string, filter: ProductFilter): Promise<ProdutoDealernetResponse[]> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration.dealernet) throw new BadRequestException('Integration not found');

    return this.dealernet.product.find(integration.dealernet, filter);
  }
}
