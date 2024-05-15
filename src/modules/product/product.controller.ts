import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { ProductService } from './product.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductFilter } from './filters/product.filter';
import { ProdutoDealernetResponse } from 'src/dealernet/response/produto-response';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}
  @Get(':client_id')
  @ApiResponse({ status: 200, type: ProdutoDealernetResponse, isArray: true })
  @ApiOperation({
    summary: 'Busca uma lista de produtos baseado nos filtros informados ',
  })
  async find(
    @Param('client_id', ParseUUIDPipe) client_id: string,
    @Query() filter: ProductFilter
  ): Promise<ProdutoDealernetResponse[]> {
    return this.service.find(client_id, filter);
  }
}
