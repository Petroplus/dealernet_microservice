import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DealernetService } from 'src/dealernet/dealernet.service';
import { PetroplayService } from 'src/petroplay/petroplay.service';
import { ProductFilter } from './filters/product.filter';
import { isArray } from 'class-validator';
import { ProdutoDealernetResponse } from 'src/dealernet/response/produto-response';

@Injectable()
export class ProductService {
  constructor(
    private readonly petroplay: PetroplayService,
    private readonly dealernet: DealernetService
  ) {}

  async find(client_id: string, filter: ProductFilter): Promise<ProdutoDealernetResponse[]> {
    const integration = await this.petroplay.integration.findByClientId(client_id);
    if (!integration) throw new BadRequestException('Integration not found');

    let products = await this.dealernet.product.find(integration.dealernet, filter);
    if (!isArray(products)) {
      if (products.Mensagem) {
        throw new BadRequestException(products.Mensagem);
      }
      products = [products];
    }
    const filteredProducts = products.filter((product) => product.QuantidadeDisponivel >= 1);
    if (filteredProducts.length === 0) {
      throw new NotFoundException(`Não encontrado produto disponivel no estoque`);
    }
    return filteredProducts;
  }
}
